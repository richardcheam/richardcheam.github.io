---
layout: default
title: "SSL and Semi-Supervised Learning on MNIST"
permalink: /projects/mnist-ssl/
demo_url: ""
github_url: "https://github.com/richardcheam"
---

<div class="detail-shell" data-detail-tabs>
  <p data-reveal><a class="project-backlink" href="{{ '/projects/' | relative_url }}">Back to Projects</a></p>
  <p class="minimal-kicker" data-reveal>Computer Vision · December 2024</p>
  <p class="minimal-intro" data-reveal>Low-label learning case study with pseudo-labeling and SimCLR representations.</p>

  <div class="detail-chips" aria-label="Project highlights" data-reveal>
    <span class="detail-chip detail-chip--impact"><span class="detail-chip__label">Impact:</span> <span class="detail-chip__value">98.55% SimCLR probe</span></span>
    <span class="detail-chip detail-chip--constraint"><span class="detail-chip__label">Constraint:</span> <span class="detail-chip__value">100 labels</span></span>
    <span class="detail-chip detail-chip--stack"><span class="detail-chip__label">Stack:</span> <span class="detail-chip__value">PyTorch · CNN · SimCLR</span></span>
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
      <li><strong>Problem:</strong> Train strong classifiers with only 100 labeled samples across 60,000 images.</li>
      <li><strong>Approach:</strong> Combined pseudo-labeling and self-supervised representation learning in a reproducible protocol.</li>
      <li><strong>Outcome:</strong> High-quality results under strict label constraints, with clear error-analysis workflow.</li>
    </ul>
  </section>

  <section id="build" class="detail-block" data-detail-panel>
    <h2>What I Built</h2>
    <ul class="project-components">
      <li><strong>Semi-supervised branch:</strong> CNN baseline with pseudo-label refresh loops and targeted augmentation.</li>
      <li><strong>Self-supervised branch:</strong> SimCLR pretraining with downstream linear-probe and MLP-head evaluation.</li>
      <li><strong>Protocol controls:</strong> Stable splits, repeatable seeds, and aligned evaluation criteria.</li>
      <li><strong>Analysis:</strong> Confidence profiles and failure-sample inspection for ambiguous digits.</li>
    </ul>
  </section>

  <section id="results" class="detail-block" data-detail-panel>
    <h2>Results</h2>
    <p>These reported MNIST results come from the low-label study using 100 labeled samples across 60,000 images.</p>
    <div class="project-table-scroll" role="region" aria-label="Project results comparison" tabindex="0">
    <table>
      <thead><tr><th>Learning path</th><th>Reported result</th><th>Evaluation setting</th></tr></thead>
      <tbody>
        <tr><td>CNN with pseudo-labeling</td><td>97.18%</td><td>Semi-supervised, under strict low-label conditions</td></tr>
        <tr><td>SimCLR linear probe</td><td>98.55%</td><td>Only 100 labeled samples</td></tr>
        <tr><td>SimCLR with MLP classification head</td><td>98.44%</td><td>Self-supervised representation learning</td></tr>
      </tbody>
    </table>
    </div>
  </section>

  <section id="links" class="detail-block" data-detail-panel>
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
