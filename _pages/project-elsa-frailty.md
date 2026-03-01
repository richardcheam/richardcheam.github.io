---
layout: default
title: "ELSA Structuring and Frailty Index Pipeline"
permalink: /projects/elsa-frailty/
demo_url: ""
github_url: "https://github.com/richardcheam"
---

<p><a class="project-backlink" href="{{ '/projects/' | relative_url }}">Back to Projects</a></p>
<p class="minimal-kicker">Research Data Science • 2024</p>
<p class="minimal-intro">Case study on cleaning heterogeneous longitudinal survey waves and building a reproducible frailty scoring workflow.</p>

<section class="minimal-project project-detail-block">
  <h2>Project Snapshot</h2>
  <div class="project-points">
    <p><strong>Scope:</strong> 18 years of ELSA data across multiple domains and collection waves.</p>
    <p><strong>Goal:</strong> Standardize and integrate variables to support robust aging and frailty analysis.</p>
    <p><strong>Outcome:</strong> Structured dataset and 57-variable frailty index pipeline for 8,000+ participants.</p>
  </div>
</section>

<section class="minimal-project project-detail-block">
  <h2>Build Details</h2>
  <div class="project-points">
    <p><strong>Data engineering:</strong> Harmonized variable naming, missingness handling, and wave alignment.</p>
    <p><strong>Scoring:</strong> Implemented modular frailty component scoring and aggregate index computation.</p>
    <p><strong>Quality checks:</strong> Validation on consistency across demographics and socioeconomic strata.</p>
    <p><strong>Output:</strong> Reproducible tables and plots for trajectory-level interpretation.</p>
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
