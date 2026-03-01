---
layout: default
title: "SSL and Semi-Supervised Learning on MNIST"
permalink: /projects/mnist-ssl/
demo_url: ""
github_url: "https://github.com/richardcheam"
---

<p><a class="project-backlink" href="{{ '/projects/' | relative_url }}">Back to Projects</a></p>
<p class="minimal-kicker">Computer Vision • December 2024</p>
<p class="minimal-intro">Case study on low-label learning with pseudo-labeling and SimCLR representations.</p>

<section class="minimal-project project-detail-block">
  <h2>Project Snapshot</h2>
  <div class="project-points">
    <p><strong>Scope:</strong> Build robust classifiers with only 100 labeled samples from MNIST.</p>
    <p><strong>Goal:</strong> Evaluate semi-supervised and self-supervised strategies under strict label constraints.</p>
    <p><strong>Outcome:</strong> 97.18% (semi-supervised), 98.55% SimCLR linear probe, 98.44% SimCLR + MLP head.</p>
  </div>
</section>

<section class="minimal-project project-detail-block">
  <h2>Build Details</h2>
  <div class="project-points">
    <p><strong>Semi-supervised track:</strong> CNN backbone with pseudo-label refresh and targeted augmentations.</p>
    <p><strong>Self-supervised track:</strong> SimCLR pretraining and downstream probing with minimal labels.</p>
    <p><strong>Protocol:</strong> Stable splits and repeatable training seeds for fair model comparison.</p>
    <p><strong>Analysis:</strong> Confidence distribution checks and failure-case sampling for ambiguous digits.</p>
  </div>
</section>

<section class="minimal-project project-detail-block">
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
