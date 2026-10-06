---
layout: default
title: "DecisionOps"
permalink: /projects/decisionops/
demo_url: "https://richardcheam.github.io/decisionops/"
github_url: "https://github.com/richardcheam/decisionops"
---

<div class="detail-shell" data-detail-tabs>
  <p data-reveal><a class="project-backlink" href="{{ '/projects/' | relative_url }}">Back to Projects</a></p>
  <p class="minimal-kicker" data-reveal>Workflow Evaluation · September 2026</p>
  <p class="minimal-intro" data-reveal>An offline experiment on bounded diagnostic workflows, comparing fixed-order, rules-based, GLiClass and Laya policies with replayable traces and a standalone report viewer.</p>

  <div class="detail-chips" aria-label="Project highlights" data-reveal>
    <span class="detail-chip detail-chip--role"><span class="detail-chip__label">Role:</span> <span class="detail-chip__value">Author &amp; engineer</span></span>
    <span class="detail-chip detail-chip--impact"><span class="detail-chip__label">Impact:</span> <span class="detail-chip__value">Evidence masking removed unsupported diagnosis proposals</span></span>
    <span class="detail-chip detail-chip--stack"><span class="detail-chip__label">Stack:</span> <span class="detail-chip__value">Python · GLiClass · Laya · GitHub Actions</span></span>
  </div>

  <nav class="detail-nav" aria-label="Section navigation" data-reveal>
    <a href="#tldr" data-detail-trigger>TL;DR</a>
    <a href="#build" data-detail-trigger>Build</a>
    <a href="#results" data-detail-trigger>Results</a>
    <a href="#links" data-detail-trigger>Links</a>
  </nav>

  <section id="tldr" class="detail-block" data-detail-panel>
    <h2>TL;DR</h2>
    <ul class="detail-list">
      <li><strong>Question:</strong> Can a policy select useful next actions in a bounded diagnostic workflow while respecting visible evidence and fixed tool and decision budgets?</li>
      <li><strong>Experiment:</strong> Six policies (fixed order, rules, and GLiClass and Laya each with and without evidence masking) ran on 12 development and 12 evaluation synthetic scenarios, with every decision recorded as a replayable trace.</li>
      <li><strong>Finding:</strong> Evidence masking prevented unsupported diagnosis proposals for both model families, but neither learned policy beat fixed order on this inspected synthetic suite.</li>
    </ul>
  </section>

  <section id="build" class="detail-block" data-detail-panel>
    <h2>What I Built</h2>
    <ul class="project-components">
      <li><strong>Deterministic harness:</strong> four bounded fixture tools return checked-in database, authentication, storage and service-health observations; they never call live services or change systems. The harness alone controls candidate eligibility, evidence masking, tool returns, proposal acceptance or rejection, budgets and terminal accounting.</li>
      <li><strong>Learned action selection:</strong> GLiClass and Laya choose among the actions the harness makes available. The harness never overrides a model's choice with an argmax or hidden-label fallback, and gold outcomes and unrequested observations stay hidden from every policy.</li>
      <li><strong>Baselines and variants:</strong> deterministic fixed-order and rules baselines, plus unmasked and evidence-masked variants of each model, run in separate sequential worker processes that reuse each model for its two variants.</li>
      <li><strong>Replay and viewer:</strong> versioned, model-free replay of the recorded decision traces, and a standard-library exporter that builds a self-contained HTML viewer needing no model weights, PyTorch, server or network access.</li>
      <li><strong>Verified deploy:</strong> GitHub Actions runs the model-free tests and the export on pull requests, and deploys only the generated site from the main branch after verification.</li>
    </ul>
  </section>

  <section id="results" class="detail-block" data-detail-panel>
    <h2>Results</h2>
    <div class="detail-metric-grid">
      <article class="detail-metric">
        <p class="detail-metric__label">Fixed order</p>
        <h3>13/13 · 11/11</h3>
        <p>Correct supported diagnoses and correct reviews across both splits, with no incorrect diagnoses, unnecessary reviews or failed episodes.</p>
      </article>
      <article class="detail-metric">
        <p class="detail-metric__label">Evidence masking</p>
        <h3>38 → 0 · 48 → 0</h3>
        <p>Unsupported diagnosis proposals for GLiClass and Laya; failed episodes fell from 19 and 24 to zero.</p>
      </article>
      <article class="detail-metric">
        <p class="detail-metric__label">Masked models</p>
        <h3>8/13 · 6/13</h3>
        <p>Correct supported diagnoses for masked Laya and masked GLiClass, which still made 2 and 1 incorrect diagnoses.</p>
      </article>
    </div>

    <div class="project-points" style="margin-top: 1rem;">
      <p><strong>The tradeoff:</strong> masking increased reviews, including unnecessary ones (5 for Laya, 7 for GLiClass). A diagnosis supported by visible evidence can still be premature: on one evaluation scenario, masked Laya checked only the database before diagnosing, while the scenario held multiple faults.</p>
      <div class="project-limitations">
        <h3>Limits of the comparison</h3>
        <ul>
          <li><strong>Scenario scope:</strong> the 24 scenarios are inspected synthetic regression cases, not held-out data or evidence of production accuracy.</li>
          <li><strong>Model scores:</strong> scores are uncalibrated and never authorize an action.</li>
          <li><strong>Input formats:</strong> GLiClass and Laya receive different native input formats, so the comparison does not isolate model architecture.</li>
          <li><strong>Tuning:</strong> no confidence threshold was fitted and no prompt variants were searched.</li>
        </ul>
      </div>
    </div>
  </section>

  <section id="links" class="detail-block" data-detail-panel>
    <h2>Links</h2>
    <p>The demo is a viewer for the recorded traces. It does not run live model inference or perform any operational remediation.</p>
    <p class="project-links">
      <a class="btn btn--primary" href="{{ page.demo_url }}" target="_blank" rel="noopener noreferrer">Explore demo</a>
      <a class="btn btn--inverse" href="{{ page.github_url }}" target="_blank" rel="noopener noreferrer">Source code</a>
    </p>
  </section>
</div>
