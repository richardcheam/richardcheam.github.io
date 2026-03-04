---
layout: default
title: "Technical Notes"
permalink: /notes/
---

{% assign sorted_notes = site.notes | sort: "date" | reverse %}

<section class="page-intro" data-reveal>
  <p class="section-eyebrow">Technical Notes</p>
  <h2>AI paper summaries and memory-friendly reviews</h2>
  <p class="section-description">
    This is my structured learning space: concise notes, core takeaways, and tags for fast retrieval.
  </p>
</section>

<section class="section-block" data-reveal>
  <header class="section-head">
    <p class="section-eyebrow">Categories</p>
    <h2>Topic map</h2>
    <p class="section-description">Fundamentals is the curated starting point. Other categories expand as new notes are added.</p>
  </header>
  <div class="cards-grid">
    {% for cat in site.data.notes_categories %}
      {% assign cat_count = 0 %}
      {% for note in sorted_notes %}
        {% assign note_key = note.category | default: "" | slugify %}
        {% if note_key == cat.key %}
          {% assign cat_count = cat_count | plus: 1 %}
        {% endif %}
      {% endfor %}

      {% if cat.key == "fundamentals" %}
        {% assign category_href = '/notes/fundamentals/' | relative_url %}
      {% else %}
        {% assign category_href = '/notes/' | relative_url %}
      {% endif %}

      <a class="premium-card category-card" data-reveal href="{{ category_href }}" aria-label="{{ cat.label }}">
        <p class="card-meta">{{ cat.label }}{% if cat_count > 0 %} · {{ cat_count }}{% endif %}</p>
        <h3 class="card-title">{{ cat.summary }}</h3>
        <span class="card-link">Open</span>
      </a>
    {% endfor %}
  </div>
</section>

<section class="section-block" data-reveal>
  <header class="section-head">
    <p class="section-eyebrow">Library</p>
    <h2>Browse notes</h2>
    <p class="section-description">Search by topic, category, or keyword.</p>
  </header>

  <div class="filter-wrap" data-reveal>
    <input class="filter-input" id="notes-search-input" data-filter-input type="search" placeholder="Search notes (e.g. speech, transformer, optimization)">
    <p class="filter-empty" data-filter-empty hidden>No notes match that keyword.</p>
  </div>

  <div class="notes-list">
    {% for note in sorted_notes %}
      {% assign note_key = note.category | default: "note" | slugify %}
      {% assign category_label = "Note" %}
      {% for cat in site.data.notes_categories %}
        {% if cat.key == note_key %}
          {% assign category_label = cat.label %}
        {% endif %}
      {% endfor %}

      <a class="notes-card" data-reveal data-filter-card data-filter-text="{{ note.title | downcase }} {{ category_label | downcase }} {{ note.excerpt | strip_html | downcase }}" href="{{ note.url | relative_url }}">
        <p class="card-meta">{{ category_label }}{% if note.date %} · {{ note.date | date: "%d %b %Y" }}{% endif %}</p>
        <h3 class="card-title">{{ note.title }}</h3>
        <p class="card-summary">{{ note.excerpt | default: "Short summary and implementation reminders." | strip_html | truncate: 150 }}</p>
        <div class="card-tags">
          <span class="tag">{{ category_label }}</span>
          <span class="tag">AI</span>
        </div>
      </a>
    {% endfor %}
  </div>
</section>
