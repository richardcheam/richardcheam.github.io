---
layout: default
title: "ELSA Structuring and Frailty Index Pipeline"
permalink: /projects/elsa-frailty/
demo_url: ""
github_url: "https://github.com/richardcheam"
---

<div class="detail-shell">
  <p><a class="project-backlink" href="{{ '/projects/' | relative_url }}">Back to Projects</a></p>
  <p class="minimal-kicker">Research Data Science • 2024</p>
  <p class="minimal-intro">Case study on cleaning heterogeneous longitudinal survey waves and building a reproducible frailty scoring workflow.</p>

  <div class="detail-chips" aria-label="Project highlights">
    <span class="detail-chip">Scale: 8,000+ participants</span>
    <span class="detail-chip">Coverage: 18 years</span>
    <span class="detail-chip">Output: 57-variable frailty index</span>
  </div>

  <nav class="detail-nav" aria-label="Section navigation">
    <a href="#tldr">TL;DR</a>
    <a href="#build">Build</a>
    <a href="#results">Results</a>
    <a href="#links">Links</a>
  </nav>

  <section id="tldr" class="minimal-project detail-block detail-block--tldr">
    <h2>TL;DR</h2>
    <ul class="detail-list">
      <li><strong>Problem:</strong> 18 years of survey data were heterogeneous and difficult to compare reliably.</li>
      <li><strong>Impact:</strong> Delivered reproducible data preparation and scoring workflow for longitudinal analysis.</li>
      <li><strong>Stack:</strong> Python, pandas, statistical checks, modular data pipeline design.</li>
    </ul>
  </section>

  <section id="build" class="minimal-project detail-block detail-block--alt">
    <h2>What I Built</h2>
    <div class="project-points">
      <p><strong>Data engineering:</strong> Harmonized variable naming, missingness handling, and wave alignment.</p>
      <p><strong>Scoring:</strong> Implemented modular frailty component scoring and aggregate index computation.</p>
      <p><strong>Quality checks:</strong> Validation on consistency across demographics and socioeconomic strata.</p>
      <p><strong>Output:</strong> Reproducible tables and plots for trajectory-level interpretation.</p>
    </div>
  </section>

  <section id="results" class="minimal-project detail-block">
    <h2>Results</h2>
    <div class="detail-metric-grid">
      <div class="detail-metric"><p class="detail-metric__label">Scale</p><h3>8,000+</h3><p>Participants processed in a consistent longitudinal format.</p></div>
      <div class="detail-metric"><p class="detail-metric__label">Features</p><h3>57 variables</h3><p>Frailty index components standardized across waves.</p></div>
      <div class="detail-metric"><p class="detail-metric__label">Timeline</p><h3>18 years</h3><p>Unified trajectory analysis over long historical coverage.</p></div>
    </div>
  </section>

  <section id="links" class="minimal-project detail-block detail-block--alt">
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
