---
title: "High throughput, minutes of waiting"
date: 2026-10-03
category: "inference-engineering"
read_time: "6 min"
series_order: 6
series: dual-gh200
featured: true
excerpt: "A long-context soak kept producing output while first-token latency made interactive use difficult."
question: "Could a server keep completing long requests while interactive latency became unusable?"
my_work: "I measured a sustained long-context soak and reconciled KV capacity, waiting requests, throughput, and outcomes."
result: "The archive recorded 2,252 completed successes and 1,267.90 output tokens/s, with 550.876 s median first-token wait."
evidence_limit: "Thirty-eight in-flight outcomes remained unknown; reported latency covers completed requests only."
lesson: "Aggregate throughput and completion counts must be reported alongside first-token latency and unresolved outcomes."
---

<article class="note-article" markdown="1">

I wanted to know whether a server could keep completing long requests while becoming too slow for an interactive conversation. A high output rate would answer only part of that question. I also needed to measure how long each caller waited before the first output appeared.

I tested a MiMo serving profile on dual GH200 hardware, using vLLM and its configured speculative decoder. My work was deployment, integration, and measurement; the model, engine, and decoder came from their respective projects. This was a historical stress test, not a measurement of a current production service.

## What the soak actually asked the server to do

The fixed stress recipe was:

- **Input:** 131,072 tokens per request.
- **Output target:** 16,384 tokens per request.
- **Client load:** up to 62 outstanding requests.
- **Submission schedule:** eight hours.

The request recipe stayed fixed during the eight-hour submission schedule. The client kept supplying work rather than letting the server empty its queue. Outstanding requests could be running or waiting; 62 was the client limit, not a count of requests all executing at once.

The key-value (KV) cache holds attention state that the model reuses while generating a response. The matching recovery startup reported **2,947,463 logical KV cache tokens** of engine capacity, counted once across the distributed profile, and **40.15/41.45 GiB** of KV allocation on its two ranks. These startup allocations describe the reserved pool, not how much request state occupied it at every moment.

One full request budget is **147,456 tokens**. Dividing the reported logical KV capacity by that maximum yields about **20 full-budget request equivalents**. That is a planning ratio, not a measurement that exactly 20 requests must always run. State grows as requests generate output, and output can stop early. Scheduling and preemption, where a request is paused to make room for other work, also change which state is resident. The client-side 62 outstanding requests were not 62 simultaneous full-budget residents.

<p class="capacity-equation"><span>2,947,463 logical KV tokens</span> ÷ <span>147,456 maximum tokens per request</span> ≈ <strong>20 full-budget equivalents</strong></p>

The archive showed persistent waiting and high KV pressure: maximum sampled occupancy of the reserved KV pool was about **99.97%**. That is the fraction of the engine's pool occupied by request state, not the fraction of all GPU high-bandwidth memory (HBM) in use. As requests finished, their KV space became reusable, but the client continued supplying requests. The archive continued to show waiting requests. This pattern is consistent with sustained capacity pressure. The records do not separate queue time from prefill, the work of processing an input before generation, so they do not establish how much of each wait came from either source.

A separate million-token probe also had long first-token waits with substantially lower KV occupancy. Its full setup is not presented here, so I use it only as a reminder that spare KV space alone does not guarantee a quick response.

## Throughput and latency must appear together

For that fixed stress workload, the server completed **2,252 requests**. Its aggregate output rate counts tokens produced across requests together, using the recorded **29,100.679-second denominator**. It does not measure the generation speed experienced by one caller.

Time to first token (TTFT) is the wait from submitting a request until its first output appears. Among completed requests, TTFT was **550.876 seconds at p50**, the median, and **567.503 seconds at p95**, the 95th percentile. Median end-to-end time was **818.576 seconds**, about 13.6 minutes. The typical completed caller waited about 9.2 minutes just to see the first token. The server remained operational, but that was too slow for an interactive conversation.

<figure class="blog-wait-figure">
  <p class="figure-label">Historical soak · completed requests only</p>
  <p class="wait-number">9 <span>min</span> 11 <span>s</span></p>
  <figcaption>Median wait before first output. The exact archived value is 550.876 seconds; unfinished requests are outside this percentile. Source: canonical pack, EXP-GH200-1118 / SRC-05.</figcaption>
</figure>

<div class="blog-table-scroll" role="region" aria-label="Historical soak measurements" tabindex="0" markdown="1">

| Historical soak measure | Archived observation |
| --- | ---: |
| Completed successful rows | 2,252 |
| Observed failed rows | 0 |
| In-flight outcomes unknown at last sample | 38; drain incomplete |
| Output rate | 1,267.90 output tokens/s |
| Recorded rate denominator | 29,100.679 s |
| TTFT among completed requests | p50 550.876 s · p95 567.503 s |

</div>

The submission timer and later finalization timestamps do not align cleanly in the surviving archive, so I retain the recorded denominator rather than calculate a replacement. Source: canonical pack, EXP-GH200-1118 / SRC-05.

A separate B0 benchmark asked what happened when more clients shared the MiMo v2.6 reference profile on dual GH200. The request sizes stayed at **128 input / 512 output tokens**, while outstanding clients increased from **16** to **32**. The C32 point used a sequence limit of 16. The surviving comparison does not give the elapsed duration of each point, and it is not a matched comparison with the long-context soak.

With 16 clients, the report recorded **1,018.93 output tokens/s** and **0.177-second median TTFT**. With 32, output rate was **1,021.06 tokens/s** and median TTFT was **7.788 seconds**. The graph separates the two metrics. C16 and C32 mean outstanding client counts; they are not request completion positions. Each panel uses its own scale.

<figure class="blog-figure blog-figure--wide" tabindex="0">
  <img src="{{ '/assets/blog/b0-saturation.svg' | relative_url }}" alt="Two aligned B0 panels: output rate is nearly unchanged from C16 to C32, while median time to first token rises from 0.177 to 7.788 seconds." loading="lazy">
  <figcaption><strong>Figure 1 · Saturation in the separate B0 reference profile.</strong> Reconstructed from reported values, EXP-GH200-023 and 025 / SRC-03. Each panel has its own labelled units and scale; C is client-outstanding count. The C32 point used a sequence limit of 16. This is not part of the long-context soak.</figcaption>
</figure>

Output rate barely changed, but the median first-token wait grew from less than a fifth of a second to nearly eight seconds. Request sizes stayed the same. The pattern suggests that adding clients at this point mainly added waiting rather than useful output capacity; these two points alone do not identify the exact scheduling mechanism.

This is why I report client-outstanding, running, and waiting counts separately. Dividing aggregate output tokens/s by a configured concurrency value does not measure an individual's decode speed when some clients spend most of their time waiting.

## A completed subset is not every submitted request

The soak archive contains **zero observed failed rows** and **2,252 completed successes**. At the last monitor sample, **38 requests were still running or waiting**, and the drain did not complete. Their eventual outcomes are unknown. I do not count them as successes or failures. The latency percentiles cover completed requests only and may omit the slowest requests.

A separate very-long-input probe also lost service after a small completed subset; its root cause was not established and cannot be generalized to every long request.

Three capacity limits need separate names:

- **Model context limit:** the supported token budget for one request.
- **KV pool size:** the available storage for resident request state across the serving profile.
- **Accepted client connections:** the requests the service accepts, including requests that may wait rather than run.

Usable service also needs a first-token latency target and an explicit policy for admitting heavy work.

The practical next step would be to measure queue time and prefill separately, then admit interactive and long background work against a defined latency objective. That is a proposed operating policy, not an optimization shown to be deployed by these results. The historical soak proves that the engine could continue completing a large number of requests under pressure; it also shows why completion and peak output rate were insufficient measures of user experience.

<div class="note-related" markdown="1">

## Continue the series

- Previous: [Why model startup needs a fitting backend and complete artifacts]({{ '/blog/startup-artifacts-runtime-contract/' | relative_url }})
- Next: [When the container stays alive but inference stops]({{ '/blog/inference-workload-lifecycle/' | relative_url }})

</div>

</article>
