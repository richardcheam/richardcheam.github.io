---
title: "Why model startup needs a fitting backend and complete artifacts"
date: 2026-10-03
category: "inference-engineering"
read_time: "5 min"
series_order: 5
series: dual-gh200
excerpt: "I compared weight-backend footprints and fixed a rank-incomplete autotune cache so a historical serving profile could start with validated artifacts."
question: "Why did one backend fail before KV allocation, and why did a saved tuning cache miss a rank?"
my_work: "I investigated weight representations and rank-specific autotune persistence in the historical MiMo serving profile."
result: "The selected path loaded at about 83 GiB per rank; complete tuning persistence yielded 84 records across two ranks."
evidence_limit: "These are version-specific, report-backed results, not a measured startup speedup or a current upstream recommendation."
lesson: "Backend representation and rank-complete startup artifacts determine whether a serving profile fits and restarts correctly."
---

<article class="note-article" markdown="1">

On GH200, a quantized checkpoint that looked small enough on disk still failed while its serving backend prepared weights. In another startup path, a cache existed but lacked the tuned records for one expert-parallel rank. Both incidents changed how I think about “startup”: **the files, generated artifacts, and chosen backend representation are part of the runtime profile, not a one-time prelude.**

<figure class="blog-figure blog-figure--wide" tabindex="0">
  <img src="{{ '/assets/blog/backend-startup.svg' | relative_url }}" alt="Conceptual startup boundary: checkpoint loading and backend preparation come before later graph and KV work, whose relative order is unspecified. Each expert-parallel rank needs genuine autotune records." loading="lazy">
  <figcaption><strong>Figure 1 · Two startup contracts.</strong> Conceptual boundary between backend preparation and later graph/KV work, plus rank-specific cache completeness, based on the historical MiMo report, FACT-START-001 / SRC-03. The line lengths are not phase timings.</figcaption>
</figure>

{% include blog-at-a-glance.html %}

## The failing phase determines the memory question

Checkpoint size is not peak startup memory. Loading can create a backend-specific representation, packing buffers, conversion workspaces, and later graph or KV reservations. A lower KV-memory target cannot rescue a failure that occurs before the engine has begun allocating KV.

The historical MiMo v2.6 B0 profile used a pinned vLLM development build, reported as <code>0.29.1rc1.dev449+geb8798058</code>, on dual GH200. Tensor parallelism (TP) split model work across two GPU ranks; expert parallelism (EP) placed experts across two ranks. The backend investigation recorded three distinct outcomes in that historical runtime:

<div class="blog-table-scroll" role="region" aria-label="Backend startup outcomes" tabindex="0" markdown="1">

| Backend path | Reported outcome | What it established |
| --- | --- | --- |
| Marlin preparation | About **145.9 GiB per rank** at the failing preparation stage | Representation and temporary work exceeded the available budget before KV creation |
| Triton path | Activation compatibility rejection | A memory-only fix would not make this path valid |
| FlashInfer CUTLASS | Loaded at about **83 GiB per rank** | This historical representation fit and enabled the validated B0 serving profile |

</div>

These are report-backed observations from a pinned historical image, not a current backend leaderboard. They also do not isolate the gain from a single flag. The practical diagnostic is to record *where* the allocation fails—load, packing, profiling, graph capture, or KV reservation—before adjusting a budget for a later phase.

A separate GLM quantized-and-speculative track reinforced the boundary between weights and request state. Its planning record reported about **338,624 GPU KV tokens** under one tensor-parallel configuration: fitting quantized weights did not remove the KV budget for long requests. The exact model revision, engine build, and output/request counts were not recovered well enough to make its recalled throughput figure a benchmark result, so I use this track only for the capacity lesson.

## A rank-specific cache must be complete

The next problem involved expert-parallel autotuning. A persisted cache with **42** genuine records covered one rank, but a second rank needed its own keys. Rank zero could find a tuned entry while rank one missed or fell back. The local workaround generated and persisted genuine records for both ranks—**84 total, 42 per rank**—before a cache-only real startup. The report recorded cache hits on both ranks in that historical profile.

Copying a rank-zero record and changing its key would not show that its tactic had been tuned or validated for rank one. The cache must agree with the actual backend, shapes, version, and rank identity. [FlashInfer's autotuning documentation](https://docs.flashinfer.ai/autotuning.html) describes public persistence concepts; it does not certify that this older local workaround is required or suitable for today's stack.

The two-rank record count is a completeness check, not an invitation to duplicate files: rank 0 and rank 1 each require tactics genuinely tuned for their own keys. The figure above shows the two independent record sets beside the startup phases.

## Faster startup has fixed constraints

Graph capture, compilation, and tuning can make initialization expensive because they prepare a serving configuration that may be faster later. An eager launch or fewer captures might reduce startup time while changing throughput, coverage, or KV capacity. That would answer a different objective. [vLLM's CUDA Graphs design documentation](https://docs.vllm.ai/en/stable/design/cuda_graphs/) describes why graph modes cover different execution shapes.

For this work, the constraint was to keep runtime performance, quality, features, graph coverage, and KV capacity while removing avoidable repeated startup work. One separate report recorded about **69 seconds of graph capture** in a historical profile. It was a phase observation, **not** an A/B-proven startup improvement. Another raw startup log warned that referenced compiled artifacts were missing; the archive does not establish their performance impact or a verified repair.

<div class="note-callout note-callout--pitfall" markdown="1">
**Validation rule:** a populated cache directory and an HTTP-ready process are insufficient. Check the expected rank-specific hits, effective graph path, KV capacity, and the same serving workload after restart.
</div>

I can attribute the historical cache completeness repair and backend selection to the local integration work. I cannot infer that the workaround is needed on current upstream code, that all compilation artifacts were reused, or that an unmeasured startup speedup occurred. Those boundaries are part of the result.

<div class="note-related" markdown="1">

## Continue the series

- Previous: [Making KV offload correct]({{ '/blog/kv-offload-correctness/' | relative_url }})
- Next: [High throughput, minutes of waiting]({{ '/blog/throughput-versus-usable-latency/' | relative_url }})

</div>

</article>
