---
layout: default
title: "IMDb Sentiment with Mixture of Experts"
permalink: /projects/imdb-moe/
demo_url: ""
github_url: "https://github.com/richardcheam"
---

<p><a class="project-backlink" href="{{ '/projects/' | relative_url }}">Back to Projects</a></p>
<p class="minimal-kicker">NLP • March 2025</p>
<p class="minimal-intro">Case study focused on benchmarking transformer baselines and testing dynamic expert routing.</p>

<section class="minimal-project project-detail-block">
  <h2>Project Snapshot</h2>
  <div class="project-points">
    <p><strong>Scope:</strong> Binary sentiment classification on IMDb reviews.</p>
    <p><strong>Goal:</strong> Compare strong baseline models while validating whether MoE routing can improve specialization.</p>
    <p><strong>Outcome:</strong> A reproducible evaluation setup for controlled model comparisons and ablation runs.</p>
  </div>
</section>

<section class="minimal-project project-detail-block">
  <h2>Build Details</h2>
  <div class="project-points">
    <p><strong>Data pipeline:</strong> Consistent preprocessing, tokenization strategy, and train/validation/test split controls.</p>
    <p><strong>Baselines:</strong> DistilBERT, RoBERTa, and DeBERTa under aligned training settings.</p>
    <p><strong>MoE design:</strong> Router-guided expert selection with tracked expert usage distribution and confidence behavior.</p>
    <p><strong>Evaluation:</strong> Accuracy/F1 comparison, compute tracking, and error analysis by review length and sentiment polarity.</p>
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
