---
title: "When Linux file cache occupies GPU memory"
date: 2026-10-03
category: "inference-engineering"
read_time: "6 min"
series_order: 1
series: dual-gh200
excerpt: "I traced a failed GH200 model startup to checkpoint file pages occupying HBM and measured the KV capacity recovered after targeted cache advice."
question: "Why did HBM appear full after the model checkpoint loaded?"
my_work: "I compared HBM file pages with the engine's KV-capacity check, then tested targeted advice for checkpoint files."
result: "The failed launch reported −4.43 GiB available for KV; a later early-profile launch reported 118.59 GiB."
evidence_limit: "This explains one startup capacity failure, not every retained-HBM incident or a general GH200 KV budget."
lesson: "Distinguish file-backed checkpoint pages from live tensors before diagnosing an HBM shortage."
---

<article class="note-article" markdown="1">

The model shards loaded, then the engine said it had no room for request cache. Apparent high-bandwidth memory (HBM) occupancy did not reveal whether those bytes belonged to the running model or to Linux's file cache. I traced the backing before changing the capacity budget.

{% include blog-at-a-glance.html %}

In one historical early V4.1 serving profile, the initial capacity calculation reported **−4.43 GiB available for key-value (KV) cache** and startup failed. Per-node inspection showed that file-backed pages dominated the occupied HBM domains. After targeted advice for the checkpoint files, a subsequent launch reported **118.59 GiB available for KV** and **15,250,409 logical KV tokens**.

<div class="blog-table-scroll" role="region" aria-label="Early V4.1 capacity comparison" tabindex="0" markdown="1">

| Early V4.1 capacity check | Engine-reported available KV |
| --- | ---: |
| Before targeted checkpoint file advice; launch failed | −4.43 GiB |
| Subsequent launch after file advice | 118.59 GiB |

</div>

These are engine capacity outputs, not physical HBM totals. The source record supports file-page dominance but does not preserve a phase-labelled per-node byte series suitable for a chart. This early eager profile is separate from the later V4.1 E16 configuration. Source: canonical pack, FACT-MEM-002/003, SRC-02.

On Grace Hopper, this question matters because some configurations expose GPU HBM as Linux NUMA memory. File pages can therefore occupy capacity that the serving engine also needs. The exact accounting depends on the system's driver and memory mode; a `free` total is not automatically “CPU RAM plus a separate GPU.” [NVIDIA's Grace operating-system guide](https://docs.nvidia.com/dccpu/grace-perf-tuning-guide/os-settings.html) describes both NUMA-onlined GPU memory and a mode where it is not onlined.

## A load can leave two different copies

A buffered checkpoint read may populate Linux's page cache. The loader can then construct weights in a separate runtime allocation. The file pages and the live tensor have different owners and lifetimes:

<figure class="blog-figure blog-figure--prose" tabindex="0">
  <img src="{{ '/assets/blog/file-cache-memory.svg' | relative_url }}" alt="Conceptual fork after checkpoint load: reclaimable file-backed pages and a separately owned live runtime tensor can coexist." loading="lazy">
  <figcaption><strong>Figure 1 · Two possible owners after a checkpoint load.</strong> Conceptual mechanism, supported by Linux page-cache semantics and the early V4.1 incident. The fork is possible, not a claim that every loader copies weights or stops using its file mapping.</figcaption>
</figure>

The arrows show *possible* data flow, not a promise that every loader copies every tensor. A runtime that continues to use a file mapping has a different dependency: discarding its file pages can cause later faults and rereads. [Linux's page-cache documentation](https://docs.kernel.org/mm/page_cache.html) explains why ordinary file reads and mappings participate in the cache.

That distinction changed how I interpreted a memory shortfall. The observation “memory stayed occupied after load” did not establish a CUDA leak. It could include file-backed checkpoint pages, anonymous allocations, pinned buffers, and live device tensors. A process's virtual mappings are views of physical storage, not another pile of bytes to add to the total. The measured recovery supports a checkpoint-cache explanation for *this startup failure*; it does not diagnose every retained-HBM incident.

It also helps to name the mechanism before saying “offload”:

- **Host-resident weights:** model state.
- **CPU-stored KV:** request state that must be reloaded before dependent attention work.
- **Linux swap:** storage backing for eligible OS pages.

A NUMA placement policy chooses where a host allocation should live; it does not itself move KV blocks. These mechanisms have different owners and costs, and the file-cache incident should not be combined with the separate CPU-KV tests as one measured stack.

## What I would measure before changing anything

<div class="blog-table-scroll" role="region" aria-label="Memory evidence checklist" tabindex="0" markdown="1">

| Question | Evidence to collect | What it cannot prove alone |
| --- | --- | --- |
| Which physical domains exist? | NUMA topology and per-node capacity | Where a particular buffer landed |
| Are file pages occupying a domain? | Per-node `FilePages` before and after load | That all those pages belong to one checkpoint |
| What does the server own? | Process mappings, proportional set size, device allocations | Whether an allocation is needed on the next request |
| Did capacity actually recover? | The same capacity check before and after a targeted action | That every future run will have the same result |
| Did behavior stay correct? | A warm inference and storage-I/O observation | That another loader or restart path is unaffected |

</div>

I would compare the readings at four explicit phases:

1. **Before loading:** establish the starting memory state.
2. **After loading:** inspect what the checkpoint read left resident.
3. **After the runtime has created its tensors:** distinguish runtime allocations from file-backed pages.
4. **After a controlled cache action:** repeat the same capacity and backing checks.

This is the measurement sequence I would use, not a recovered phase-by-phase byte trace. The phase labels matter as much as the byte counts. Otherwise, an allocation made during graph capture or KV reservation can be mistaken for file-cache growth.

## Why targeted file advice is a diagnostic, not a universal fix

For a checkpoint that the running model no longer reads, targeted `POSIX_FADV_DONTNEED` can tell Linux those file pages are no longer needed. It is advisory: the call's success does not guarantee that every page disappeared. The useful result is the measured change in backing and available capacity, followed by a request that confirms the runtime still behaves correctly. The [Linux `posix_fadvise` manual](https://man7.org/linux/man-pages/man2/posix_fadvise.2.html) documents the hint's limits.

Broad cache dropping would affect unrelated file reads and can make later startup slower. More importantly, it would conceal the ownership question. If a runtime still depends on file-backed pages, repeated eviction can add I/O rather than create sustainable capacity.

<div class="note-callout note-callout--pitfall" markdown="1">
**Diagnostic rule:** classify memory by backing, owner, physical location, and lifetime before calling retained occupancy a leak.
</div>

The general lesson from my investigation is a measurement habit, not a claim that every Grace Hopper server has this failure. Coherent addressability makes several memory domains visible to the same system; it does not make their capacity, placement, or performance interchangeable.

<div class="note-related" markdown="1">

## Continue the series

- Next: [Benchmark numbers that misled me and how I corrected them]({{ '/blog/benchmark-denominators/' | relative_url }})
- [Inference Engineering project](https://richardcheam.github.io/inference-engineering/)

</div>

</article>
