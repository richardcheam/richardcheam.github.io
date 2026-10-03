---
title: "Locality is a claim you must measure"
date: 2026-10-03
category: "inference-engineering"
series_order: 2
excerpt: "On a multi-GH200 system, a local-first policy describes intent. Proving where KV buffers live, which path accesses them, and whether locality improves performance takes separate evidence."
---

<article class="note-article" markdown="1">

<p><a class="notes-backlink" href="{{ '/blog/' | relative_url }}">Back to Blog</a></p>
<p class="note-meta">Inference Engineering • Field note 02 • {{ page.date | date: "%d %b %Y" }} • 6 min read</p>

When I adapted a CPU-side KV offload path for a system with two Grace Hopper pairs, “put each GPU's buffers near its own Grace CPU” sounded like a complete design. It was only a policy. The harder question was whether the intended pages actually landed there and whether the GPU's real transfer path used them.

Grace Hopper's coherent memory makes remote access possible, but it does not make every physical location equivalent. A GPU, its adjacent Grace memory, and memory across the other pair are distinct locations. [NVIDIA's architecture description](https://developer.nvidia.com/blog/nvidia-grace-hopper-superchip-architecture-in-depth/) explains the hardware relationship; a particular machine's topology still has to be discovered rather than inferred from a generic diagram.

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

```text
discover topology
      ↓
record effective policy and allocation phase
      ↓
query the actual KV buffer's pages
      ↓
observe transfers and local/remote traffic
      ↓
compare matched workloads
```

The middle step needs an addressable buffer and a page-level status check, not just a configuration flag. Linux's [`move_pages` interface](https://man7.org/linux/man-pages/man2/move_pages.2.html) can report where selected pages reside; callers still need to handle permission errors and per-page results. That establishes placement at the instant of the query. It does not, by itself, show which path the GPU used later or how much transfer time was exposed to a request.

For performance, I would keep the model, request lengths, concurrency, KV pressure, cache state, and runtime configuration fixed while changing one locality choice. I would report both the placement result and a user-visible metric such as time to first token or completed output rate. A directionally faster run without matched work and observed placement cannot support a NUMA speedup headline.

<div class="note-callout note-callout--definition" markdown="1">
**Evidence boundary:** I established the topology, observed worker-level placement in one profile, and exercised a local-first plan. I did not establish CPU-KV-specific page locality, local-versus-remote traffic, or a causal performance gain from NUMA placement.
</div>

That boundary is useful. It tells the next engineer exactly which measurement would advance the claim. “Local-first” remains a sensible intent for this topology; its correctness and benefit become engineering results only when the relevant bytes and paths are measured.

<div class="note-related" markdown="1">

## Continue the series

- Previous: [When Linux file cache occupies GPU memory on Grace Hopper]({{ '/blog/grace-hopper-file-cache/' | relative_url }})
- Next: [Correct KV offload needs more than a successful response]({{ '/blog/kv-offload-correctness/' | relative_url }})
- [Inference Engineering project](https://richardcheam.github.io/inference-engineering/)

</div>

</article>
