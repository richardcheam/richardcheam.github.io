---
layout: default
title: "IMDb Sentiment with Mixture of Experts"
permalink: /projects/imdb-moe/
demo_url: ""
github_url: "https://github.com/richardcheam"
---

<div class="detail-shell detail-shell--project" data-detail-tabs>
  <p><a class="project-backlink" href="{{ '/projects/' | relative_url }}">Back to Projects</a></p>
  <p class="minimal-kicker">NLP • March 2025</p>
  <p class="minimal-intro">Case study focused on benchmarking transformer baselines and testing dynamic expert routing.</p>

  <div class="detail-chips" aria-label="Project highlights">
    <span class="detail-chip detail-chip--role"><span class="detail-chip__label">Role:</span> <span class="detail-chip__value">ML Engineer</span></span>
    <span class="detail-chip detail-chip--impact"><span class="detail-chip__label">Impact:</span> <span class="detail-chip__value">Reproducible benchmark framework</span></span>
    <span class="detail-chip detail-chip--stack"><span class="detail-chip__label">Stack:</span> <span class="detail-chip__value">PyTorch • Hugging Face • MoE</span></span>
  </div>

  <nav class="detail-nav" aria-label="Section navigation">
    <a href="#tldr" data-detail-trigger>TL;DR</a>
    <a href="#build" data-detail-trigger>Build</a>
    <a href="#results" data-detail-trigger>Results</a>
    <a href="#links" data-detail-trigger>Links</a>
  </nav>

  <section id="tldr" class="minimal-project detail-block detail-block--tldr" data-detail-panel>
    <h2>TL;DR</h2>
    <ul class="detail-list">
      <li><strong>Problem:</strong> Compare strong transformer baselines and test whether routing experts can specialize better.</li>
      <li><strong>Impact:</strong> Built a controlled framework for fair architecture comparisons and ablation runs.</li>
      <li><strong>Stack:</strong> DistilBERT, RoBERTa, DeBERTa, custom MoE in PyTorch.</li>
    </ul>
  </section>

  <section id="build" class="minimal-project detail-block detail-block--alt" data-detail-panel>
    <h2>What I Built</h2>
    <div class="project-points">
      <p><strong>Data pipeline:</strong> Consistent preprocessing, tokenization strategy, and train/validation/test split controls.</p>
      <p><strong>Baselines:</strong> DistilBERT, RoBERTa, and DeBERTa under aligned training settings.</p>
      <p><strong>MoE design:</strong> Router-guided expert selection with tracked expert usage distribution and confidence behavior.</p>
      <p><strong>Evaluation:</strong> Accuracy/F1 comparison, compute tracking, and error analysis by review length and sentiment polarity.</p>
    </div>
  </section>

  <section id="results" class="minimal-project detail-block" data-detail-panel>
    <h2>Results</h2>
    <div class="detail-metric-grid">
      <div class="detail-metric"><p class="detail-metric__label">Evidence</p><h3>Structured Ablations</h3><p>Each model was evaluated under aligned settings for direct comparison.</p></div>
      <div class="detail-metric"><p class="detail-metric__label">Engineering</p><h3>Reusable Pipeline</h3><p>Experiment config can be reused for new models and datasets quickly.</p></div>
    </div>
  </section>

  <section id="links" class="minimal-project detail-block detail-block--alt" data-detail-panel>
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
