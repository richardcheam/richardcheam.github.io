---
layout: default
title: "Blog"
permalink: /blog/
---

{% assign published_posts = site.blog | where_exp: "post", "post.published != false" | sort: "series_order" %}
{% assign featured_series = site.data.blog_series | first %}
{% assign series_posts = published_posts | where: "series", featured_series.key %}

<p class="blog-archive-intro">Articles from my work deploying, debugging, and measuring large language model inference.</p>

<section class="blog-index" aria-labelledby="blog-index-title">
  <header class="blog-archive-head">
    <h2 id="blog-index-title">All posts <span>· {{ published_posts.size }}</span></h2>
    {% if series_posts.size > 0 %}
      <div class="blog-series-summary">
        <p class="blog-series-summary__label">Series</p>
        <p class="blog-series-summary__title">{{ featured_series.title }}</p>
        <p class="blog-series-summary__count">{{ series_posts.size }} posts in this series</p>
      </div>
    {% endif %}
  </header>

  <nav class="blog-filters" id="blog-filters" aria-label="Filters">
    <span class="blog-filters__label">Filters</span>
    <a href="{{ '/blog/' | relative_url }}#blog-filters" data-facet-link data-facet="category" data-facet-value="">All posts ({{ published_posts.size }})</a>
    {% for cat in site.data.blog_categories %}
      {% assign category_posts = published_posts | where: "category", cat.key %}
      {% if category_posts.size > 0 %}
        <a href="{{ '/blog/' | relative_url }}?category={{ cat.key | uri_escape }}#blog-filters" data-facet-link data-facet="category" data-facet-value="{{ cat.key }}">{{ cat.label }} ({{ category_posts.size }})</a>
      {% endif %}
    {% endfor %}
  </nav>

  <p class="blog-filter-count" data-filter-count data-filter-noun="posts" aria-live="polite">Showing {{ published_posts.size }} of {{ published_posts.size }} posts</p>

  {% if published_posts.size > 0 %}
    <ol class="blog-post-list" aria-label="All blog posts">
      {% for post in published_posts %}
        {% assign post_key = post.category | default: "post" | slugify %}
        {% assign category_label = "Blog Post" %}
        {% for cat in site.data.blog_categories %}
          {% if cat.key == post_key %}{% assign category_label = cat.label %}{% endif %}
        {% endfor %}
        {% assign post_series = published_posts | where: "series", post.series | sort: "series_order" %}
        {% for series_post in post_series %}
          {% if series_post.url == post.url %}{% assign post_position = forloop.index %}{% endif %}
        {% endfor %}

        <li class="blog-post-row" data-filter-card data-filter-facets="category:{{ post_key }}" data-filter-text="{{ post.title | downcase }} {{ category_label | downcase }} {{ post_key }} {{ post.excerpt | strip_html | downcase }}">
          <div class="blog-post-main">
            {% if post.series %}<p class="blog-reading-order">Post {{ post_position }} of {{ post_series.size }}</p>{% endif %}
            <div class="blog-post-titleline">
              <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
              {% if post.featured %}<span class="blog-featured-label">Featured</span>{% endif %}
            </div>
            <p class="blog-post-description">{{ post.excerpt }}</p>
          </div>
          <p class="blog-post-meta"><time datetime="{{ post.date | date: '%Y-%m-%d' }}">{{ post.date | date: '%d %b %Y' }}</time><span>{{ post.read_time | default: '7 min' }} read</span><span class="blog-post-topic">{{ category_label }}</span></p>
        </li>
      {% endfor %}
    </ol>
    <p class="filter-empty" data-filter-empty hidden>No posts match this filter.</p>
  {% else %}
    <p>No blog posts yet.</p>
  {% endif %}
</section>
