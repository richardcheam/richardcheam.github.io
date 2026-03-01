---
layout: default
title: "Notes"
permalink: /notes/
---

{% assign sorted_notes = site.notes | sort: 'date' | reverse %}
<section class="notes-hub">
  <p class="minimal-kicker">Knowledge Base</p>
  <p class="minimal-intro notes-intro">A personal library of AI concepts, paper notes, and practical reminders for myself. Of course everyone is welcomed to read and share.</p>
  <a class="notes-route" href="{{ '/notes/fundamentals/' | relative_url }}">
    <p class="notes-route__meta">Start here</p>
    <h2>Fundamentals</h2>
    {% assign fundamentals_count = 0 %}
    {% for note in sorted_notes %}
      {% assign note_key = note.category | default: "" | slugify %}
      {% if note_key == "fundamentals" %}
        {% assign fundamentals_count = fundamentals_count | plus: 1 %}
      {% endif %}
    {% endfor %}
    <p>{{ fundamentals_count }} concept block{% if fundamentals_count != 1 %}s{% endif %}</p>
  </a>
</section>

<section class="notes-categories-overview" aria-label="Notes categories">
  <p class="minimal-kicker">Categories</p>
  <div class="notes-category-list">
    {% for cat in site.data.notes_categories %}
      {% assign cat_count = 0 %}
      {% for note in sorted_notes %}
        {% assign note_key = note.category | default: "" | slugify %}
        {% if note_key == cat.key %}
          {% assign cat_count = cat_count | plus: 1 %}
        {% endif %}
      {% endfor %}
      {% if cat.key == "fundamentals" %}
        <a class="notes-category-pill is-active" href="{{ '/notes/fundamentals/' | relative_url }}">
          {{ cat.label }}{% if cat_count > 0 %} · {{ cat_count }}{% endif %}
        </a>
      {% else %}
        <span class="notes-category-pill">
          {{ cat.label }}{% if cat_count > 0 %} · {{ cat_count }}{% endif %}
        </span>
      {% endif %}
    {% endfor %}
  </div>
</section>
