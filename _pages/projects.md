---
layout: default
title: "Projects"
permalink: /projects/
---

<section class="home-section" aria-label="Projects overview">
  <div class="home-section__header">
    <p class="home-section__eyebrow">Projects</p>
    <h2>Focused builds</h2>
    <p class="home-section__description">
      Each exercises a different AI stack and wraps insights into creditable deliverables. Click into any card for a
      cinematic walkthrough, TL;DR metrics, and the live links you requested.
    </p>
  </div>
  <div class="home-project-grid">
    <article class="home-project-card">
      <p class="home-project-card__kicker">NLP • March 2025</p>
      <h3>IMDb Sentiment with Mixture of Experts</h3>
      <span class="home-project-card__badge" aria-hidden="true">LLM</span>
      <p class="home-project-card__lead">
        Benchmarking BERT-family backbones while designing a router-steering expert stack that reacts to sentiment
        ambiguity with graceful scaling.
      </p>
      <div class="home-project-card__stats">
        <span class="detail-chip detail-chip--impact"><span class="detail-chip__value">Reproducible benchmark</span></span>
        <span class="detail-chip detail-chip--stack"><span class="detail-chip__value">PyTorch • Hugging Face • MoE</span></span>
      </div>
      <div class="home-project-card__cta">
        <a class="btn btn--ghost" href="{{ '/projects/imdb-moe/' | relative_url }}">More details</a>
        <a class="btn btn--ghost" href="https://github.com/richardcheam" target="_blank" rel="noreferrer">GitHub</a>
      </div>
    </article>
    <article class="home-project-card">
      <p class="home-project-card__kicker">Computer Vision • December 2024</p>
      <h3>SSL &amp; Semi-supervised Learning on MNIST</h3>
      <span class="home-project-card__badge" aria-hidden="true">SSL</span>
      <p class="home-project-card__lead">
        Low-label training with pseudo-label refreshes and SimCLR probes to turn 100 samples into confident proofs.
      </p>
      <div class="home-project-card__stats">
        <span class="detail-chip detail-chip--impact"><span class="detail-chip__value">98.55% SimCLR probe</span></span>
        <span class="detail-chip detail-chip--constraint"><span class="detail-chip__value">100 labels</span></span>
      </div>
      <div class="home-project-card__cta">
        <a class="btn btn--ghost" href="{{ '/projects/mnist-ssl/' | relative_url }}">More details</a>
        <a class="btn btn--ghost" href="https://github.com/richardcheam" target="_blank" rel="noreferrer">GitHub</a>
      </div>
    </article>
  </div>
</section>
