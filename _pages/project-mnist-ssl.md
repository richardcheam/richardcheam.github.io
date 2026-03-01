---
layout: default
title: "SSL and Semi-Supervised Learning on MNIST"
permalink: /projects/mnist-ssl/
demo_url: ""
github_url: "https://github.com/richardcheam"
---

<div class="detail-shell detail-shell--project" data-detail-tabs>
  <p><a class="project-backlink" href="{{ '/projects/' | relative_url }}">Back to Projects</a></p>
  <p class="minimal-kicker">Computer Vision • December 2024</p>
  <p class="minimal-intro">Case study on low-label learning with pseudo-labeling and SimCLR representations.</p>

  <div class="detail-chips" aria-label="Project highlights">
    <span class="detail-chip detail-chip--impact"><span class="detail-chip__label">Impact:</span> <span class="detail-chip__value">98.55% SimCLR probe</span></span>
    <span class="detail-chip detail-chip--constraint"><span class="detail-chip__label">Constraint:</span> <span class="detail-chip__value">100 labels</span></span>
    <span class="detail-chip detail-chip--stack"><span class="detail-chip__label">Stack:</span> <span class="detail-chip__value">PyTorch • CNN • SimCLR</span></span>
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
      <li><strong>Problem:</strong> Train robust models with only 100 labeled samples over 60,000 images.</li>
      <li><strong>Impact:</strong> Demonstrated strong performance with both semi-supervised and self-supervised approaches.</li>
      <li><strong>Stack:</strong> CNN pseudo-labeling pipeline plus SimCLR representation pretraining.</li>
    </ul>
  </section>

  <section id="build" class="minimal-project detail-block detail-block--alt" data-detail-panel hidden>
    <h2>What I Built</h2>
    <div class="project-points">
      <p><strong>Semi-supervised track:</strong> CNN backbone with pseudo-label refresh and targeted augmentations.</p>
      <p><strong>Self-supervised track:</strong> SimCLR pretraining and downstream probing with minimal labels.</p>
      <p><strong>Protocol:</strong> Stable splits and repeatable training seeds for fair model comparison.</p>
      <p><strong>Analysis:</strong> Confidence distribution checks and failure-case sampling for ambiguous digits.</p>
    </div>
  </section>

  <section id="results" class="minimal-project detail-block" data-detail-panel hidden>
    <h2>Results</h2>
    <div class="detail-metric-grid">
      <div class="detail-metric"><p class="detail-metric__label">Semi-supervised</p><h3>97.18%</h3><p>CNN with pseudo-labeling under strict low-label constraints.</p></div>
      <div class="detail-metric"><p class="detail-metric__label">Self-supervised</p><h3>98.55%</h3><p>SimCLR linear probe with only 100 labeled samples.</p></div>
      <div class="detail-metric"><p class="detail-metric__label">Self-supervised</p><h3>98.44%</h3><p>SimCLR with MLP classification head.</p></div>
    </div>
  </section>

  <section id="links" class="minimal-project detail-block detail-block--alt" data-detail-panel hidden>
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
