---
layout: default
title: "Fundamentals"
permalink: /notes/fundamentals/
---

{% assign sorted_notes = site.notes | sort: "date" | reverse %}

<section class="page-intro" data-reveal>
  <p><a class="notes-backlink" href="{{ '/notes/' | relative_url }}">Back to Notes</a></p>
  <p class="section-eyebrow">Fundamentals</p>
  <h2>Core concepts first</h2>
  <p class="section-description">
    Minimal concept cards built for quick recall before diving into deeper implementation details.
  </p>
</section>

<section class="concept-list" aria-label="Fundamentals concept blocks">
  {% assign fundamentals_count = 0 %}
  {% for note in sorted_notes %}
    {% assign note_key = note.category | default: "" | slugify %}
    {% if note_key == "fundamentals" %}
      {% assign fundamentals_count = fundamentals_count | plus: 1 %}
      <a class="concept-card" data-reveal href="{{ note.url | relative_url }}">
        <p class="concept-card__meta">Concept{% if note.date %} · {{ note.date | date: "%d %b %Y" }}{% endif %}</p>
        <h3 class="card-title">{{ note.title }}</h3>
        <p class="card-summary">{{ note.excerpt | strip_html | truncate: 170 }}</p>
      </a>
    {% endif %}
  {% endfor %}

  {% if fundamentals_count == 0 %}
    <article class="concept-card concept-card--empty" data-reveal>
      <p class="concept-card__meta">Empty</p>
      <h3 class="card-title">No fundamentals notes yet</h3>
      <p class="card-summary">Create a markdown file in <code>_notes/</code> with <code>category: "fundamentals"</code>.</p>
    </article>
  {% endif %}
</section>
