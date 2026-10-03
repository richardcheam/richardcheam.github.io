---
title: "When the container stays alive but inference stops"
date: 2026-10-03
category: "inference-engineering"
read_time: "4 min"
series_order: 7
excerpt: "I investigated why workers stopped while their container stayed alive, then separated process ownership, model readiness, and workload admission."
question: "Who owns inference when workers stop responding but the container remains alive?"
my_work: "I traced process and readiness boundaries and separated recovery behavior from workload admission."
result: "The parent-monitor pipe closed while the container stayed alive; later controls addressed ownership and pending-work cleanup."
evidence_limit: "The original signal sender and first exiting process were not established."
lesson: "Container liveness, model readiness, and workload ownership need separate checks."
---

<article class="note-article" markdown="1">

Inference workers stopped responding while their container remained alive. A worker log showed the parent-monitor pipe closing, but the surviving records did not identify the first process to exit or any signal sender. The incident showed why container liveness was an incomplete measure of model service.

<figure class="blog-figure blog-figure--wide" tabindex="0">
  <img src="{{ '/assets/blog/service-lifecycle.svg' | relative_url }}" alt="Observed state: container alive, inference workers unresponsive, parent-monitor pipe closed. The first exiting process and cause remain unknown." loading="lazy">
  <figcaption><strong>Figure 1 · What the surviving record establishes.</strong> Reconstructed set of observations, not a precise timestamped trace. The ordering and cause of the underlying exits remain unresolved. Source: canonical pack, lifecycle incident / SRC-11.</figcaption>
</figure>

{% include blog-at-a-glance.html %}

The useful engineering result was a clearer model of ownership. A container, launcher, API process, engine workers, and request gateway can each have a different lifetime and health signal. If no one component owns the full inference workload, a green container can coexist with an unavailable model.

## Draw the process boundary before diagnosing the exit

In the historical case, the container's continued existence ruled out a simple whole-container exit. Parent-pipe end-of-file (EOF) supported a narrower observation: the worker lost its parent connection or the pipe closed. It did not reveal *why*. The runbook compared clocks, process ancestry, and available historical events; it proposed prospective signal and exit tracing because retrospective records were insufficient.

The ownership chain was container or supervisor → launcher and API parent → engine and GPU workers → requests and pending transfers. Each edge needed a start, exit, and recovery owner. This is a conceptual chain, not the private deployment layout.

A detached process can fail without changing the status of the container's main process. Recovery that watches only the outermost level will miss that state. The later supervision and cleanup measures addressed detection and recovery; they do not establish the trigger of the original shutdown.

## Readiness must name what is ready

An open HTTP port establishes that something answers HTTP. It does not prove the intended model loaded, its workers are healthy, or a request through the intended route can complete. A front end accepting a request also does not establish spare capacity in the serving engine.

The separation I use is:

| Check | Question it answers |
| --- | --- |
| Container/process liveness | Is the supervised process present? |
| Engine readiness | Are the model workers and required resources initialized? |
| Model-route readiness | Does the intended route reach the intended healthy model? |
| Workload admission | Can this request fit the current latency and capacity policy? |

The [long-context soak]({{ '/blog/throughput-versus-usable-latency/' | relative_url }}) showed why the last row matters: **2,252 completed successes** coexisted with **550.876-second median first-token wait** among completed requests. Routing another large request to a live backend would not create more KV capacity or shorten an existing queue.

## Recovery needs a single owner and an idle definition

A robust controller needs to distinguish an unexpected failure from planned maintenance, stop the right process tree, wait for GPU and asynchronous transfer work to settle, and only then start a replacement. Maintenance should have an explicit hold or pause state so a manual stop does not race an automatic relaunch. Readiness should be withdrawn before accepting new work on an instance that is shutting down.

The KV-offload investigation provided a related boundary: zero active requests did not always mean zero pending device-to-host work. Cleanup based solely on client count could outlive blocks still referenced by a transfer. The later reliability record describes scoped parent-first termination and pending-work cleanup, but that later control does not retroactively identify the original shutdown trigger.

<div class="note-callout note-callout--pitfall" markdown="1">
**Evidence boundary:** I observed parent connection loss while the container remained alive. The original sender and first exiting process were not established. Better supervision is a design response to the failure mode, not proof of its historical root cause.
</div>

This is the operational end of the GH200 field notes. Memory placement, correct KV movement, benchmark units, and startup artifacts determine whether a model can serve. Explicit workload ownership determines whether it keeps serving, stops cleanly, and reports readiness honestly. None of those layers replaces admission control when a live server is already overloaded.

<div class="note-related" markdown="1">

## Continue the series

- Previous: [High throughput, minutes of waiting]({{ '/blog/throughput-versus-usable-latency/' | relative_url }})
- Start again: [When Linux file cache occupies GPU memory]({{ '/blog/grace-hopper-file-cache/' | relative_url }})

</div>

</article>
