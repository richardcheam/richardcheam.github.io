---
title: "Making KV offload correct"
date: 2026-10-03
category: "inference-engineering"
read_time: "6 min"
series_order: 4
series: dual-gh200
excerpt: "I adapted a CPU-KV path, checked reload output and actual movement, and investigated allocator rollback and transfer drain under pressure."
question: "Could offloaded KV survive eviction and reload under pressure without corrupting allocator state?"
my_work: "I adapted a CPU-KV path, investigated grouped allocation and idle-state failures, and ran exact-token pressure checks."
result: "One 128 GiB total CPU-KV profile completed 120/120 requests with 90 stores, 10 loads, and no pending transfers at the end."
evidence_limit: "These are reported historical profile results; they do not establish a speedup or complete SuperInfer parity."
lesson: "Correct KV offload requires output consistency, actual movement, allocator rollback, and transfer quiescence."
---

<article class="note-article" markdown="1">

I wanted to know whether request state could move out of GPU memory and return without changing the answer or leaving the allocator in a broken state. The key-value (KV) cache holds attention state used during generation. Storing some of it in a CPU pool increased available space, but it also created a new ownership problem.

A request could appear successful while an earlier grouped allocation had left the free list inconsistent, or while a device-to-host transfer was still pending. I needed separate evidence for output, movement, and a safe final state.

The offload path I adapted drew on [SuperInfer's published design](https://supercomputing-system-ai-lab.github.io/projects/superinfer/) and integrated it into a newer [vLLM serving stack](https://github.com/vllm-project/vllm). Those projects supplied the original ideas and interfaces. My recorded work was adaptation, debugging, and validation on dual GH200, not a reimplementation of every paper mechanism.

## What I tested and what each check could show

I separated validation into three questions:

<div class="blog-table-scroll" role="region" aria-label="KV offload validation questions" tabindex="0" markdown="1">

| Question | Evidence | What it does not establish alone |
| --- | --- | --- |
| Did the answer survive eviction and reload? | Exact prompt lengths and identical output across repeated cycles | That a transfer actually occurred in that client test |
| Did blocks move under pressure? | Store/load counters and directional byte counts | That ownership and cleanup are safe at every boundary |
| Did the engine become truly idle? | Zero pending transfers and a healthy final state | General uptime or a speedup over another runtime |

</div>

The reload check used the adapted CPU-KV path on dual GH200. Four exact **131,072-token** inputs went through three eviction and reload cycles, keeping the inputs fixed while testing repeated reuse. The surviving summary does not specify the model revision, output target, client concurrency, or elapsed duration.

The recorded outputs and lengths matched, with no client failures. That is useful evidence that the answer survived these cycles. The client did not collect transfer counters, so this check alone cannot show how much state moved. I used separate pressure tests for that question.

The first reasoning-tree pressure test used a **128 GiB total CPU-KV pool**, **24 clients**, and **327,680-token inputs** over five rounds. That recipe stayed fixed across the rounds. It tested whether the engine could move state and finish the workload under pressure. The report does not provide a complete output-target or elapsed-duration record.

**120 of 120 requests completed**. The counters recorded **90 stores, 10 loads**, full logical KV occupancy during pressure, and **zero pending transfers at the end**. Unlike the output-only reload check, these counters show actual movement. The empty transfer queue also shows that the test ended without recorded copies still pending.

<div class="blog-table-scroll" role="region" aria-label="KV pressure profile results" tabindex="0" markdown="1">

| Accepted 128 GiB reasoning-tree pressure profile | Reported observation |
| --- | ---: |
| Input and load | 327,680 tokens · C24 · five rounds |
| Completed requests | 120 / 120 |
| KV movement | 90 stores · 10 loads |
| Pending transfers at end | 0 |

</div>

In a separate, more aggressive two-round profile, input length increased to **524,288 tokens**. It completed **48 of 48** requests, with **26 stores, two loads**, about **72.0 GB device-to-host** and **3.0 GB host-to-device** traffic. The remaining request settings are not fully specified here, so I do not treat it as a matched comparison with the first profile. These are historical functionality checks, not universal capacity or throughput figures. Source: canonical pack, FACT-KV-001/002 and SRC-06/08.

## A grouped allocation is a transaction

The allocator failure I had to reason about was not a simple “out of blocks” return. A request could need several KV groups. If an early group updated a request table and free list, then a later group failed, the system could retain only part of the new state. A later assertion might appear far from the first incorrect mutation.

The invariant is straightforward: either every required group acquires its blocks and the request owns them, or the attempted allocation leaves the allocator as it was. That includes request tables, block references, free-list membership, and counters.

<figure class="blog-figure blog-figure--prose">
  {% include blog-figures/kv-transaction.html alt="Conceptual grouped allocation: reserve every group before committing request ownership; on failure, roll back every touched table, free-list entry, reference and count." %}
  <figcaption><strong>Figure 1 · All groups or none.</strong> Conceptual ownership invariant from the reported allocator repair, not a diagram of an audited code path. Transfer dependencies must finish before a block is released or reused. Source: canonical pack, FAIL-GH200 allocator record / SRC-07.</figcaption>
</figure>

For example, suppose a request needs groups A and B. This conceptual sequence shows the partial-allocation problem and required rollback:

1. **Reserve A:** take A from the free list.
2. **Record ownership:** add A to the request table and update the relevant counters.
3. **Fail on B:** the allocator cannot obtain the second group. Returning “out of capacity” now would leave A owned and the counters changed.
4. **Roll back:** remove A from the request table, restore its free-list membership and references, and return the counters to their prior values.

The historical record describes preflight and rollback repairs, duplicate-safe freeing, and free-list bookkeeping fixes. It does not preserve this exact sequence as the reproducer, and I have not freshly audited the original patch. I therefore describe the repair as reported and use the pressure runs as functional evidence. A timeout around the failing request would not have restored partial allocator state.

## Response completion is not copy completion

CPU-KV movement can be asynchronous. A device-to-host copy can be submitted while computation continues; an event later marks when the source block may safely be reused. A host-to-device reload must finish before dependent GPU work reads the restored KV. Separate streams permit overlap, but their existence does not prove how much copy time was hidden.

In the later v0.26 integration track, the active request set once reached zero while device-to-host completion work remained pending. Treating that state as idle could let shutdown or a new phase race with the copy. The reported fix made pending push work part of the idle decision. A later long-context soak in that integration track checked whether work and transfer queues drained. Its full request recipe and duration are not supplied in this summary. It completed **48-of-48** requests, ended with healthy, drained transfer queues, and recorded about **28.6 GB stores** and **10.2 GB loads**. This was a different integration track from the more aggressive 128 GiB pressure profile above; its counters should not be added to that run.

<div class="note-callout note-callout--definition" markdown="1">
**Completion rule:** a client response ends the request's visible output. Before the engine is safe to stop or reuse blocks, every dependent transfer must also finish and ownership must be settled.
</div>

This is the correctness checklist I would carry to another offload design:

- **Output consistency:** prove that eviction and reload preserve the expected output.
- **Actual movement:** observe store/load counters and directional traffic.
- **Allocator rollback:** check that failed grouped allocation restores every affected owner and counter.
- **Transfer completion:** gate idleness and block reuse on completed transfer dependencies.

The records establish functionality in named historical profiles. They do not isolate a latency gain from NUMA placement or prove complete parity with the original SuperInfer system.

<div class="note-related" markdown="1">

## Continue the series

- Previous: [NUMA locality: configuration versus proof]({{ '/blog/gh200-locality-evidence/' | relative_url }})
- Next: [Why model startup needs a fitting backend and complete artifacts]({{ '/blog/startup-artifacts-runtime-contract/' | relative_url }})

</div>

</article>
