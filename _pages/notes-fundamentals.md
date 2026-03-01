---
layout: default
title: "Fundamentals"
permalink: /notes/fundamentals/
---

{% assign sorted_notes = site.notes | sort: "date" | reverse %}
{% assign fundamentals = sorted_notes | where_exp: "note", "note.category | default: \"\" | slugify == \"fundamentals\"" %}

<section class="home-section" aria-label="Fundamentals overview">
  <div class="home-section__header">
    <p class="home-section__eyebrow">Fundamentals</p>
    <h2>Minimal concept blocks</h2>
    <p class="home-section__description">
      Every concept is a self-contained moment: problem, intuition, and practical reminders so I can skim quickly
      while retaining the idea.
    </p>
  </div>
  <p><a class="notes-backlink" href="{{ '/notes/' | relative_url }}">Back to Notes</a></p>
</section>

<section class="concept-list" aria-label="Fundamentals concept blocks">
  {% if fundamentals.size > 0 %}
    {% for note in fundamentals %}
      <a class="concept-card" href="{{ note.url | relative_url }}">
        <p class="concept-card__meta">Concept{% if note.date %} · {{ note.date | date: "%d %b %Y" }}{% endif %}</p>
        <h2>{{ note.title }}</h2>
        {% if note.excerpt %}
          <p>{{ note.excerpt | strip_html | truncate: 180 }}</p>
        {% endif %}
      </a>
    {% endfor %}
  {% else %}
    <div class="concept-card concept-card--empty">
      <p class="concept-card__meta">Empty</p>
      <h2>No fundamentals notes yet</h2>
      <p>Add a markdown file in <code>_notes/</code> with <code>category: "fundamentals"</code>.</p>
    </div>
  {% endif %}
</section>
