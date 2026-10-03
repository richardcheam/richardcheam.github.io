---
title: "Making model startup reproducible on GH200"
date: 2026-10-03
category: "inference-engineering"
series_order: 5
excerpt: "I compared weight-backend footprints and fixed a rank-incomplete autotune cache so a historical serving profile could start with validated artifacts."
question: "Why did one backend fail before KV allocation, and why did a saved tuning cache miss a rank?"
my_work: "I investigated weight representations and rank-specific autotune persistence in the historical MiMo serving profile."
result: "The selected path loaded at about 83 GiB per rank; complete tuning persistence yielded 84 records across two ranks."
evidence_limit: "These are version-specific, report-backed results, not a measured startup speedup or a current upstream recommendation."
---

<article class="note-article" markdown="1">

<p><a class="notes-backlink" href="{{ '/blog/' | relative_url }}">Back to Blog</a></p>
<p class="note-meta">Inference Engineering • Field note 05 • {{ page.date | date: "%d %b %Y" }} • 7 min read</p>

{% include blog-at-a-glance.html %}

On GH200, a quantized checkpoint that looked small enough on disk still failed while its serving backend prepared weights. In another startup path, a cache existed but lacked the tuned records for one expert-parallel rank. Both incidents changed how I think about “startup”: **the files, generated artifacts, and chosen backend representation are part of the runtime profile, not a one-time prelude.**

## The failing phase determines the memory question

Checkpoint size is not peak startup memory. Loading can create a backend-specific representation, packing buffers, conversion workspaces, and later graph or KV reservations. A lower KV-memory target cannot rescue a failure that occurs before the engine has begun allocating KV.

The historical MiMo v2.6 backend investigation recorded three distinct outcomes on a tensor-parallel serving profile:

| Backend path | Reported outcome | What it established |
| --- | --- | --- |
| Marlin preparation | About **145.9 GiB per rank** at the failing preparation stage | Representation and temporary work exceeded the available budget before KV creation |
| Triton path | Activation compatibility rejection | A memory-only fix would not make this path valid |
| FlashInfer CUTLASS | Loaded at about **83 GiB per rank** | This historical representation fit and enabled the validated B0 serving profile |

These are report-backed observations from a pinned historical image, not a current backend leaderboard. They also do not isolate the gain from a single flag. The practical diagnostic is to record *where* the allocation fails—load, packing, profiling, graph capture, or KV reservation—before adjusting a budget for a later phase.

A separate GLM quantized-and-speculative track reinforced the boundary between weights and request state. Its planning record reported about **338,624 GPU KV tokens** under one tensor-parallel configuration: fitting quantized weights did not remove the KV budget for long requests. The exact model revision, engine build, and output/request counts were not recovered well enough to make its recalled throughput figure a benchmark result, so I use this track only for the capacity lesson.

## A rank-specific cache must be complete

The next problem involved expert-parallel autotuning. A persisted cache with **42** genuine records covered one rank, but a second rank needed its own keys. Rank zero could find a tuned entry while rank one missed or fell back. The local workaround generated and persisted genuine records for both ranks—**84 total, 42 per rank**—before a cache-only real startup. The report recorded cache hits on both ranks in that historical profile.

Copying a rank-zero record and changing its key would not show that its tactic had been tuned or validated for rank one. The cache must agree with the actual backend, shapes, version, and rank identity. [FlashInfer's autotuning documentation](https://docs.flashinfer.ai/autotuning.html) describes public persistence concepts; it does not certify that this older local workaround is required or suitable for today's stack.

```text
rank 0 shapes and key ──► tuned record 0 ┐
                                         ├─► validated cache-only startup
rank 1 shapes and key ──► tuned record 1 ┘
```

## Faster startup has fixed constraints

Graph capture, compilation, and tuning can make initialization expensive because they prepare a serving configuration that may be faster later. An eager launch or fewer captures might reduce startup time while changing throughput, coverage, or KV capacity. That would answer a different objective. [vLLM's CUDA Graphs design documentation](https://docs.vllm.ai/en/stable/design/cuda_graphs/) describes why graph modes cover different execution shapes.

For this work, the constraint was to keep runtime performance, quality, features, graph coverage, and KV capacity while removing avoidable repeated startup work. One separate report recorded about **69 seconds of graph capture** in a historical profile. It was a phase observation, **not** an A/B-proven startup improvement. Another raw startup log warned that referenced compiled artifacts were missing; the archive does not establish their performance impact or a verified repair.

<div class="note-callout note-callout--pitfall" markdown="1">
**Validation rule:** a populated cache directory and an HTTP-ready process are insufficient. Check the expected rank-specific hits, effective graph path, KV capacity, and the same serving workload after restart.
</div>

I can attribute the historical cache completeness repair and backend selection to the local integration work. I cannot infer that the workaround is needed on current upstream code, that all compilation artifacts were reused, or that an unmeasured startup speedup occurred. Those boundaries are part of the result.

<div class="note-related" markdown="1">

## Continue the series

- Previous: [How I corrected misleading inference benchmarks]({{ '/blog/benchmark-denominators/' | relative_url }})
- Next: [What a long-context stress test revealed]({{ '/blog/throughput-versus-usable-latency/' | relative_url }})

</div>

</article>
