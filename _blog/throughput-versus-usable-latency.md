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

The long-context server kept producing output, but a caller could wait minutes before seeing any of it. In the archived soak, **2,252 requests completed** while median time to first token (TTFT) among those completions exceeded nine minutes. The output rate alone concealed that experience.

<figure class="blog-wait-figure">
  <p class="figure-label">Historical soak · completed requests only</p>
  <p class="wait-number">9 <span>min</span> 11 <span>s</span></p>
  <figcaption>Median wait before first output. The exact archived value is 550.876 seconds; unfinished requests are outside this percentile. Source: canonical pack, EXP-GH200-1118 / SRC-05.</figcaption>
</figure>

{% include blog-at-a-glance.html %}

The work here was deployment, integration, and measurement of a MiMo serving profile on dual GH200 hardware. The model, vLLM engine, and speculative decoder were supplied by their respective projects. These numbers describe a historical stress workload, not a general rating for the hardware or a current production service.

## What the soak actually asked the server to do

The fixed stress recipe was:

- **Input:** 131,072 tokens per request.
- **Output target:** 16,384 tokens per request.
- **Client load:** up to 62 outstanding requests.
- **Submission schedule:** eight hours.

The matching recovery startup reported **2,947,463 logical key-value (KV) cache tokens** of engine capacity, counted once across the distributed profile, and **40.15/41.45 GiB** of KV allocation on its two ranks.

One full request budget is **147,456 tokens**. Dividing the reported logical KV capacity by that maximum yields about **20 full-budget request equivalents**. That is a planning ratio, not a measurement that exactly 20 requests must always run. State grows over time, output can stop early, and scheduling and preemption change residency. The client-side 62 outstanding requests were not 62 simultaneous full-budget residents.

<p class="capacity-equation"><span>2,947,463 logical KV tokens</span> ÷ <span>147,456 maximum tokens per request</span> ≈ <strong>20 full-budget equivalents</strong></p>

The archive showed high KV pressure and persistent waiting; maximum sampled managed-KV occupancy was about **99.97%**. That percentage refers to the engine's KV pool, not all HBM. A separate million-token probe had long first-token waits even with substantially lower KV occupancy, showing why spare KV alone does not promise short TTFT. The records do not split every wait into queueing versus prefill compute, so I do not assign a single cause to each minute.

## Throughput and latency must appear together

The soak's recorded output rate used a **29,100.679-second denominator**. Among completed requests, TTFT was **550.876 seconds at p50** and **567.503 seconds at p95**; end-to-end time was **818.576 seconds at p50**. These figures show continued service under a severe workload and poor interactive response time at the same time.

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

A smaller B0 benchmark had already shown the shape of saturation on a different profile. At **128 input / 512 output tokens** with **16 outstanding clients**, it reported **1,018.93 output tokens/s** and **0.177-second median TTFT**. At **32 outstanding clients**, output rate was essentially flat at **1,021.06 tokens/s** while median TTFT rose to **7.788 seconds**. That comparison belongs to the B0 reference profile; it is not a matched A/B with the later long-context soak.

<figure class="blog-figure blog-figure--wide" tabindex="0">
  <img src="{{ '/assets/blog/b0-saturation.svg' | relative_url }}" alt="Two aligned B0 panels: output rate is nearly unchanged from C16 to C32, while median time to first token rises from 0.177 to 7.788 seconds." loading="lazy">
  <figcaption><strong>Figure 1 · Saturation in the separate B0 reference profile.</strong> Reconstructed from reported values, EXP-GH200-023 and 025 / SRC-03. Each panel has its own labelled units and scale; C is client-outstanding count. The C32 point used a sequence limit of 16. This is not part of the long-context soak.</figcaption>
</figure>

This is why I report client-outstanding, running, and waiting counts separately. Dividing aggregate output tokens/s by a configured concurrency value does not measure an individual's decode speed when some clients spend most of their time waiting.

## A completed subset is not every submitted request

The soak archive contains **zero observed failed rows** among the **2,252 completed successes**. At the last monitor sample, **38 in-flight outcomes remained unknown**, and the drain did not complete. Those requests are not proven successes or failures. The latency percentiles are conditioned on completed requests and may miss the slowest tail.

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
