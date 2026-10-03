---
title: "NUMA locality: configuration versus proof"
date: 2026-10-03
category: "inference-engineering"
read_time: "5 min"
series_order: 3
excerpt: "I mapped the two Grace Hopper locality domains, checked worker placement, and tested NUMA restrictions. The remaining KV-buffer locality claim needs its own measurement."
question: "Did a local-first CPU-KV policy put the actual buffer pages near the owning GPU?"
my_work: "I mapped the two Grace Hopper pairs, inspected worker placement, and tested memory-policy boundaries."
result: "Whole-worker placement looked local, but CPU-KV-buffer residency and a NUMA speedup remain unmeasured."
evidence_limit: "Those worker totals do not prove KV-buffer residency, transfer locality, or a NUMA-caused speedup."
lesson: "A local-first policy and worker placement do not prove KV-buffer residency or a NUMA speedup."
---

<article class="note-article" markdown="1">

When I adapted a CPU-side key-value (KV) offload path for two Grace Hopper pairs, “put each GPU's buffers near its own Grace CPU” sounded like a complete design. It was a policy, not a placement measurement. The question was whether those specific pages landed nearby and whether the transfer path used them.

{% include blog-at-a-glance.html %}

Grace Hopper's coherent memory makes remote access possible, but it does not make every physical location equivalent. A GPU, its adjacent Grace memory, and memory across the other pair are distinct locations. [NVIDIA's architecture description](https://developer.nvidia.com/blog/nvidia-grace-hopper-superchip-architecture-in-depth/) explains the hardware relationship; a particular machine's topology still has to be discovered rather than inferred from a generic diagram.

<figure class="blog-figure blog-figure--wide" tabindex="0">
  <img src="{{ '/assets/blog/numa-topology.svg' | relative_url }}" alt="Two Grace Hopper pairs, each with Grace CPU and host memory beside a Hopper GPU and HBM. Configured placement is distinct from measured KV-buffer residency or transfer path." loading="lazy">
  <figcaption><strong>Figure 1 · The paired topology, not a transfer measurement.</strong> Conceptual map based on the recorded dual-GH200 topology, FACT-NUMA-001/002 / SRC-01. The spacing and connecting lines encode pairing only; they are not bandwidth or latency values.</figcaption>
</figure>

## What “local” can mean

During the investigation, several different things were easy to call “local”:

| Claim | What would support it |
| --- | --- |
| The intended CPU and GPU are a pair | Topology and device-to-NUMA mapping |
| The worker runs on nearby CPUs | CPU affinity observed for that worker |
| Allocations prefer nearby memory | The effective memory policy and its allowed nodes |
| The KV buffer is physically nearby | A page-location query for that specific buffer |
| Transfers use the nearby path | Runtime traffic or transfer evidence tied to that buffer |
| Locality improves serving | A controlled comparison with the same workload and other settings |

Each row answers a different question. Seeing good whole-worker placement is useful, but a worker owns more than KV: code, stacks, temporary allocations, file mappings, and other model state can all contribute. A high aggregate percentage cannot stand in for a KV-buffer measurement.

## What the historical checks actually showed

One serving profile reported about **99.4% and 99.6% host-side worker placement** on the respective intended Grace domains. That is a strong worker-level observation. It does not isolate the pages used by the CPU-KV pool, and a different early serving profile showed mixed placement. The two snapshots describe different configurations; they cannot be combined into one before-and-after result.

A separate allowed-node A/B probe found that CUDA availability was **false** with a host-only hard memory mask and **true** when the needed HBM domains were allowed. The experiment established a configuration failure in that environment, not a universal CUDA rule. Another strict-binding probe was denied before it could establish where any pool pages landed. Those results narrowed the safe design question: allow the memory domains device initialization needs, then verify host-buffer placement independently.

## Policy is applied at allocation time

A memory policy tells Linux where to try to allocate pages. A preferred node can allow fallback; an allowed-node restriction can be much harder. Existing pages do not necessarily move just because the policy changes later. First touch and buffer lifetime therefore belong in the experiment design. The [Linux NUMA memory-policy documentation](https://docs.kernel.org/admin-guide/mm/numa_memory_policy.html) distinguishes these scopes and behaviors.

Neither failed probe proves that the desired KV pages were local. A policy must report failure clearly, and host-buffer placement must be tested without assuming every other memory user can be restricted the same way.

## The evidence ladder I would use now

The next measurement would identify the allocation phase, sample the actual CPU-KV buffer pages, then connect their residency to observed transfer traffic and a matched serving run. A worker-level aggregate cannot substitute for any of these observations.

The middle step needs an addressable buffer and a page-level status check, not just a configuration flag. Linux's [`move_pages` interface](https://man7.org/linux/man-pages/man2/move_pages.2.html) can report where selected pages reside; callers still need to handle permission errors and per-page results. That establishes placement at the instant of the query. It does not, by itself, show which path the GPU used later or how much transfer time was exposed to a request.

For performance, I would keep the model, request lengths, concurrency, KV pressure, cache state, and runtime configuration fixed while changing one locality choice. I would report both the placement result and a user-visible metric such as time to first token or completed output rate. A directionally faster run without matched work and observed placement cannot support a NUMA speedup headline.

<div class="note-callout note-callout--definition" markdown="1">
**Evidence boundary:** I established the topology, observed worker-level placement in one profile, and exercised a local-first plan. I did not establish CPU-KV-specific page locality, local-versus-remote traffic, or a causal performance gain from NUMA placement.
</div>

That boundary is useful. It tells the next engineer exactly which measurement would advance the claim. “Local-first” remains a sensible intent for this topology; its correctness and benefit become engineering results only when the relevant bytes and paths are measured.

<div class="note-related" markdown="1">

## Continue the series

- Previous: [Benchmark numbers that misled me—and how I corrected them]({{ '/blog/benchmark-denominators/' | relative_url }})
- Next: [Making KV offload correct]({{ '/blog/kv-offload-correctness/' | relative_url }})
- [Inference Engineering project](https://richardcheam.github.io/inference-engineering/)

</div>

</article>
