---
title: "NUMA locality: configuration versus proof"
date: 2026-10-03
category: "inference-engineering"
read_time: "5 min"
series_order: 3
series: dual-gh200
excerpt: "I mapped the two Grace Hopper locality domains, checked worker placement, and tested NUMA restrictions while leaving KV-buffer locality for direct measurement."
question: "Did a local-first CPU-KV policy put the actual buffer pages near the owning GPU?"
my_work: "I mapped the two Grace Hopper pairs, inspected worker placement, and tested memory-policy boundaries."
result: "Whole-worker placement looked local, but CPU-KV-buffer residency and a NUMA speedup remain unmeasured."
evidence_limit: "Those worker totals do not prove KV-buffer residency, transfer locality, or a NUMA-caused speedup."
lesson: "A local-first policy and worker placement do not prove KV-buffer residency or a NUMA speedup."
---

<article class="note-article" markdown="1">

When I adapted a CPU-side key-value (KV) offload path for two Grace Hopper pairs, “put each GPU's buffers near its own Grace CPU” sounded like a complete design. That cache stores attention state for requests; offload moves some of it out of GPU memory for later reuse. The placement rule was a policy, not a measurement. The question was whether those specific pages landed nearby and whether the transfer path used them.

NUMA, non-uniform memory access, means that where a memory page lives can affect the cost of accessing it. Grace Hopper's coherent memory makes remote access possible, but it does not make every physical location equivalent. A GPU, its adjacent Grace memory, and memory across the other pair are distinct locations. [NVIDIA's architecture description](https://developer.nvidia.com/blog/nvidia-grace-hopper-superchip-architecture-in-depth/) explains the hardware relationship; a particular machine's topology still has to be discovered rather than inferred from a generic diagram.

<figure class="blog-figure blog-figure--wide" tabindex="0">
  <img src="{{ '/assets/blog/numa-topology.svg' | relative_url }}" alt="Two Grace Hopper pairs, each with Grace CPU and host memory beside a Hopper GPU and HBM. Configured placement is distinct from measured KV-buffer residency or transfer path." loading="lazy">
  <figcaption><strong>Figure 1 · The paired topology, not a transfer measurement.</strong> Conceptual map based on the recorded dual-GH200 topology, FACT-NUMA-001/002 / SRC-01. The spacing and connecting lines encode pairing only; they are not bandwidth or latency values.</figcaption>
</figure>

## What “local” can mean

During the investigation, several different things were easy to call “local”:

<div class="blog-table-scroll" role="region" aria-label="NUMA locality evidence ladder" tabindex="0" markdown="1">

| Claim | What would support it |
| --- | --- |
| The intended CPU and GPU are a pair | Topology and device-to-NUMA mapping |
| The worker runs on nearby CPUs | CPU affinity observed for that worker |
| Allocations prefer nearby memory | The effective memory policy and its allowed nodes |
| The KV buffer is physically nearby | A page-location query for that specific buffer |
| Transfers use the nearby path | Runtime traffic or transfer evidence tied to that buffer |
| Locality improves serving | A controlled comparison with the same workload and other settings |

</div>

Each row answers a different question. Seeing good whole-worker placement is useful, but a worker owns more than KV: code, stacks, temporary allocations, file mappings, and other model state can all contribute. A high aggregate percentage cannot stand in for a KV-buffer measurement.

## What the historical checks actually showed

I checked worker placement and memory-policy restrictions on the dual-GH200 machine. These checks asked where memory lived and whether CUDA could initialize; they were not matched request-performance tests. The surviving snapshots do not provide a complete model, request-size, concurrency, or duration recipe, so they cannot support a latency or throughput comparison.

One serving profile reported about **99.4% and 99.6% host-side worker placement** on the respective intended Grace domains. That is a strong worker-level observation. It does not isolate the pages used by the CPU-KV pool, and a different early serving profile showed mixed placement. The configuration changed between those snapshots. They do not show that one placement change improved the same workload.

A separate startup probe changed the allowed memory nodes. CUDA availability was **false** with a host-only hard memory mask and **true** when the needed HBM domains were allowed. The experiment established a configuration failure in that environment, not a universal CUDA rule. Another strict-binding probe was denied before it could establish where any pool pages landed. Those results narrowed the safe design question: allow the memory domains device initialization needs, then verify host-buffer placement independently.

## Policy is applied at allocation time

A memory policy tells Linux where to try to allocate pages. A preferred node can allow fallback; an allowed-node restriction can be much harder. Existing pages do not necessarily move just because the policy changes later. First touch and buffer lifetime therefore belong in the experiment design. The [Linux NUMA memory-policy documentation](https://docs.kernel.org/admin-guide/mm/numa_memory_policy.html) distinguishes these scopes and behaviors.

Neither failed probe proves that the desired KV pages were local. A policy must report failure clearly, and host-buffer placement must be tested without assuming every other memory user can be restricted the same way.

## The evidence ladder I would use now

This is proposed measurement work. I would use the following sequence to advance from configuration intent to performance evidence:

1. **Topology:** map each GPU to its Grace CPU, host-memory domain, and HBM domain.
2. **Effective policy:** record CPU affinity, allowed memory nodes, allocation phase, and the memory policy active when the buffer is created.
3. **Specific buffer-page residency:** sample the actual CPU-KV buffer pages and report their physical locations.
4. **Transfer evidence:** tie observed runtime traffic or transfers to that same buffer.
5. **Matched performance comparison:** hold the workload and other settings fixed while changing one locality choice.

A worker-level aggregate cannot substitute for any of these observations.

The middle step needs an addressable buffer and a page-level status check, not just a configuration flag. Linux's [`move_pages` interface](https://man7.org/linux/man-pages/man2/move_pages.2.html) can report where selected pages reside; callers still need to handle permission errors and per-page results. That establishes placement at the instant of the query. It does not, by itself, show which path the GPU used later or how much transfer time was exposed to a request.

For performance, I would keep the model, request lengths, concurrency, KV pressure, cache state, and runtime configuration fixed while changing one locality choice. I would report both the placement result and a user-visible metric such as time to first token or completed output rate. A directionally faster run without matched work and observed placement cannot support a NUMA speedup headline.

<div class="note-callout note-callout--definition" markdown="1">
**What remains to measure:** the specific CPU-KV pages, their transfer path, and a matched local-versus-remote performance comparison. The historical worker totals do not answer those questions.
</div>

That boundary is useful. It tells the next engineer exactly which measurement would advance the claim. “Local-first” remains a sensible intent for this topology; its correctness and benefit become engineering results only when the relevant bytes and paths are measured.

<div class="note-related" markdown="1">

## Continue the series

- Previous: [Benchmark numbers that misled me and how I corrected them]({{ '/blog/benchmark-denominators/' | relative_url }})
- Next: [Making KV offload correct]({{ '/blog/kv-offload-correctness/' | relative_url }})
- [Inference Engineering project](https://richardcheam.github.io/inference-engineering/)

</div>

</article>
