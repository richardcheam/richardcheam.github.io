---
layout: default
title: "Blog"
permalink: /blog/
---

{% assign sorted_notes = site.notes | sort: 'date' | reverse %}

<p class="minimal-intro">Short writing and personal learning logs across AI topics.</p>

<section class="blog-feed" aria-label="Blog entries">
  {% for note in sorted_notes %}
    {% assign note_key = note.category | default: "" | slugify %}
    {% assign category_label = note.category | default: "Note" %}
    {% for cat in site.data.notes_categories %}
      {% if cat.key == note_key %}
        {% assign category_label = cat.label %}
      {% endif %}
    {% endfor %}
    <a class="blog-entry" href="{{ note.url | relative_url }}">
      <p class="blog-entry__meta">{{ category_label }}{% if note.date %} • {{ note.date | date: "%d %b %Y" }}{% endif %}</p>
      <h2>{{ note.title }}</h2>
      {% if note.excerpt %}
        <p>{{ note.excerpt | strip_html | truncate: 190 }}</p>
      {% endif %}
    </a>
  {% endfor %}
</section>
