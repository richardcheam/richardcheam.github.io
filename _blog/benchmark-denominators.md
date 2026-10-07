---
title: "Benchmark numbers that misled me and how I corrected them"
date: 2026-10-03
category: "evaluation"
read_time: "8 min"
series_order: 2
series: dual-gh200
excerpt: "I reconciled token counts, prompt lengths, cache reuse, and unfinished requests before comparing GH200 serving runs."
question: "Which counters and workloads made a benchmark number look faster than the serving experience?"
my_work: "I rechecked token-versus-chunk accounting, prompt lengths, prefix reuse, denominators, and incomplete outcomes."
result: "One long-input run reported 111.22 output tokens/s and 14,346.87 total tokens/s from the same requests."
evidence_limit: "Some recovered run families remain separate; the original raw files for one derived comparison were unavailable."
lesson: "Define token counts, workload, cache state, and observation interval before comparing rates."
---

<article class="note-article" markdown="1">

An inference benchmark can produce a precise number and still answer the wrong question. I learned to read every “tokens per second” headline as an unfinished sentence: **which tokens, over which time interval, for which requests?**

I reviewed historical serving reports from dual-GH200 hardware to ask which benchmark comparisons were actually valid. Prompt lengths, streaming behavior, prefix-cache state, and client concurrency changed between run families. I reconstructed those differences before interpreting their rates. These are recovered reports, not fresh reruns. Where a report lacks an elapsed duration or complete configuration, I keep that gap visible rather than infer it from the rate.

Three profile names appear below:

- **B0:** the report-backed MiMo v2.6 reference serving profile.
- **P1:** a later MiMo expansion with separate client and archive evidence. Some short-run values survive only as a derived comparison.
- **E16:** a report-backed DeepSeek V4.1 reference profile, separate from the early V4.1 startup incident in [article 1]({{ '/blog/grace-hopper-file-cache/' | relative_url }}).

None is a controlled variant of every other profile.

## “Tokens per second” has more than one numerator

For completed requests during a defined interval *T*, two useful aggregate rates are:

```text
output-token rate = sum(actual output tokens) / T
total-token rate  = sum(input tokens + actual output tokens) / T
```

Both can be valid. They measure different work. As an illustration, suppose ten requests each have 1,000 input tokens and 100 output tokens, and the measured interval is ten seconds. Output rate is 100 tokens/s; total-token rate is 1,100 tokens/s. Quoting the second number as generation speed would be misleading. Record whether the timer includes queueing, warmup, drain, or only a steady window.

To check whether a large token rate meant fast generation, I compared two counters from the same historical long-input run on dual GH200. It used **65,536 input tokens**, a **512-token output target**, **one outstanding client**, and **four requests**. The nominal request sizes stayed fixed. The surviving summary does not identify a complete model revision or elapsed duration for this example.

The report recorded **111.22 output tokens/s** and **14,346.87 input-plus-output tokens/s**. Nothing about the requests changed between these two numbers; only the numerator changed. Most of the larger count came from input tokens, so it did not mean that a caller received generated output at 14,346.87 tokens/s.

The report also gave a **mean** time to first token (TTFT), the wait before first output, of **3.719 s** and a **mean** time per output token (TPOT) of **1.73 ms**. A caller first waited several seconds, then received output at the reported post-first-token pace. These are means, not medians, so I keep that distinction when comparing tests.

Actual output is also different from requested `max_tokens`. A client may ask for 1,000 and receive 80. Counting the configured maximum inflates the numerator. For server-side token accounting, use tokenizer or response-usage counts that match the measured requests. Character counts and byte lengths are not token counts.

## A stream event is not necessarily one token

Streaming clients observe events or chunks. A speculative decoder may verify multiple tokens before emitting a chunk, and transport buffering can change event boundaries. Counting chunks as tokens therefore makes both throughput and inter-event timing hard to interpret.

The latency names describe different intervals:

- **TTFT, time to first token:** the wait until first output.
- **TPOT, time per output token:** usually the time *after* the first output, amortized over the remaining generated tokens.
- **ITL, inter-token latency:** gaps between output events or tokens, depending on the tool.

Under bundled streaming, an event gap is not automatically a per-token delay. These definitions need to travel with any chart, as the [vLLM benchmark CLI documentation](https://docs.vllm.ai/en/latest/benchmarking/cli/) illustrates.

<figure class="blog-figure blog-figure--wide">
  {% include blog-figures/benchmark-timing.html alt="Conceptual request timeline: submission to first output is TTFT; first output to completion is the post-first-output interval. A stream chunk can contain more than one token." %}
  <figcaption><strong>Figure 1 · Two different waits.</strong> Conceptual timing diagram, not a measured request trace. Streaming events can bundle multiple tokens, so an event gap is not necessarily a per-token gap.</figcaption>
</figure>

The diagram separates the initial wait from generation after the first output. It is a conceptual timeline, so its spacing is not measured elapsed time. A shorter TPOT would improve the later part of a response without necessarily shortening its initial wait.

The B0 long-prompt series also asked whether accepting more speculative draft tokens meant faster output. The MiMo v2.6 reference profile ran on dual GH200 with **8K, 16K, and 24K inputs**, a **512-token output target**, and **16 outstanding clients**. Input length changed; the nominal output target and client limit stayed fixed. The summary does not give an elapsed duration for each point.

Acceptance improved slightly at the 24K input point, but median TPOT rose from roughly **16 ms** at 8K and 16K to **30.12 ms**. The draft model, target verification, longer attention state, and scheduling all cost time. Better acceptance therefore did not imply a faster user-visible decode in that run; the records do not isolate which cost caused the increase.

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

For the cold-prompt comparison in B0, I wanted to check how waiting and output changed as inputs grew without reusing the same prompt prefix. The report used unique seeds after a prefix-reuse correction. Input length changed from **8K to 16K to 24K tokens**; the **512-token output target** and **16 outstanding clients** stayed fixed within that MiMo serving profile.

Median TTFT was **2.383, 5.486, and 10.202 seconds**, respectively. Aggregate output rates were **646.35, 546.29, and 312.16 tokens/s**. Longer inputs came with both a longer initial wait and less output completed per second. The comparison shows that pattern within B0; it does not isolate every contributing cost or extend into the later P1 profile.

### Supplementary cross-profile comparisons

For a cross-profile comparison on dual GH200, the nominal request settings were **128 input / 512 output tokens** and **16 clients**. The serving model and runtime profile changed: DeepSeek V4.1 E16 was compared with MiMo v2.6 B0. The available summary does not supply matched elapsed durations or complete request counts for these points.

E16 reported **500.34** and **500.96 output tokens/s** in two runs, for a simple mean of **500.65**. B0 reported **1,018.93 output tokens/s**. That roughly **2.04× systems ratio** compares two reported serving profiles; model architecture, backend, KV format, and speculative path differed. It is neither a model-quality ranking nor an isolated gain from one optimization.

For the P1 comparison, I checked whether a reported concurrency ladder was really a long-context test. It was a later MiMo profile on dual GH200 using **128-token inputs**, not the **16K-token inputs** attached to it in a summary. The output target stayed at 512 tokens. Concurrency changed from C16 through C128, and the highest point used **512 requests**, while lower points used **128**. The workload therefore changed in more than one dimension.

The derived rates ranged from **1,856.96 to 5,191.72 output tokens/s**. The table preserves those reported points, but they cannot be used as long-context results. The original raw files and exact timing records were not recovered for this family.

<div class="blog-table-scroll" role="region" aria-label="Derived P1 comparison" tabindex="0" markdown="1">

| Derived P1 point, 128 input / 512 output target | Requests | Output tokens/s |
| --- | ---: | ---: |
| C16 | 128 | 1,856.96 |
| C32 | 128 | 2,478.55 |
| C64 | 128 | 3,321.96 |
| C128 | 512 | 5,191.72 |

</div>

Source: canonical pack, EXP-GH200-2001/2005/2007/2009, derived comparison.

A later raw archive gave **1,756.34 output tokens/s** at a nominal **128-input / 512-output, 128-client, 512-request** point, far below the derived comparison's **5,191.72**. The run families used different archived recipes and timing behavior; the surviving records do not establish a cause for the gap. Averaging them or calling the difference a regression would manufacture an experiment that was never run.

## Count the requests you did not observe finishing

Consider a test that submitted 100 requests before its observation window ended: 80 completed successfully, five failed, and 15 were still running. “80 successes and five failures” is accurate for observed outcomes. “94% success” silently uses only 85 completed outcomes and says nothing about the 15 unfinished requests. A full report should state the submitted population, completion fraction, observation window, and the disposition of the unfinished tail.

The same boundary applies to latency percentiles. A p95 calculated only from completed requests is a *completion-conditioned* p95. If long requests are more likely to remain unfinished, that percentile can look better than the experience of the submitted population.

The archived long-context soak provides a measured example. It ran a fixed MiMo stress recipe on dual GH200: **131,072 input tokens**, a **16,384-token output target**, up to **62 outstanding requests**, and an **eight-hour submission schedule**. It was a separate workload and runtime profile from the cold-prompt comparison.

It recorded **2,252 successful completed rows** and **zero observed failed rows**. **38 requests were still running or waiting at the last monitor sample**, and the drain was incomplete, so their eventual outcomes are unknown. Its recorded output rate was **1,267.90 tokens/s** over **29,100.679 seconds**; median TTFT among completed requests was **550.876 seconds**, about 9.2 minutes. Continued output showed the engine was doing work, but that wait was too long for an interactive conversation. The unfinished requests are outside those percentiles.

### A benchmark line worth keeping

Before publishing a result, I would check that it includes each of these fields:

<div class="benchmark-template editorial-checklist" markdown="1">
- **Profile and evidence:** model, runtime, backend, version, record ID, historical or rerun.
- **Workload:** actual input/output tokens, output target, request count, client-outstanding count, arrival pattern.
- **State:** warm or cold, prompt/prefix reuse, observation window and drain status.
- **Rate:** output or input-plus-output numerator, exact elapsed-time denominator.
- **Latency and outcomes:** TTFT/TPOT definition, mean or percentile, completed population, failed and unresolved requests.
</div>

With these details, another engineer can tell what was measured, which comparisons are valid, and where the evidence stops.

<div class="note-related" markdown="1">

## Continue the series

- Previous: [When Linux file cache occupies GPU memory]({{ '/blog/grace-hopper-file-cache/' | relative_url }})
- Next: [NUMA locality: configuration versus proof]({{ '/blog/gh200-locality-evidence/' | relative_url }})

</div>

</article>
