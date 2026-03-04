---
layout: default
title: "Notes"
permalink: /notes/
---

{% assign sorted_notes = site.notes | sort: "date" | reverse %}

<section class="home-section notes-page-intro">
  <div class="home-section__header">
    <p class="home-section__eyebrow">Notes</p>
    <h2>Minimal dailies for maximal recall</h2>
    <p class="home-section__description">
      The hub is intentionally quiet—just a statement about the collection plus the category map you requested.
      You can start with the fundamentals path and dive into any pillar from there.
    </p>
  </div>
  <div class="notes-search">
    <label class="notes-search__label" for="notes-search-input">Find a category or keyword</label>
    <input id="notes-search-input" type="search" placeholder="Search (not live yet)" />
    <p class="notes-search__hint">Filtering is in mind for the next iteration—this layout keeps the focus on categories.</p>
  </div>
</section>

<section class="home-section" aria-label="Notes categories">
  <div class="home-section__header">
    <p class="home-section__eyebrow">Categories</p>
    <h2>Structured playground</h2>
    <p class="home-section__description">
      Tap any thread and the site routes to concept-heavy pages (like fundamentals) where blocks are easy to read.
    </p>
  </div>
  <div class="notes-category-grid">
    {% for cat in site.data.notes_categories %}
      {% assign cat_count = 0 %}
      {% for note in sorted_notes %}
        {% assign note_key = note.category | default: "" | slugify %}
        {% if note_key == cat.key %}
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
      <a class="notes-category-card" data-has-notes="{{ has_notes }}" data-label="{{ cat.label | escape }}" data-summary="{{ cat.summary | escape }}" data-count="{{ cat_count }}" href="{{ category_href }}">
        <p class="notes-category-card__eyebrow">{{ cat.label }}{% if has_notes %} · {{ cat_count }}{% endif %}</p>
        <p class="notes-category-card__summary">{{ cat.summary }}</p>
        {% if has_notes %}
          <p class="notes-category-card__count">Open {{ cat_count }} logged thought{% if cat_count != 1 %}s{% endif %}</p>
        {% else %}
          <p class="notes-category-card__count">Future note rack</p>
        {% endif %}
      </a>
    {% endfor %}
  </div>
  <p class="notes-search-empty" hidden>No categories match that term. Try another keyword.</p>
</section>

<section class="home-section notes-fundamentals" aria-label="Fundamentals primer">
  <div class="home-section__header">
    <p class="home-section__eyebrow">Fundamentals</p>
    <h2>The primer I open first</h2>
    <p class="home-section__description">
      This section focuses solely on the foundations I revisit constantly. Each block points to the full concept note.
    </p>
  </div>
  {% assign fundamentals_count = 0 %}
  {% for note in sorted_notes %}
    {% assign note_key = note.category | default: "" | slugify %}
    {% if note_key == "fundamentals" %}
      {% assign fundamentals_count = fundamentals_count | plus: 1 %}
    {% endif %}
  {% endfor %}
  <div class="fundamentals-summary">
    {% if fundamentals_count == 0 %}
      <p>No fundamentals yet. Add a markdown file under <code>_notes/</code> with <code>category: \"fundamentals\"</code>.</p>
    {% else %}
      <div class="fundamentals-summary__grid">
        {% assign fundamentals_rendered = 0 %}
        {% for note in sorted_notes %}
          {% assign note_key = note.category | default: "" | slugify %}
          {% if note_key == "fundamentals" %}
            {% if fundamentals_rendered < 3 %}
              <article class="fundamentals-summary__card">
                <h3>{{ note.title }}</h3>
                {% if note.excerpt %}
                  <p>{{ note.excerpt | strip_html | truncate: 120 }}</p>
                {% endif %}
                <a class="home-blog-card__cta" href="{{ note.url | relative_url }}">Read the block</a>
              </article>
              {% assign fundamentals_rendered = fundamentals_rendered | plus: 1 %}
            {% endif %}
          {% endif %}
        {% endfor %}
      </div>
    {% endif %}
    <a class="btn btn--primary" href="{{ '/notes/fundamentals/' | relative_url }}">Enter fundamentals</a>
  </div>
</section>
