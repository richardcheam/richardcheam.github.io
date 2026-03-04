---
layout: default
title: "Projects"
permalink: /projects/
---

<section class="page-intro" data-reveal>
  <p class="section-eyebrow">Projects</p>
  <h2>Selected ML / AI builds</h2>
  <p class="section-description">
    Each project is presented with a clear problem statement, implementation details, and measurable outcomes.
  </p>
</section>

<section class="cards-grid" aria-label="Project cards">
  <article class="premium-card project-card" data-reveal>
    <p class="card-meta">NLP · March 2025</p>
    <h3 class="card-title">IMDb Sentiment with Mixture of Experts</h3>
    <p class="card-summary">Transformer benchmarking with custom routing to evaluate expert specialization quality and engineering reproducibility.</p>
    <div class="project-stack">
      <span class="tag">PyTorch</span>
      <span class="tag">Hugging Face</span>
      <span class="tag">MoE</span>
    </div>
    <a class="card-link" href="{{ '/projects/imdb-moe/' | relative_url }}">Open project</a>
  </article>

  <article class="premium-card project-card" data-reveal>
    <p class="card-meta">Computer Vision · December 2024</p>
    <h3 class="card-title">SSL and Semi-supervised Learning on MNIST</h3>
    <p class="card-summary">Low-label classification strategy combining pseudo-labeling and SimCLR representations under strict supervision limits.</p>
    <div class="project-stack">
      <span class="tag">PyTorch</span>
      <span class="tag">CNN</span>
      <span class="tag">SimCLR</span>
    </div>
    <a class="card-link" href="{{ '/projects/mnist-ssl/' | relative_url }}">Open project</a>
  </article>

  <article class="premium-card project-card" data-reveal>
    <p class="card-meta">Speech Systems · Ongoing</p>
    <h3 class="card-title">Streaming Speech Reliability Toolkit</h3>
    <p class="card-summary">Operational notes and benchmark patterns for low-latency speech inference, monitoring, and trace-based debugging.</p>
    <div class="project-stack">
      <span class="tag">ASR</span>
      <span class="tag">Latency</span>
      <span class="tag">Evaluation</span>
    </div>
    <a class="card-link" href="{{ '/notes/2026-03-01-speech-ai/' | relative_url }}">Read related note</a>
  </article>
</section>
