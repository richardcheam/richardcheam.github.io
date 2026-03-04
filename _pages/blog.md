---
layout: default
title: "Blog"
permalink: /blog/
---

{% assign sorted_notes = site.notes | sort: 'date' | reverse %}

<section class="page-intro" data-reveal>
  <p class="section-eyebrow">Blog</p>
  <h2>Technical explainers for future recall</h2>
  <p class="section-description">
    Practical write-ups on ML foundations and implementation decisions, written to stay useful months later.
  </p>
</section>

<section class="blog-list" aria-label="Blog entries">
  {% for note in sorted_notes %}
    {% assign note_key = note.category | default: "note" | slugify %}
    {% assign category_label = "Note" %}
    {% for cat in site.data.notes_categories %}
      {% if cat.key == note_key %}
        {% assign category_label = cat.label %}
      {% endif %}
    {% endfor %}

    <a class="blog-card" data-reveal href="{{ note.url | relative_url }}">
      <p class="card-meta">{{ category_label }}{% if note.date %} · {{ note.date | date: "%d %b %Y" }}{% endif %}</p>
      <h3 class="card-title">{{ note.title }}</h3>
      <p class="card-summary">{{ note.excerpt | strip_html | truncate: 180 }}</p>
      <span class="inline-link">Read more</span>
    </a>
  {% endfor %}
</section>
