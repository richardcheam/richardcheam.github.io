---
layout: default
title: "Notes"
permalink: /notes/
---

<p class="minimal-intro">My knowledge base for ideas I want to remember and reuse. Public notes, concise and practical.</p>

<div class="minimal-grid notes-grid">
  {% assign sorted_notes = site.notes | sort: 'date' | reverse %}
  {% for note in sorted_notes %}
    <a class="minimal-card note-card" href="{{ note.url | relative_url }}">
      <p class="minimal-card__meta">{{ note.category | default: "Note" }}{% if note.date %} • {{ note.date | date: "%b %Y" }}{% endif %}</p>
      <h3>{{ note.title }}</h3>
      {% if note.excerpt %}
        <p>{{ note.excerpt | strip_html | truncate: 140 }}</p>
      {% endif %}
    </a>
  {% endfor %}
</div>
