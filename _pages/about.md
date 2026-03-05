---
layout: default
permalink: /
title: "Richard Cheam"
---

{% assign sorted_notes = site.notes | sort: "date" | reverse %}

<section id="hero" class="hero section-block">
  <div class="hero__glow" aria-hidden="true"></div>
  <div class="hero-container">
    <p class="section-eyebrow" data-reveal>AI / Machine Learning Engineer</p>
    <h1 class="hero__name" data-reveal>Richard Cheam</h1>
    <!-- <p class="hero__tagline" data-reveal>Building practical AI systems with clean research-to-product execution.</p> -->
    <p class="hero__support" data-reveal>
      Engineer's and Master's degree in Data Science &amp; AI. Currently at Renault.
    </p>
    <div class="hero__actions" data-reveal>
      <a class="btn btn--primary" href="#projects">View Projects</a>
      <a class="btn btn--ghost hero-icon-btn" href="https://github.com/richardcheam" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
        <svg class="contact-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-1.9c-3.14.69-3.8-1.35-3.8-1.35a2.99 2.99 0 0 0-1.25-1.64c-1.02-.7.08-.69.08-.69a2.37 2.37 0 0 1 1.72 1.16 2.43 2.43 0 0 0 3.32.95 2.44 2.44 0 0 1 .73-1.53c-2.5-.28-5.12-1.25-5.12-5.56a4.36 4.36 0 0 1 1.16-3.03 4.06 4.06 0 0 1 .11-2.99s.94-.3 3.08 1.16a10.7 10.7 0 0 1 5.6 0c2.14-1.46 3.08-1.16 3.08-1.16.45.95.49 2.07.11 2.99a4.35 4.35 0 0 1 1.16 3.03c0 4.32-2.63 5.28-5.14 5.55a2.73 2.73 0 0 1 .77 2.12v3.14c0 .3.2.65.78.54A11.25 11.25 0 0 0 12 .75Z"/>
        </svg>
        <span class="sr-only">GitHub</span>
      </a>
      <a class="btn btn--ghost" href="#contact">Contact</a>
    </div>
  </div>
</section>

<section id="projects" class="section-block" data-reveal>
  <header class="section-head">
    <p class="section-eyebrow">Featured Projects</p>
    <h2>Project Card</h2>
    <p class="section-description">My personal and academic projects.</p>
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
    <p class="section-eyebrow">Technical Notes</p>
    <h2>Paper summaries and concept cards</h2>
    <p class="section-description">Review section for papers and concepts and I have read for myself to revisit.</p>
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
    <h2>Long-term recall</h2>
    <p class="section-description">Clear explanations written for future-me (since I tend to forget) and helpful for anyone learning.</p>
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

<!-- <section id="experience" class="section-block" data-reveal>
  <header class="section-head">
    <p class="section-eyebrow">Experience / Skills</p>
    <h2>Research-grade thinking, product-grade delivery</h2>
    <p class="section-description">More on About Me section.</p>
  </header>
  <div class="experience-layout">
    <article class="premium-card" data-reveal>
      <h3 class="card-title">Experience</h3>
      <ul class="experience-list">
        <li><strong>Renault</strong><span>AI Engineer Apprentice · Current</span></li>
        <li><strong>ensIIE, Paris-Saclay, Paris Cité</strong><span>Data Science &amp; AI Engineering</span></li>
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
        <span class="tag">MLOps</span>
      </div>
    </article>
  </div>
</section> -->

<section id="contact" class="section-block" data-reveal>
  <article class="premium-card contact-panel" data-reveal>
    <p class="section-eyebrow">Contact</p>
    <h2>Open to Data Scientist and ML/AI Engineer opportunities</h2>
    <p class="section-description">Feel free to contact me for collaborations, technical discussions, and more.</p>
    <div class="contact-links">
      <a class="contact-icon-link" href="mailto:richard.cheam@etu.u-paris.fr" aria-label="Email">
        <svg class="contact-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 6.75A1.75 1.75 0 0 1 4.75 5h14.5A1.75 1.75 0 0 1 21 6.75v10.5A1.75 1.75 0 0 1 19.25 19H4.75A1.75 1.75 0 0 1 3 17.25V6.75Zm1.4-.15L12 11.62l7.6-5.02a.5.5 0 0 0-.35-.1H4.75a.5.5 0 0 0-.35.1Zm15.1 1.43-7.08 4.68a.75.75 0 0 1-.84 0L4.5 8.03v9.22c0 .14.11.25.25.25h14.5a.25.25 0 0 0 .25-.25V8.03Z"/>
        </svg>
        <span class="sr-only">Email</span>
      </a>
      <a class="contact-icon-link" href="https://github.com/richardcheam" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
        <svg class="contact-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-1.9c-3.14.69-3.8-1.35-3.8-1.35a2.99 2.99 0 0 0-1.25-1.64c-1.02-.7.08-.69.08-.69a2.37 2.37 0 0 1 1.72 1.16 2.43 2.43 0 0 0 3.32.95 2.44 2.44 0 0 1 .73-1.53c-2.5-.28-5.12-1.25-5.12-5.56a4.36 4.36 0 0 1 1.16-3.03 4.06 4.06 0 0 1 .11-2.99s.94-.3 3.08 1.16a10.7 10.7 0 0 1 5.6 0c2.14-1.46 3.08-1.16 3.08-1.16.45.95.49 2.07.11 2.99a4.35 4.35 0 0 1 1.16 3.03c0 4.32-2.63 5.28-5.14 5.55a2.73 2.73 0 0 1 .77 2.12v3.14c0 .3.2.65.78.54A11.25 11.25 0 0 0 12 .75Z"/>
        </svg>
        <span class="sr-only">GitHub</span>
      </a>
      <a class="contact-icon-link" href="https://www.linkedin.com/in/richard-cheam" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
        <svg class="contact-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5.27 3.75a1.52 1.52 0 1 0 0 3.04 1.52 1.52 0 0 0 0-3.04ZM3.96 8.4h2.63V20.2H3.96V8.4Zm6.01 0h2.52v1.6h.04c.35-.67 1.2-1.37 2.47-1.37 2.64 0 3.13 1.74 3.13 4v7.56h-2.63v-6.7c0-1.6-.03-3.66-2.23-3.66-2.23 0-2.57 1.74-2.57 3.54v6.82H9.97V8.4Z"/>
        </svg>
        <span class="sr-only">LinkedIn</span>
      </a>
    </div>
  </article>
</section>
