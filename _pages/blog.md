---
layout: default
title: "Blog"
permalink: /blog/
---

{% assign sorted_posts = site.blog | sort: "series_order" %}

<section class="page-intro" data-reveal>
  <p class="section-eyebrow">My engineering work · Seven field notes</p>
  <h2>Inference Engineering: Lessons from Dual GH200</h2>
  <p class="section-description">
    I deployed, adapted, debugged, and benchmarked large-model serving on a dual-GH200 system. These posts explain the problems I investigated, the results I measured, and where the evidence stops.
  </p>
  <p class="section-description">
    New to the series? Start with <a href="{{ '/blog/grace-hopper-file-cache/' | relative_url }}">1. Linux file cache and GPU memory</a>, <a href="{{ '/blog/benchmark-denominators/' | relative_url }}">2. misleading benchmark numbers</a>, and <a href="{{ '/blog/throughput-versus-usable-latency/' | relative_url }}">6. throughput and waiting time</a>. Then explore the deeper implementation notes in order below.
  </p>
</section>

<section class="section-block" data-reveal>
  <header class="section-head">
    <p class="section-eyebrow">The GH200 series</p>
    <h2>Read the field notes</h2>
    <p class="section-description">Each note starts with a question from the work and the result that changed my understanding.</p>
  </header>

  {% if sorted_posts.size > 0 %}
    <div class="filter-wrap" data-reveal>
      <input class="filter-input" id="blog-search-input" data-filter-input type="search" placeholder="Find a field note (e.g. memory, startup, latency)" aria-label="Search field notes">
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

        <a class="blog-card" data-reveal data-filter-card data-filter-text="{{ post.title | downcase }} {{ category_label | downcase }} {{ post_key }} {{ post_key | replace: '-', ' ' }} {{ post.excerpt | strip_html | downcase }} {{ post.question | downcase }} {{ post.result | downcase }}" href="{{ post.url | relative_url }}">
          <p class="card-meta">{% if post.series_order %}Field note {{ post.series_order }} · {% endif %}{{ category_label }}{% if post.date %} · {{ post.date | date: "%d %b %Y" }}{% endif %}</p>
          <h3 class="card-title">{{ post.title }}</h3>
          <p class="card-summary"><strong>Question:</strong> {{ post.question }}</p>
          <p class="card-summary"><strong>Result:</strong> {{ post.result }}</p>
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

<section class="section-block" data-reveal>
  <header class="section-head">
    <p class="section-eyebrow">Browse by topic</p>
    <h2>Topics in this series</h2>
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
