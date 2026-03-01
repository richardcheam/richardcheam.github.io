---
title: "World Model"
date: 2026-03-01
category: "world-models"
excerpt: "Working notes on latent dynamics, planning, and model-based control."
---

<div class="detail-shell note-detail">
  <p><a class="notes-backlink" href="{{ '/notes/' | relative_url }}">Back to Notes</a></p>
  <p class="minimal-kicker">World Models • {{ page.date | date: "%d %b %Y" }}</p>
  <p class="minimal-intro">Practical checklist for comparing latent dynamics models under planning constraints.</p>

  <div class="detail-chips" aria-label="Note highlights">
    <span class="detail-chip detail-chip--impact"><span class="detail-chip__label">Focus:</span> <span class="detail-chip__value">model + planner separation</span></span>
    <span class="detail-chip detail-chip--constraint"><span class="detail-chip__label">Risk:</span> <span class="detail-chip__value">compounding error</span></span>
    <span class="detail-chip detail-chip--stack"><span class="detail-chip__label">Validation:</span> <span class="detail-chip__value">shift robustness</span></span>
  </div>

  <nav class="detail-nav" aria-label="Section navigation">
    <a href="#tldr">TL;DR</a>
    <a href="#criteria">Criteria</a>
    <a href="#checks">Checks</a>
  </nav>

  <section id="tldr" class="detail-block detail-block--tldr">
    <h2>TL;DR</h2>
    <ul class="detail-list">
      <li><strong>Goal:</strong> Evaluate world models beyond in-distribution prediction quality.</li>
      <li><strong>Method:</strong> Keep protocol fixed and separate model fidelity from planner quality.</li>
      <li><strong>Result:</strong> Track rollout error growth and document failure trajectories explicitly.</li>
    </ul>
  </section>

  <section id="criteria" class="detail-block detail-block--alt">
    <h2>Comparison Criteria</h2>
    <ul class="detail-list">
      <li>Keep data splits and evaluation protocol identical.</li>
      <li>Separate modeling quality from planning performance.</li>
      <li>Track compute budget and inference-time constraints.</li>
    </ul>
  </section>

  <section id="checks" class="detail-block">
    <h2>Checks</h2>
    <ul class="detail-list">
      <li>Evaluate under shift, not only in-distribution.</li>
      <li>Measure compounding error over rollout horizon.</li>
      <li>Document failure trajectories, not only averages.</li>
    </ul>
  </section>
</div>
