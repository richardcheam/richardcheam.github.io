---
layout: default
title: "Paper Reviews"
permalink: /paper-reviews/
---

{% assign sorted_reviews = site.paper_reviews | sort: "date" | reverse %}

<section class="page-intro" data-reveal>
  <p class="section-eyebrow">Paper Reviews</p>
  <h2>Research takeaways worth keeping</h2>
  <p class="section-description">
    A separate place for article summaries, reading templates, and reusable research ideas that are worth revisiting.
  </p>
</section>

<section class="section-block" data-reveal>
  <header class="section-head">
    <p class="section-eyebrow">Library</p>
    <h2>Browse paper reviews</h2>
    <p class="section-description">Search by title or key takeaway.</p>
  </header>

  {% if sorted_reviews.size > 0 %}
    <div class="filter-wrap" data-reveal>
      <input class="filter-input" id="paper-reviews-search-input" data-filter-input type="search" placeholder="Search paper reviews">
      <p class="filter-empty" data-filter-empty hidden>No paper reviews match that keyword.</p>
    </div>

    <div class="notes-list">
      {% for review in sorted_reviews %}
        <a class="notes-card" data-reveal data-filter-card data-filter-text="{{ review.title | downcase }} paper review research {{ review.excerpt | strip_html | downcase }}" href="{{ review.url | relative_url }}">
          <p class="card-meta">Paper Review{% if review.date %} · {{ review.date | date: "%d %b %Y" }}{% endif %}</p>
          <h3 class="card-title">{{ review.title }}</h3>
          <p class="card-summary">{{ review.excerpt | default: "Condensed article summary and reusable research takeaways." | strip_html | truncate: 160 }}</p>
          <div class="card-tags">
            <span class="tag">Research</span>
            <span class="tag">Review</span>
          </div>
        </a>
      {% endfor %}
    </div>
  {% else %}
    <article class="premium-card" data-reveal>
      <h3 class="card-title">No paper reviews yet</h3>
      <p class="card-summary">Add a markdown file in <code>_paper_reviews/</code> to publish your next paper summary.</p>
    </article>
  {% endif %}
</section>
