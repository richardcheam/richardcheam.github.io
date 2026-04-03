---
layout: default
title: "Projects"
permalink: /projects/
---

<section class="page-intro" data-reveal>
  <p class="section-eyebrow">Projects</p>
  <h2>Selected ML / AI works</h2>
  <p class="section-description">
    Each project is presented with a clear problem statement, implementation details, and measurable outcomes.
  </p>
</section>

<section class="cards-grid" aria-label="Project cards">
  <article class="premium-card project-card" data-reveal>
    <p class="card-meta">Computer Vision · April 2026</p>
    <h3 class="card-title">XAI Vision Transfer</h3>
    <p class="card-summary">Explainable architecture study comparing CNN, ViT, and DHVT across CIFAR-10, EuroSAT, and Brain Tumor MRI under scratch, linear-probe, and full-fine-tune settings.</p>
    <div class="project-stack">
      <span class="tag">PyTorch</span>
      <span class="tag">XAI</span>
      <span class="tag">Transfer Learning</span>
    </div>
    <a class="card-link" href="{{ '/projects/xai-vision-transfer/' | relative_url }}">Open project</a>
  </article>

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
</section>
