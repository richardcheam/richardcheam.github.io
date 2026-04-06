---
layout: default
title: "Customer Feedback Intelligence"
permalink: /projects/imdb-moe/
demo_url: ""
github_url: "https://github.com/richardcheam/customer-feedback-intelligence"
---

<div class="detail-shell" data-detail-tabs>
  <p data-reveal><a class="project-backlink" href="{{ '/projects/' | relative_url }}">Back to Projects</a></p>
  <p class="minimal-kicker" data-reveal>NLP · April 2026</p>
  <p class="minimal-intro" data-reveal>Rebuilt an earlier IMDb sentiment project into a customer-feedback intelligence system with benchmarking, transfer checks, and a full-batch triage dashboard.</p>

  <div class="detail-chips" aria-label="Project highlights" data-reveal>
    <span class="detail-chip detail-chip--role"><span class="detail-chip__label">Role:</span> <span class="detail-chip__value">ML / Product Engineer</span></span>
    <span class="detail-chip detail-chip--impact"><span class="detail-chip__label">Impact:</span> <span class="detail-chip__value">Benchmark-to-dashboard customer-feedback workflow</span></span>
    <span class="detail-chip detail-chip--stack"><span class="detail-chip__label">Stack:</span> <span class="detail-chip__value">Python · scikit-learn · Hugging Face · Gradio</span></span>
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
      <li><strong>Problem:</strong> Move beyond an isolated IMDb benchmark and turn sentiment modeling into something closer to a usable customer-feedback analysis tool.</li>
      <li><strong>Approach:</strong> Rebuilt the project around a reproducible IMDb baseline, transfer evaluation on Amazon reviews, and a Gradio dashboard for full-batch upload, triage, clustering, and export.</li>
      <li><strong>Outcome:</strong> End-to-end workflow that benchmarks a saved sentiment model, checks cross-domain transfer, and applies it to real customer-feedback-style review batches.</li>
    </ul>
  </section>

  <section id="build" class="detail-block" data-detail-panel hidden>
    <h2>What I Built</h2>
    <div class="project-points">
      <p><strong>Reproducible benchmark:</strong> built a clean IMDb pipeline with deterministic sampling, TF-IDF + Logistic Regression as the active saved baseline, and a RoBERTa fine-tuning path for later higher-capacity runs.</p>
      <p><strong>Transfer checks:</strong> evaluated the IMDb-trained model on Amazon polarity reviews and on a fixed local 200-example customer-feedback evaluation set to see how far the benchmark generalizes without retraining.</p>
      <p><strong>Dashboard product surface:</strong> added a Gradio interface that accepts pasted text or uploads, preserves metadata like `channel` and `product`, scores the whole batch, and exports the filtered results as CSV.</p>
      <p><strong>Triage and summarization:</strong> layered confidence, uncertainty, manual-review gating, priority scoring, and exploratory theme clustering on top of raw sentiment predictions so the tool feels useful for analysts instead of just model inspection.</p>
    </div>
  </section>

  <section id="results" class="detail-block" data-detail-panel hidden>
    <h2>Results</h2>
    <div class="detail-metric-grid">
      <article class="detail-metric">
        <p class="detail-metric__label">IMDb Benchmark</p>
        <h3>90.15%</h3>
        <p>TF-IDF baseline test accuracy and macro F1 on IMDb with a reproducible saved inference artifact.</p>
      </article>
      <article class="detail-metric">
        <p class="detail-metric__label">Amazon Transfer</p>
        <h3>85.65%</h3>
        <p>Zero-shot accuracy on Amazon polarity, showing the IMDb-trained model transfers partially but not perfectly to product reviews.</p>
      </article>
      <article class="detail-metric">
        <p class="detail-metric__label">Product Surface</p>
        <h3>Full-Batch Dashboard</h3>
        <p>Upload, triage, cluster, filter, and export customer-feedback batches instead of only scoring one review at a time.</p>
      </article>
    </div>

    <div class="project-points" style="margin-top: 1rem;">
      <p><strong>Project evolution:</strong> this started from an older IMDb sentiment and MoE direction, but I intentionally rebuilt it into a cleaner product-facing story centered on reusable inference and customer-feedback analysis.</p>
      <p><strong>What the current results mean:</strong> IMDb is strong enough to produce a useful starting sentiment model, while the Amazon and local-customer-feedback checks make the cross-domain limits explicit instead of hiding them.</p>
      <p><strong>Why it matters:</strong> the project now connects benchmarking, transfer evaluation, and a usable dashboard surface in one coherent workflow rather than stopping at model training.</p>
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
