---
title: "Benchmark numbers that misled me—and how I corrected them"
date: 2026-10-03
category: "evaluation"
read_time: "8 min"
series_order: 2
excerpt: "I reconciled token counts, prompt lengths, cache reuse, and unfinished requests before comparing GH200 serving runs."
question: "Which counters and workloads made a benchmark number look faster than the serving experience?"
my_work: "I rechecked token-versus-chunk accounting, prompt lengths, prefix reuse, denominators, and incomplete outcomes."
result: "One long-input run reported 111.22 output tokens/s and 14,346.87 total tokens/s from the same requests."
evidence_limit: "Some recovered run families remain separate; the original raw files for one derived comparison were unavailable."
lesson: "Define token counts, workload, cache state, and observation interval before comparing rates."
---

<article class="note-article" markdown="1">

An inference benchmark can produce a precise number and still answer the wrong question. I learned to read every “tokens per second” headline as an unfinished sentence: **which tokens, over which time interval, for which requests?**

{% include blog-at-a-glance.html %}

This became especially important when I compared runs with different prompt lengths, streaming behavior, prefix-cache state, and client concurrency. Several apparent performance stories changed once I reconstructed the denominator and workload. The figures identified as historical below come from recovered run records and reports; they are not fresh reruns.

Three profile names appear below. **B0** is the report-backed MiMo v2.6 reference serving profile. **P1** is a later MiMo expansion with separate client and archive evidence; some short-run values survive only as a derived comparison. **E16** is a report-backed DeepSeek V4.1 reference profile, separate from the early V4.1 startup incident in [article 1]({{ '/blog/grace-hopper-file-cache/' | relative_url }}). None is a controlled variant of every other profile.

## “Tokens per second” has more than one numerator

For completed requests during a defined interval *T*, two useful aggregate rates are:

```text
output-token rate = sum(actual output tokens) / T
total-token rate  = sum(input tokens + actual output tokens) / T
```

Both can be valid. They measure different work. As an illustration, suppose ten requests each have 1,000 input tokens and 100 output tokens, and the measured interval is ten seconds. Output rate is 100 tokens/s; total-token rate is 1,100 tokens/s. Quoting the second number as generation speed would be misleading. Record whether the timer includes queueing, warmup, drain, or only a steady window.

A historical long-input run made this distinction concrete. With **65,536 input tokens**, a **512-token output target**, **one outstanding client**, and **four requests**, its report recorded **111.22 output tokens/s** but **14,346.87 input-plus-output tokens/s**. The two numbers describe the same run; the larger one is dominated by prompt tokens. The report also gave a **mean** TTFT of **3.719 s** and a **mean** TPOT of **1.73 ms**. Those means should not be silently compared with medians from another test.

Actual output is also different from requested `max_tokens`. A client may ask for 1,000 and receive 80. Counting the configured maximum inflates the numerator. For server-side token accounting, use tokenizer or response-usage counts that match the measured requests. Character counts and byte lengths are not token counts.

## A stream event is not necessarily one token

Streaming clients observe events or chunks. A speculative decoder may verify multiple tokens before emitting a chunk, and transport buffering can change event boundaries. Counting chunks as tokens therefore makes both throughput and inter-event timing hard to interpret.

Time to first token (TTFT) describes the wait until first output. Time per output token (TPOT) usually amortizes time *after* the first output over the remaining generated tokens. Inter-token latency (ITL) describes gaps between output events or tokens, depending on the tool. Under bundled streaming, an event gap is not automatically a per-token delay. These definitions need to travel with any chart, as the [vLLM benchmark CLI documentation](https://docs.vllm.ai/en/latest/benchmarking/cli/) illustrates.

<figure class="blog-figure blog-figure--wide" tabindex="0">
  <img src="{{ '/assets/blog/benchmark-timing.svg' | relative_url }}" alt="Conceptual request timeline: submission to first output is TTFT; first output to completion is the post-first-output interval. A stream chunk can contain more than one token." loading="lazy">
  <figcaption><strong>Figure 1 · Two different waits.</strong> Conceptual timing diagram, not a measured request trace. Streaming events can bundle multiple tokens, so an event gap is not necessarily a per-token gap.</figcaption>
</figure>

An average TPOT cannot by itself describe a user's wait if the request spent a long time queued before its first token.

Draft-token acceptance is another tempting single-number ranking. In the B0 long-prompt series, acceptance improved slightly at the 24K input point while median TPOT rose from roughly **16 ms** at 8K and 16K to **30.12 ms**. The draft model, target verification, longer attention state, and scheduling all cost time. Better acceptance therefore did not imply a faster user-visible decode in that run; the records do not isolate which cost caused the increase.

## Hold the workload still before comparing systems

When I review two runs, I write down the following alongside the headline rate:

<div class="blog-table-scroll" role="region" aria-label="Benchmark comparison checklist" tabindex="0" markdown="1">

| Dimension | Why it changes the result |
| --- | --- |
| Input and actual output lengths | Prefill and decode impose different costs. |
| Request count and concurrency | Outstanding clients can be waiting, running, or draining. |
| Arrival pattern and interval | A fixed-size batch and a sustained arrival stream have different denominators. |
| Prefix reuse and warm caches | Repeated prompts can reuse work that a cold request must perform. |
| Model, tokenizer, backend, and precision | “Same GPU” does not make two serving profiles equivalent. |
| Completion and error counts | Percentiles from completed requests omit unfinished work. |

</div>

One useful check is to rerun cold-prompt cases with distinct seeds or prefixes when prefix caching is enabled. An implausibly faster long prompt can be cache reuse rather than a new scaling property. Likewise, a throughput row with a short input must not be relabeled as a long-context result because another summary remembered it that way.

In one report-backed cold-prompt series, unique seeds were used after a prefix-reuse correction. At **8K, 16K, and 24K input tokens**, each with a **512-token output target** and **16 outstanding clients**, median TTFT was **2.383, 5.486, and 10.202 seconds**. The corresponding output rates were **646.35, 546.29, and 312.16 tokens/s**. Those points belong to one B0 serving profile. They do not form a single scaling curve with a later P1 profile, even though both used the same machine family.

### Supplementary cross-profile comparisons

A separate DeepSeek V4.1 E16 reference reported **500.34** and **500.96 output tokens/s** on two **128-input / 512-output, 16-client** runs, for a simple mean of **500.65**. The B0 profile reported **1,018.93 output tokens/s** on the same nominal input/output and client settings. That roughly **2.04× systems ratio** compares two reported serving profiles; model architecture, backend, KV format, and speculative path differed. It is neither a model-quality ranking nor an isolated gain from one optimization.

I also found a derived comparison in which a **1,856.96 to 5,191.72 output tokens/s** concurrency ladder was associated with **128-token inputs**, not the **16K-token inputs** attached to it in a summary. The highest-concurrency point also used **512 requests**, while lower points used **128**. The corrected workload is the result to report; the original raw files for that derived comparison were not recovered, so I would not use it as a precise long-context headline.

<div class="blog-table-scroll" role="region" aria-label="Derived P1 comparison" tabindex="0" markdown="1">

| Derived P1 point, 128 input / 512 output target | Requests | Output tokens/s |
| --- | ---: | ---: |
| C16 | 128 | 1,856.96 |
| C32 | 128 | 2,478.55 |
| C64 | 128 | 3,321.96 |
| C128 | 512 | 5,191.72 |

</div>

Source: canonical pack, EXP-GH200-2001/2005/2007/2009, derived comparison. The original raw short-run files were not available for this family.

A later raw archive gave **1,756.34 output tokens/s** at a nominal **128-input / 512-output, 128-client, 512-request** point, far below the derived comparison's **5,191.72**. The run families used different archived recipes and timing behavior; the surviving records do not establish a cause for the gap. Averaging them or calling the difference a regression would manufacture an experiment that was never run.

## Count the requests you did not observe finishing

Consider a test that submitted 100 requests before its observation window ended: 80 completed successfully, five failed, and 15 were still running. “80 successes and five failures” is accurate for observed outcomes. “94% success” silently uses only 85 completed outcomes and says nothing about the 15 unfinished requests. A full report should state the submitted population, completion fraction, observation window, and the disposition of the unfinished tail.

The same boundary applies to latency percentiles. A p95 calculated only from completed requests is a *completion-conditioned* p95. If long requests are more likely to remain unfinished, that percentile can look better than the experience of the submitted population.

The archived long-context soak is a real example of this limit. It recorded **2,252 successful completed rows** and **zero observed failed rows**, while **38 requests were still in flight at the last monitor sample** and the drain was incomplete. Its recorded output rate was **1,267.90 tokens/s** over **29,100.679 seconds**; median TTFT among completed requests was **550.876 seconds**. The unknown tail cannot be counted as successes or failures, and the completed-only latency does not describe every submitted request. This was a separate workload and runtime profile from the cold-prompt results above.

### A benchmark line worth keeping

<div class="benchmark-template" markdown="1">
- **Profile and evidence:** model, runtime, backend, version, record ID, historical or rerun.
- **Workload:** actual input/output tokens, output target, request count, client-outstanding count, arrival pattern.
- **State:** warm or cold, prompt/prefix reuse, observation window and drain status.
- **Rate:** output or input-plus-output numerator, exact elapsed-time denominator.
- **Latency and outcomes:** TTFT/TPOT definition, mean or percentile, completed population, failed and unresolved requests.
</div>

This discipline does not make a benchmark less impressive. It makes the result reusable: another engineer can tell what was measured, which comparisons are valid, and where the evidence stops.

<div class="note-related" markdown="1">

## Continue the series

- Previous: [When Linux file cache occupies GPU memory]({{ '/blog/grace-hopper-file-cache/' | relative_url }})
- Next: [NUMA locality: configuration versus proof]({{ '/blog/gh200-locality-evidence/' | relative_url }})

</div>

</article>
