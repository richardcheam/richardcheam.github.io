---
layout: default
title: "Inference Engineering"
permalink: /projects/inference-engineering/
demo_url: "https://richardcheam.github.io/inference-engineering/"
github_url: "https://github.com/richardcheam/inference-engineering"
---

<div class="detail-shell" data-detail-tabs>
  <p data-reveal><a class="project-backlink" href="{{ '/projects/' | relative_url }}">Back to Projects</a></p>
  <p class="minimal-kicker" data-reveal>LLM Inference · September 2026</p>
  <p class="minimal-intro" data-reveal>A public field guide to LLM inference engineering: ten chapters that each settle one question, from whether a model fits to what you would actually deploy, worked from pinned sources and tested arithmetic.</p>

  <div class="detail-chips" aria-label="Project highlights" data-reveal>
    <span class="detail-chip detail-chip--role"><span class="detail-chip__label">Role:</span> <span class="detail-chip__value">Author &amp; engineer</span></span>
    <span class="detail-chip detail-chip--impact"><span class="detail-chip__label">Impact:</span> <span class="detail-chip__value">Public field guide with 16 tested interactive figures</span></span>
    <span class="detail-chip detail-chip--stack"><span class="detail-chip__label">Stack:</span> <span class="detail-chip__value">React 19 · Vite · Playwright · GitHub Actions</span></span>
  </div>

  <nav class="detail-nav" aria-label="Section navigation" data-reveal>
    <a href="#tldr" data-detail-trigger>TL;DR</a>
    <a href="#build" data-detail-trigger>Build</a>
    <a href="#results" data-detail-trigger>Results</a>
    <a href="#visuals" data-detail-trigger>Visuals</a>
    <a href="#links" data-detail-trigger>Links</a>
  </nav>

  <section id="tldr" class="detail-block" data-detail-panel>
    <h2>TL;DR</h2>
    <ul class="detail-list">
      <li><strong>Problem:</strong> Learn to take an unfamiliar open-weight model from its architecture to a justified serving design, and make every step of that reasoning checkable.</li>
      <li><strong>Approach:</strong> Ten chapters, each following one question, plus thirteen reference documents. Every number comes from a pinned source (model configurations, vLLM source at a pinned commit, device specifications) or from a tested function.</li>
      <li><strong>Outcome:</strong> A public field guide with 16 interactive figures, deployed only when its unit and browser tests pass.</li>
    </ul>
  </section>

  <section id="build" class="detail-block" data-detail-panel hidden>
    <h2>What I Built</h2>
    <div class="project-points">
      <p><strong>Ten question-led chapters:</strong> from "will the model fit?" through hardware speed limits, prefill, decode and reuse, engine internals, measurement, finding the bottleneck, parallelism and placement, quantization and speculation, to "what would you actually deploy?".</p>
      <p><strong>Thirteen reference documents:</strong> a model study, a device reference, a cheatsheet, engine notes, a benchmarking method, a source registry and more, rendered from the same Markdown the chapters draw on.</p>
      <p><strong>Figures computed, not drawn:</strong> each of the 16 interactive figures runs on tested JavaScript functions for memory, bandwidth, placement and speculation, so a figure cannot drift from its model. They include a memory-budget explorer, a decode walkthrough you can step through, an engine step loop showing the block pool, and a "division field" where per-device memory falls as modelled synchronisation points grow.</p>
      <p><strong>Evidence discipline:</strong> every number traces to a pinned source or a tested function, and each claim says what kind of claim it is. Where a number would have to be invented, the guide says so instead.</p>
    </div>
  </section>

  <section id="results" class="detail-block" data-detail-panel hidden>
    <h2>Results</h2>
    <div class="detail-metric-grid">
      <article class="detail-metric">
        <p class="detail-metric__label">Release</p>
        <h3>Public Field Guide</h3>
        <p>Ten chapters and thirteen reference documents, live on GitHub Pages.</p>
      </article>
      <article class="detail-metric">
        <p class="detail-metric__label">Interactive Scope</p>
        <h3>16 Figures</h3>
        <p>Each one computed from the same tested functions the text relies on.</p>
      </article>
      <article class="detail-metric">
        <p class="detail-metric__label">Quality Gate</p>
        <h3>172 + 96 Tests</h3>
        <p>172 unit tests on the calculations and 96 browser tests on design, layout and accessibility, run on every push.</p>
      </article>
    </div>

    <div class="project-points" style="margin-top: 1rem;">
      <p><strong>Gated deploy:</strong> GitHub Actions runs the unit tests, builds the site, runs the browser tests against that build, and publishes only if everything passes.</p>
      <p><strong>What it is not:</strong> no model was served and no GPU was measured for this project. The guide contains no benchmark results and claims no speedups; it is an analytical study built on pinned sources.</p>
    </div>
  </section>

  <section id="visuals" class="detail-block" data-detail-panel hidden>
    <h2>Visuals</h2>
    <p>Screenshots of the live field guide, which has its own design.</p>
    <p>
      <img src="{{ '/assets/projects/inference-engineering/field-guide-home.png' | relative_url }}" alt="Inference Engineering field guide home page" style="width:100%; border-radius: 18px; border: 1px solid #d6dce5; margin-top: 0.75rem;" />
    </p>
    <p>
      <img src="{{ '/assets/projects/inference-engineering/division-field.png' | relative_url }}" alt="The division field: per-device memory and modelled synchronisation points across eight devices" style="width:100%; border-radius: 18px; border: 1px solid #d6dce5;" />
    </p>
    <p>
      <img src="{{ '/assets/projects/inference-engineering/memory-budget-explorer.png' | relative_url }}" alt="Memory budget explorer showing weights, KV cache and runtime reserve against a device budget" style="width:100%; border-radius: 18px; border: 1px solid #d6dce5;" />
    </p>
  </section>

  <section id="links" class="detail-block" data-detail-panel hidden>
    <h2>Links</h2>
    <p class="project-links">
      <a class="btn btn--primary" href="{{ page.demo_url }}" target="_blank" rel="noopener noreferrer">Live Demo</a>
      <a class="btn btn--inverse" href="{{ page.github_url }}" target="_blank" rel="noopener noreferrer">GitHub</a>
    </p>
  </section>
</div>
