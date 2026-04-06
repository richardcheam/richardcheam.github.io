---
layout: default
title: "Blog"
permalink: /blog/
---

{% assign sorted_posts = site.blog | sort: "date" | reverse %}

<section class="page-intro" data-reveal>
  <p class="section-eyebrow">Blog</p>
  <h2>Technical blog posts, explainers, and implementation reminders</h2>
  <p class="section-description">
    This is the technical writing side of the site: concise blog posts for revisiting concepts, systems, and ML ideas.
  </p>
</section>

<section class="section-block" data-reveal>
  <header class="section-head">
    <p class="section-eyebrow">Categories</p>
    <h2>Topic map</h2>
    <p class="section-description">Blog posts are grouped by topic for quick review.</p>
  </header>
  <div class="cards-grid">
    {% for cat in site.data.blog_categories %}
      {% assign cat_count = 0 %}
      {% for post in sorted_posts %}
        {% assign post_key = post.category | default: "" | slugify %}
        {% if post_key == cat.key %}
          {% assign cat_count = cat_count | plus: 1 %}
        {% endif %}
      {% endfor %}

      {% if cat_count > 0 %}
        <a class="premium-card category-card" data-reveal href="{{ '/blog/' | relative_url }}?category={{ cat.key | uri_escape }}#blog-search-input" aria-label="{{ cat.label }}">
          <p class="card-meta">{{ cat.label }} · {{ cat_count }}</p>
          <h3 class="card-title">{{ cat.summary }}</h3>
          <span class="card-link">Open</span>
        </a>
      {% endif %}
    {% endfor %}
  </div>
</section>

<section class="section-block" data-reveal>
  <header class="section-head">
    <p class="section-eyebrow">Library</p>
    <h2>Browse blog posts</h2>
    <p class="section-description">Search by topic, category, or keyword.</p>
  </header>

  {% if sorted_posts.size > 0 %}
    <div class="filter-wrap" data-reveal>
      <input class="filter-input" id="blog-search-input" data-filter-input type="search" placeholder="Search blog posts (e.g. speech, world model, optimization)">
      <p class="filter-empty" data-filter-empty hidden>No blog posts match that keyword.</p>
    </div>

    <section class="blog-list" aria-label="Blog entries">
      {% for post in sorted_posts %}
        {% assign post_key = post.category | default: "post" | slugify %}
        {% assign category_label = "Blog Post" %}
        {% for cat in site.data.blog_categories %}
          {% if cat.key == post_key %}
            {% assign category_label = cat.label %}
          {% endif %}
        {% endfor %}

        <a class="blog-card" data-reveal data-filter-card data-filter-text="{{ post.title | downcase }} {{ category_label | downcase }} {{ post_key }} {{ post_key | replace: '-', ' ' }} {{ post.excerpt | strip_html | downcase }}" href="{{ post.url | relative_url }}">
          <p class="card-meta">{{ category_label }}{% if post.date %} · {{ post.date | date: "%d %b %Y" }}{% endif %}</p>
          <h3 class="card-title">{{ post.title }}</h3>
          <p class="card-summary">{{ post.excerpt | strip_html | truncate: 180 }}</p>
          <span class="inline-link">Read more</span>
        </a>
      {% endfor %}
    </section>
  {% else %}
    <article class="premium-card" data-reveal>
      <h3 class="card-title">No blog posts yet</h3>
      <p class="card-summary">Add a markdown file in <code>_blog/</code> to publish a new post.</p>
    </article>
  {% endif %}
</section>
