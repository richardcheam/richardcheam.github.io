---
title: "What a long-context stress test revealed"
date: 2026-10-03
category: "inference-engineering"
series_order: 6
excerpt: "I stress-tested long-context MiMo serving: 2,252 requests completed, but the median first-token wait for those completions exceeded nine minutes."
question: "Could a server keep completing long requests while interactive latency became unusable?"
my_work: "I measured a sustained long-context soak and reconciled KV capacity, waiting requests, throughput, and outcomes."
result: "The archive recorded 2,252 completed successes and 1,267.90 output tokens/s, with 550.876 s median first-token wait."
evidence_limit: "Thirty-eight in-flight outcomes remained unknown; reported latency covers completed requests only."
---

<article class="note-article" markdown="1">

<p><a class="notes-backlink" href="{{ '/blog/' | relative_url }}">Back to Blog</a></p>
<p class="note-meta">Inference Engineering • Field note 06 • {{ page.date | date: "%d %b %Y" }} • 8 min read</p>

{% include blog-at-a-glance.html %}

The sharpest lesson from my GH200 serving tests was that a server can keep producing tokens while becoming unusably slow for an interactive caller. In an archived long-context soak, the service recorded **2,252 completed successes** and **1,267.90 output tokens/s**, yet the **median time to first token for completed requests was 550.876 seconds**—more than nine minutes. A throughput headline alone would have hidden the queue.

The work here was deployment, integration, and measurement of a MiMo serving profile on dual GH200 hardware. The model, vLLM engine, and speculative decoder were supplied by their respective projects. These numbers describe a historical stress workload, not a general rating for the hardware or a current production service.

## What the soak actually asked the server to do

The fixed stress recipe used **131,072 input tokens** and a **16,384 output-token target** per request, with up to **62 client-outstanding requests**. Submission was scheduled for eight hours. The matching recovery startup reported **2,947,463 logical KV tokens** of engine capacity, counted once across the distributed profile, and **40.15/41.45 GiB** of KV allocation on its two ranks.

One full request budget is **147,456 tokens**. Dividing the reported logical KV capacity by that maximum yields about **20 full-budget request equivalents**. That is a planning ratio, not a measurement that exactly 20 requests must always run. State grows over time, output can stop early, and scheduling and preemption change residency. The client-side 62 outstanding requests were not 62 simultaneous full-budget residents.

```text
reported logical KV capacity  ≈ 2.95 million tokens
one maximum request budget     = 131,072 input + 16,384 output
full-budget equivalents        ≈ 20
client-outstanding ceiling     = 62 requests
```

The archive showed high KV pressure and persistent waiting; maximum sampled managed-KV occupancy was about **99.97%**. That percentage refers to the engine's KV pool, not all HBM. A separate million-token probe had long first-token waits even with substantially lower KV occupancy, showing why spare KV alone does not promise short TTFT. The records do not split every wait into queueing versus prefill compute, so I do not assign a single cause to each minute.

## Throughput and latency must appear together

The soak's recorded output rate used a **29,100.679-second denominator**. Among completed requests, TTFT was **550.876 seconds at p50** and **567.503 seconds at p95**; end-to-end time was **818.576 seconds at p50**. These figures show continued service under a severe workload and poor interactive response time at the same time.

A smaller B0 benchmark had already shown the shape of saturation on a different profile. At **128 input / 512 output tokens** with **16 outstanding clients**, it reported **1,018.93 output tokens/s** and **0.177-second median TTFT**. At **32 outstanding clients**, output rate was essentially flat at **1,021.06 tokens/s** while median TTFT rose to **7.788 seconds**. That comparison belongs to the B0 reference profile; it is not a matched A/B with the later long-context soak.

This is why I report client-outstanding, running, and waiting counts separately. Dividing aggregate output tokens/s by a configured concurrency value does not measure an individual's decode speed when some clients spend most of their time waiting.

## A completed subset is not every submitted request

The soak archive contains **zero observed failed rows** among the **2,252 completed successes**. At the last monitor sample, **38 in-flight outcomes remained unknown**, and the drain did not complete. Those requests are not proven successes or failures. The latency percentiles are conditioned on completed requests and may miss the slowest tail.

The recorded submission window, throughput timer, and later finalization timestamps do not align cleanly in the surviving archive. I retain the recorded output rate with its stated denominator rather than inventing a corrected rate. A separate very-long-input probe also lost service after a small completed subset; its root cause was not established and cannot be generalized to every long request.

<div class="note-callout note-callout--definition" markdown="1">
**Capacity lesson:** a model's context limit, the KV pool size, and the number of accepted client connections are three different limits. Usable service also needs a first-token latency target and an explicit policy for admitting heavy work.
</div>

The practical next step would be to measure queue time and prefill separately, then admit interactive and long background work against a defined latency objective. That is a proposed operating policy, not an optimization shown to be deployed by these results. The historical soak proves that the engine could continue completing a large number of requests under pressure; it also shows why completion and peak output rate were insufficient measures of user experience.

<div class="note-related" markdown="1">

## Continue the series

- Previous: [Making model startup reproducible on GH200]({{ '/blog/startup-artifacts-runtime-contract/' | relative_url }})
- Next: [Keeping an inference service alive and recoverable]({{ '/blog/inference-workload-lifecycle/' | relative_url }})

</div>

</article>
