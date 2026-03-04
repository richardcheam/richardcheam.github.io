---
layout: default
permalink: /
title: "Richard Cheam"
---

{% assign sorted_notes = site.notes | sort: "date" | reverse %}

<div class="home-hero">
  <p class="home-hero__tag">AI Engineer Apprentice · Paris</p>
  <h1 class="home-hero__title">Richard Cheam</h1>
  <p class="home-hero__subtitle">
    Building cinematic, trustworthy AI experiences at Renault. I obsess over speech, world modeling, and
    making high-impact research feel instantly readable for teams shipping real products.
  </p>
  <div class="home-hero__cta">
    <a class="btn btn--ghost" href="/notes/">Notes</a>
    <a class="btn btn--ghost" href="/projects/">Projects</a>
    <a class="btn btn--primary" href="/contact/">Contact</a>
  </div>
</div>

<section class="home-section home-section--blog" aria-label="Latest writing">
  <div class="home-section__header">
    <p class="home-section__eyebrow">Writing</p>
    <h2>Short-form lab notes</h2>
    <p class="home-section__description">
      What I read, build, and want to remember. Each log is trimmed to the insight so you can scan it fast.
      Hover to preview and click to dive deeper.
    </p>
  </div>
  <div class="home-blog-grid">
    {% for note in sorted_notes limit:3 %}
      {% assign note_key = note.category | default: "note" | slugify %}
      {% assign note_label = "Note" %}
      {% for cat in site.data.notes_categories %}
        {% if cat.key == note_key %}
          {% assign note_label = cat.label %}
        {% endif %}
      {% endfor %}
      <article class="home-blog-card">
        <p class="home-blog-card__meta">{{ note_label }}{% if note.date %} • {{ note.date | date: "%d %b %Y" }}{% endif %}</p>
        <h3>{{ note.title }}</h3>
        {% if note.excerpt %}
          <p class="home-blog-card__excerpt">{{ note.excerpt | strip_html | truncate: 130 }}</p>
        {% endif %}
        <a class="home-blog-card__cta" href="{{ note.url | relative_url }}">Open note</a>
      </article>
    {% endfor %}
  </div>
</section>

<section class="home-section home-section--knowledge" aria-label="Knowledge overview">
  <div class="home-section__header">
    <p class="home-section__eyebrow">Knowledge base</p>
    <h2>Categories with living memory</h2>
    <p class="home-section__description">
      Each pillar links to curated concept stacks. Start at fundamentals or explore exact topics I revisit often.
      This space mirrors how I reason systematically about AI.
    </p>
  </div>
  <div class="notes-category-grid">
    {% for cat in site.data.notes_categories %}
      {% assign cat_count = 0 %}
      {% for note in sorted_notes %}
        {% if note.category | default: "" | slugify == cat.key %}
          {% assign cat_count = cat_count | plus: 1 %}
        {% endif %}
      {% endfor %}
      {% assign has_notes = false %}
      {% if cat_count > 0 %}
        {% assign has_notes = true %}
      {% endif %}
      {% if cat.key == "fundamentals" %}
        {% assign category_href = '/notes/fundamentals/' | relative_url %}
      {% else %}
        {% assign category_href = '/notes/' | relative_url %}
      {% endif %}
      <a class="notes-category-card" data-has-notes="{{ has_notes }}" href="{{ category_href }}">
        <p class="notes-category-card__eyebrow">{{ cat.label }}{% if has_notes %} · {{ cat_count }}{% endif %}</p>
        <p class="notes-category-card__summary">{{ cat.summary }}</p>
        {% if has_notes %}
          <p class="notes-category-card__count">Contains {{ cat_count }} logged thought{% if cat_count != 1 %}s{% endif %}</p>
        {% else %}
          <p class="notes-category-card__count">Coming soon</p>
        {% endif %}
      </a>
    {% endfor %}
  </div>
</section>

<section class="home-section home-section--projects" aria-label="Featured projects">
  <div class="home-section__header">
    <p class="home-section__eyebrow">Projects</p>
    <h2>Selected builds</h2>
    <p class="home-section__description">
      Cinematic prototypes with crisp instrumentation, ready for recruitment and teammates. Click any card for deep
      dives, TL;DR chips, and live artifacts.
    </p>
  </div>
  <div class="home-project-grid">
    <article class="home-project-card">
      <p class="home-project-card__kicker">NLP • March 2025</p>
      <h3>IMDb Sentiment with Mixture of Experts</h3>
      <p class="home-project-card__lead">
        Benchmarking transformers against a custom expert router to see how specialization shapes sentiment fairness.
      </p>
    <span class="home-project-card__badge" aria-hidden="true">LLM</span>
    <div class="home-project-card__stats">
      <span class="detail-chip detail-chip--impact"><span class="detail-chip__value">Reproducible benchmark</span></span>
      <span class="detail-chip detail-chip--stack"><span class="detail-chip__value">PyTorch • Hugging Face • MoE</span></span>
    </div>
    <a class="home-project-card__cta" href="{{ '/projects/imdb-moe/' | relative_url }}">Explore the project</a>
    </article>
    <article class="home-project-card">
      <p class="home-project-card__kicker">Computer Vision • December 2024</p>
      <h3>SSL &amp; Semi-supervised Learning on MNIST</h3>
      <p class="home-project-card__lead">
        Low-label training with pseudo-label refreshes and SimCLR probes to make fewer labels feel abundant.
      </p>
    <span class="home-project-card__badge" aria-hidden="true">SSL</span>
    <div class="home-project-card__stats">
      <span class="detail-chip detail-chip--impact"><span class="detail-chip__value">98.55% SimCLR probe</span></span>
      <span class="detail-chip detail-chip--constraint"><span class="detail-chip__value">100 labels</span></span>
    </div>
      <a class="home-project-card__cta" href="{{ '/projects/mnist-ssl/' | relative_url }}">See the build details</a>
    </article>
  </div>
</section>
