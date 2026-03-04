---
layout: default
title: "IMDb Sentiment with Mixture of Experts"
permalink: /projects/imdb-moe/
demo_url: ""
github_url: "https://github.com/richardcheam"
---

<div class="detail-shell" data-detail-tabs>
  <p data-reveal><a class="project-backlink" href="{{ '/projects/' | relative_url }}">Back to Projects</a></p>
  <p class="minimal-kicker" data-reveal>NLP · March 2025</p>
  <p class="minimal-intro" data-reveal>Benchmarking transformer baselines while testing whether expert routing improves specialization.</p>

  <div class="detail-chips" aria-label="Project highlights" data-reveal>
    <span class="detail-chip detail-chip--role"><span class="detail-chip__label">Role:</span> <span class="detail-chip__value">ML Engineer</span></span>
    <span class="detail-chip detail-chip--impact"><span class="detail-chip__label">Impact:</span> <span class="detail-chip__value">Reproducible benchmark framework</span></span>
    <span class="detail-chip detail-chip--stack"><span class="detail-chip__label">Stack:</span> <span class="detail-chip__value">PyTorch · Hugging Face · MoE</span></span>
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
      <li><strong>Problem:</strong> Compare strong transformer baselines and verify whether routed experts improve handling of ambiguous sentiment.</li>
      <li><strong>Approach:</strong> Controlled training protocol for DistilBERT, RoBERTa, DeBERTa, and a custom Mixture-of-Experts architecture.</li>
      <li><strong>Outcome:</strong> Reusable framework for fair ablations, confidence analysis, and extension to new datasets.</li>
    </ul>
  </section>

  <section id="build" class="detail-block" data-detail-panel hidden>
    <h2>What I Built</h2>
    <div class="project-points">
      <p><strong>Data pipeline:</strong> Consistent preprocessing, tokenization controls, and deterministic train/validation/test splits.</p>
      <p><strong>Baseline set:</strong> DistilBERT, RoBERTa, and DeBERTa under aligned hyperparameters.</p>
      <p><strong>MoE design:</strong> Router-guided expert activation with usage distribution tracking and confidence monitoring.</p>
      <p><strong>Evaluation:</strong> Accuracy/F1, error slices by review length, and compute-efficiency comparisons.</p>
    </div>
  </section>

  <section id="results" class="detail-block" data-detail-panel hidden>
    <h2>Results</h2>
    <div class="detail-metric-grid">
      <article class="detail-metric">
        <p class="detail-metric__label">Evidence</p>
        <h3>Structured Ablations</h3>
        <p>Each model was evaluated under aligned conditions for defensible comparison.</p>
      </article>
      <article class="detail-metric">
        <p class="detail-metric__label">Engineering</p>
        <h3>Reusable Pipeline</h3>
        <p>Experiment setup can be reused quickly for new architectures and datasets.</p>
      </article>
      <article class="detail-metric">
        <p class="detail-metric__label">Product Value</p>
        <h3>Clear Decision Support</h3>
        <p>Framework helps choose model families based on quality/efficiency tradeoffs.</p>
      </article>
    </div>
  </section>

  <section id="links" class="detail-block" data-detail-panel hidden>
    <h2>Links</h2>
    <p class="project-links">
      {% if page.demo_url and page.demo_url != "" %}
        <a class="btn btn--primary" href="{{ page.demo_url }}" target="_blank" rel="noopener noreferrer">Live Demo</a>
      {% else %}
        <span class="project-link-muted">Demo link coming soon</span>
      {% endif %}

      {% if page.github_url and page.github_url != "" %}
        <a class="btn btn--inverse" href="{{ page.github_url }}" target="_blank" rel="noopener noreferrer">GitHub</a>
      {% else %}
        <span class="project-link-muted">GitHub link coming soon</span>
      {% endif %}
    </p>
  </section>
</div>
