---
layout: default
permalink: /
title: "Richard Cheam"
---

{% assign sorted_notes = site.notes | sort: "date" | reverse %}

<section id="hero" class="hero section-block">
  <p class="section-eyebrow" data-reveal>AI / Machine Learning Engineer</p>
  <h1 class="hero__name" data-reveal>Richard Cheam</h1>
  <p class="hero__tagline" data-reveal>Building practical AI systems with clean research-to-product execution.</p>
  <p class="hero__support" data-reveal>
    Engineer's and Master's degree in Data Science &amp; AI. Currently at Renault, focused on dependable,
    production-ready ML experiences.
  </p>
  <div class="hero__actions" data-reveal>
    <a class="btn btn--primary" href="#projects">View Projects</a>
    <a class="btn btn--ghost" href="https://github.com/richardcheam" target="_blank" rel="noopener noreferrer">GitHub</a>
  </div>
</section>

<section id="projects" class="section-block" data-reveal>
  <header class="section-head">
    <p class="section-eyebrow">Featured Projects</p>
    <h2>Product-style project showcases</h2>
    <p class="section-description">Focused work with clear outcomes, stack decisions, and engineering constraints.</p>
  </header>
  <div class="cards-grid">
    <article class="premium-card project-card" data-reveal>
      <p class="card-meta">NLP · March 2025</p>
      <h3 class="card-title">IMDb Sentiment with Mixture of Experts</h3>
      <p class="card-summary">Benchmarked transformer baselines against a custom expert-routing architecture for robust sentiment classification.</p>
      <div class="project-stack">
        <span class="tag">PyTorch</span>
        <span class="tag">Hugging Face</span>
        <span class="tag">MoE</span>
      </div>
      <a class="card-link" href="{{ '/projects/imdb-moe/' | relative_url }}">View project</a>
    </article>

    <article class="premium-card project-card" data-reveal>
      <p class="card-meta">Computer Vision · December 2024</p>
      <h3 class="card-title">SSL and Semi-supervised Learning on MNIST</h3>
      <p class="card-summary">Reached strong accuracy under extreme label scarcity with pseudo-labeling and SimCLR representation learning.</p>
      <div class="project-stack">
        <span class="tag">PyTorch</span>
        <span class="tag">CNN</span>
        <span class="tag">SimCLR</span>
      </div>
      <a class="card-link" href="{{ '/projects/mnist-ssl/' | relative_url }}">View project</a>
    </article>

    <article class="premium-card project-card" data-reveal>
      <p class="card-meta">Speech Systems · Ongoing</p>
      <h3 class="card-title">Streaming Speech Reliability Toolkit</h3>
      <p class="card-summary">Latency-oriented evaluation setup for real-time speech pipelines with reproducible traces and release checklists.</p>
      <div class="project-stack">
        <span class="tag">ASR</span>
        <span class="tag">Latency</span>
        <span class="tag">Observability</span>
      </div>
      <a class="card-link" href="{{ '/notes/2026-03-01-speech-ai/' | relative_url }}">View summary</a>
    </article>
  </div>
</section>

<section id="notes" class="section-block" data-reveal>
  <header class="section-head">
    <p class="section-eyebrow">Knowledge Notes</p>
    <h2>AI paper summaries and concept cards</h2>
    <p class="section-description">A compact memory system for papers and concepts I revisit often.</p>
  </header>
  <div class="notes-grid">
    {% for note in sorted_notes limit:4 %}
      {% assign note_key = note.category | default: "note" | slugify %}
      {% assign category_label = "Note" %}
      {% for cat in site.data.notes_categories %}
        {% if cat.key == note_key %}
          {% assign category_label = cat.label %}
        {% endif %}
      {% endfor %}
      <article class="premium-card" data-reveal>
        <p class="card-meta">{{ category_label }}</p>
        <h3 class="card-title">{{ note.title }}</h3>
        <p class="card-summary">{{ note.excerpt | default: "Practical summary with key intuition and implementation notes." | strip_html | truncate: 125 }}</p>
        <div class="card-tags">
          <span class="tag">{{ category_label }}</span>
          <span class="tag">AI</span>
        </div>
        <a class="card-link" href="{{ note.url | relative_url }}">Read summary</a>
      </article>
    {% endfor %}
  </div>
</section>

<section id="blog" class="section-block" data-reveal>
  <header class="section-head">
    <p class="section-eyebrow">Blog</p>
    <h2>Technical notes for long-term recall</h2>
    <p class="section-description">Clear explanations written for future-me and helpful for anyone learning with implementation context.</p>
  </header>
  <div class="blog-grid">
    {% for note in sorted_notes limit:3 offset:1 %}
      <article class="premium-card" data-reveal>
        <p class="card-meta">Technical post{% if note.date %} · {{ note.date | date: "%d %b %Y" }}{% endif %}</p>
        <h3 class="card-title">{{ note.title }}</h3>
        <p class="card-summary">{{ note.excerpt | default: "Short practical write-up with definitions, tradeoffs, and implementation reminders." | strip_html | truncate: 138 }}</p>
        <a class="card-link" href="{{ note.url | relative_url }}">Read more</a>
      </article>
    {% endfor %}
  </div>
</section>

<section id="experience" class="section-block" data-reveal>
  <header class="section-head">
    <p class="section-eyebrow">Experience / Skills</p>
    <h2>Research-grade thinking, product-grade delivery</h2>
    <p class="section-description">I optimize for clear methodology, fast iteration, and production reliability.</p>
  </header>
  <div class="experience-layout">
    <article class="premium-card" data-reveal>
      <h3 class="card-title">Experience</h3>
      <ul class="experience-list">
        <li><strong>Renault</strong><span>AI Engineer Apprentice · Current</span></li>
        <li><strong>ensIIE / Paris-Saclay</strong><span>Data Science &amp; AI Engineering</span></li>
        <li><strong>Research mindset</strong><span>Reproducibility, evaluation, ablation discipline</span></li>
      </ul>
    </article>
    <article class="premium-card" data-reveal>
      <h3 class="card-title">Skills</h3>
      <p class="card-summary">Core stack used in projects, paper replications, and applied system design.</p>
      <div class="skills-cloud">
        <span class="tag">Python</span>
        <span class="tag">PyTorch</span>
        <span class="tag">NLP / LLM</span>
        <span class="tag">Computer Vision</span>
        <span class="tag">Speech AI</span>
        <span class="tag">Experiment Tracking</span>
        <span class="tag">Model Evaluation</span>
        <span class="tag">MLOps Basics</span>
      </div>
    </article>
  </div>
</section>

<section id="contact" class="section-block" data-reveal>
  <article class="premium-card contact-panel" data-reveal>
    <p class="section-eyebrow">Contact</p>
    <h2>Open to ML/AI engineering opportunities</h2>
    <p class="section-description">If your team values clarity, reproducible experimentation, and product impact, I would love to connect.</p>
    <div class="contact-links">
      <a href="{{ '/contact/' | relative_url }}">Contact page</a>
      <a href="mailto:richard.cheam@etu.u-paris.fr">Email</a>
      <a href="https://github.com/richardcheam" target="_blank" rel="noopener noreferrer">GitHub</a>
      <a href="https://www.linkedin.com/in/richard-cheam" target="_blank" rel="noopener noreferrer">LinkedIn</a>
    </div>
  </article>
</section>
