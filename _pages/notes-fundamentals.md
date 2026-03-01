---
layout: default
title: "Fundamentals"
permalink: /notes/fundamentals/
---

{% assign sorted_notes = site.notes | sort: 'date' | reverse %}

<p><a class="notes-backlink" href="{{ '/notes/' | relative_url }}">Back to Notes</a></p>
<p class="minimal-intro notes-intro">Core concepts.</p>

<section class="concept-list" aria-label="Fundamentals concept blocks">
  {% assign has_fundamentals = false %}
  {% for note in sorted_notes %}
    {% assign note_key = note.category | default: "" | slugify %}
    {% if note_key == "fundamentals" %}
      {% assign has_fundamentals = true %}
      <a class="concept-card" href="{{ note.url | relative_url }}">
        <p class="concept-card__meta">Concept{% if note.date %} · {{ note.date | date: "%d %b %Y" }}{% endif %}</p>
        <h2>{{ note.title }}</h2>
        {% if note.excerpt %}
          <p>{{ note.excerpt | strip_html | truncate: 180 }}</p>
        {% endif %}
      </a>
    {% endif %}
  {% endfor %}

  {% unless has_fundamentals %}
    <div class="concept-card concept-card--empty">
      <p class="concept-card__meta">Empty</p>
      <h2>No fundamentals notes yet</h2>
      <p>Add a markdown file in <code>_notes/</code> with <code>category: "fundamentals"</code>.</p>
    </div>
  {% endunless %}
</section>
