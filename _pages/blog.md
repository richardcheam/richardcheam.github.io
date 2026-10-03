---
layout: default
title: "Blog"
permalink: /blog/
---

{% assign sorted_posts = site.blog | sort: "series_order" %}

<section class="blog-intro">
  <p class="section-eyebrow">A seven-part engineering series</p>
  <h2>Inference Engineering: Lessons from Dual GH200</h2>
  <p>I deployed, adapted, debugged, and measured large-model serving on a dual-GH200 system. Each essay follows an engineering question through the evidence that answered it—and the part that remains open.</p>
  <p class="blog-start">Start with <a href="{{ '/blog/grace-hopper-file-cache/' | relative_url }}">01 · Memory</a> and <a href="{{ '/blog/benchmark-denominators/' | relative_url }}">02 · Measurement</a>. For the strongest experimental story, read <a href="{{ '/blog/throughput-versus-usable-latency/' | relative_url }}">06 · Throughput and waiting</a>.</p>
</section>

<section class="blog-feature" aria-labelledby="blog-feature-title">
  <p class="section-eyebrow">Featured investigation · Field note 06</p>
  <h2 id="blog-feature-title"><a href="{{ '/blog/throughput-versus-usable-latency/' | relative_url }}">High throughput, minutes of waiting</a></h2>
  <p>An eight-hour long-context soak kept producing output while first-token waits stretched into minutes. What does capacity mean when a caller cannot use it interactively?</p>
  <a class="inline-link" href="{{ '/blog/throughput-versus-usable-latency/' | relative_url }}">Read the investigation</a>
</section>

<section class="section-block blog-index" aria-labelledby="blog-index-title">
  <header class="section-head">
    <p class="section-eyebrow">The complete series</p>
    <h2 id="blog-index-title">Seven field notes</h2>
  </header>

  {% if sorted_posts.size > 0 %}
    <div class="filter-wrap">
      <input class="filter-input" id="blog-search-input" data-filter-input type="search" placeholder="Find a field note (e.g. memory, startup, latency)" aria-label="Search field notes">
      <p class="filter-empty" data-filter-empty hidden>No blog posts match that keyword.</p>
    </div>

    <ol class="blog-series-list" aria-label="Blog entries">
      {% for post in sorted_posts %}
        {% assign post_key = post.category | default: "post" | slugify %}
        {% assign category_label = "Blog Post" %}
        {% for cat in site.data.blog_categories %}
          {% if cat.key == post_key %}
            {% assign category_label = cat.label %}
          {% endif %}
        {% endfor %}

        <li class="blog-series-entry" data-filter-card data-filter-text="{{ post.title | downcase }} {{ category_label | downcase }} {{ post_key }} {{ post_key | replace: '-', ' ' }} {{ post.excerpt | strip_html | downcase }} {{ post.question | downcase }} {{ post.result | downcase }}">
          <span class="blog-series-number" aria-hidden="true">{{ post.series_order | prepend: '0' }}</span>
          <div>
            <p class="blog-series-meta">{{ category_label }} · {{ post.read_time | default: '7 min' }} read</p>
            <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
            <p>{{ post.excerpt }}</p>
          </div>
        </li>
      {% endfor %}
    </ol>
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
  <div class="blog-topics">
    {% for cat in site.data.blog_categories %}
      {% assign cat_count = 0 %}
      {% for post in sorted_posts %}
        {% assign post_key = post.category | default: "" | slugify %}
        {% if post_key == cat.key %}
          {% assign cat_count = cat_count | plus: 1 %}
        {% endif %}
      {% endfor %}

      {% if cat_count > 0 %}
        <a class="blog-topic-link" href="{{ '/blog/' | relative_url }}?category={{ cat.key | uri_escape }}#blog-search-input">{{ cat.label }} <span>{{ cat_count }}</span></a>
      {% endif %}
    {% endfor %}
  </div>
</section>
