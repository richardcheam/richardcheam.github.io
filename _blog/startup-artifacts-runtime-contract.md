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

Why could a quantized checkpoint look small enough for the GPU but fail during model startup? I investigated how the serving backend represented the weights in memory. A second question followed: could a saved tuning cache support every rank on restart? These were startup checks, not timed request benchmarks. Request sizes and client concurrency were not the variables under test.

The historical MiMo v2.6 B0 profile used a pinned vLLM development build, reported as <code>0.29.1rc1.dev449+geb8798058</code>, on dual GH200. Tensor parallelism (TP) split model work across two GPU ranks; expert parallelism (EP) placed experts across two ranks. I compared backend preparation outcomes within that historical runtime, then checked rank-specific tuning records. The archive does not provide matched total startup durations for the backend comparison.

<figure class="blog-figure blog-figure--wide" tabindex="0">
  <img src="{{ '/assets/blog/backend-startup.svg' | relative_url }}" alt="Conceptual startup boundary: checkpoint loading and backend preparation come before later graph and KV work, whose relative order is unspecified. Each expert-parallel rank needs genuine autotune records." loading="lazy">
  <figcaption><strong>Figure 1 · Two startup contracts.</strong> Conceptual boundary between backend preparation and later graph/KV work, plus rank-specific cache completeness, based on the historical MiMo report, FACT-START-001 / SRC-03. The line lengths are not phase timings.</figcaption>
</figure>

The diagram shows two things the runtime needs: enough space to prepare its weights, and tuning records for each rank. It is a conceptual map, not a timing plot. KV means the key-value cache, which stores attention state for requests.

## The failing phase determines the memory question

Checkpoint size is not peak startup memory. I distinguish three parts of startup:

1. **Checkpoint loading:** read model state and create the initial runtime allocations.
2. **Backend preparation:** construct the backend-specific representation, packing buffers, and conversion workspaces.
3. **Later runtime preparation:** profile capacity, capture graphs, and reserve KV as required by the particular engine path.

The relative order of graph and KV work depends on that path; this list does not establish their order in every runtime. A lower KV-memory target cannot rescue a failure that occurs before the engine has begun allocating KV.

The backend changed between these startup attempts. The recorded outcomes were:

<div class="blog-table-scroll" role="region" aria-label="Backend startup outcomes" tabindex="0" markdown="1">

| Backend path | Reported outcome | What it established |
| --- | --- | --- |
| Marlin preparation | About **145.9 GiB per rank** at the failing preparation stage | Representation and temporary work exceeded the available budget before KV creation |
| Triton path | Activation compatibility rejection | A memory-only fix would not make this path valid |
| FlashInfer CUTLASS | Loaded at about **83 GiB per rank** | This historical representation fit and enabled the validated B0 serving profile |

</div>

The selected FlashInfer CUTLASS path fit at about 83 GiB per rank, while Marlin preparation reached about 145.9 GiB per rank and failed before KV creation. The Triton attempt failed for compatibility rather than an established memory shortage. That distinction mattered: reducing the future request-cache budget could not repair a failure in weight preparation or activation support. These historical observations do not rank current backends or isolate a single flag's effect.

The practical diagnostic is to record the failure phase, such as load, packing, profiling, graph capture, or KV reservation, before adjusting a budget for a later phase.

A separate GLM quantized-and-speculative track reinforced the boundary between weights and request state. Its planning record reported about **338,624 GPU KV tokens** under one tensor-parallel configuration: fitting quantized weights did not remove the KV budget for long requests. The exact model revision, engine build, and output/request counts were not recovered well enough to make its recalled throughput figure a benchmark result, so I use this track only for the capacity lesson.

## A rank-specific cache must be complete

The next problem involved expert-parallel autotuning, which tries execution choices and saves the selected tactics for reuse. A persisted cache with **42** genuine records covered one rank, but a second rank needed its own keys. Rank zero could find a tuned entry while rank one missed or fell back. The local workaround generated and persisted **84 genuine records, 42 for each rank**, before a real startup using only the cache. The report recorded cache hits on both ranks in that historical profile.

Copying a rank-zero record and changing its key would not show that its tactic had been tuned or validated for rank one. The cache must agree with the actual backend, shapes, version, and rank identity. [FlashInfer's autotuning documentation](https://docs.flashinfer.ai/autotuning.html) describes public persistence concepts; it does not certify that this older local workaround is required or suitable for today's stack.

The change was from one rank's records to genuine records for both ranks. The runtime still needed the correct backend, shapes, version, and rank keys. The figure shows those independent sets beside the startup phases; it does not show measured phase durations.

## Faster startup has fixed constraints

Graph capture, compilation, and tuning can make initialization expensive because they prepare a serving configuration that may be faster later. An eager launch or fewer captures might reduce startup time while changing throughput, coverage, or KV capacity. That would answer a different objective. [vLLM's CUDA Graphs design documentation](https://docs.vllm.ai/en/stable/design/cuda_graphs/) describes why graph modes cover different execution shapes.

For this work, the constraint was to keep runtime performance, quality, features, graph coverage, and KV capacity while removing avoidable repeated startup work. One separate report recorded about **69 seconds of graph capture** in a historical profile. It was a phase observation, **not** an A/B-proven startup improvement. Another raw startup log warned that referenced compiled artifacts were missing; the archive does not establish their performance impact or a verified repair.

A populated cache directory and an HTTP-ready process are insufficient. After restart, I would validate:

- **Rank-specific cache hits:** every expected rank uses its genuine tuned records.
- **Effective graph path:** the intended graph mode and coverage remain active.
- **KV capacity:** the capacity budget remains consistent with the validated profile.
- **Serving behavior:** the same workload still completes with the required performance, quality, and features.

The local integration produced a fitting backend choice and a rank-complete cache for this historical profile. It did not establish a measured startup speedup or complete reuse of compilation artifacts. A current runtime would need its own restart validation.

<div class="note-related" markdown="1">

## Continue the series

- Previous: [Making KV offload correct]({{ '/blog/kv-offload-correctness/' | relative_url }})
- Next: [High throughput, minutes of waiting]({{ '/blog/throughput-versus-usable-latency/' | relative_url }})

</div>

</article>
