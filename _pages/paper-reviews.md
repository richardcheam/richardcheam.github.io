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
    Close readings of research papers, and long explainers of technical reports on frontier models and serving systems. Written for myself and any learner.
  </p>
</section>

<section class="section-block" id="reviews-library" data-reveal>
  <header class="section-head">
    <p class="section-eyebrow">Library</p>
    <h2>Browse the reviews</h2>
    <p class="section-description">Search by title, organisation, tag or topic, or narrow the list by type and topic.</p>
  </header>

  {% if sorted_reviews.size > 0 %}
    <div class="review-filters" data-reveal>
      <input class="filter-input" id="paper-reviews-search-input" data-filter-input type="search" placeholder="Search reviews" aria-label="Search reviews">

      <div class="facet-row" role="group" aria-labelledby="facet-type-label">
        <span class="facet-row__label" id="facet-type-label">Type</span>
        <a class="facet-chip" data-facet-link data-facet="type" data-facet-value="" href="{{ '/paper-reviews/' | relative_url }}#reviews-library">All</a>
        {% for t in site.data.paper_review_topics.types %}
          {% assign type_count = 0 %}
          {% for review in sorted_reviews %}
            {% assign review_type = review.type | default: "paper" %}
            {% if review_type == t.key %}{% assign type_count = type_count | plus: 1 %}{% endif %}
          {% endfor %}
          {% if type_count > 0 %}
            <a class="facet-chip" data-facet-link data-facet="type" data-facet-value="{{ t.key }}" href="{{ '/paper-reviews/' | relative_url }}?type={{ t.key | uri_escape }}#reviews-library">{{ t.long_label }}s <span class="facet-chip__count">{{ type_count }}</span></a>
          {% endif %}
        {% endfor %}
      </div>

      <div class="facet-row" role="group" aria-labelledby="facet-topic-label">
        <span class="facet-row__label" id="facet-topic-label">Topic</span>
        <a class="facet-chip" data-facet-link data-facet="topic" data-facet-value="" href="{{ '/paper-reviews/' | relative_url }}#reviews-library">All</a>
        {% for t in site.data.paper_review_topics.topics %}
          {% assign topic_count = 0 %}
          {% for review in sorted_reviews %}
            {% assign review_topics = review.topic | join: "," | split: "," %}
            {% if review_topics contains t.key %}{% assign topic_count = topic_count | plus: 1 %}{% endif %}
          {% endfor %}
          {% if topic_count > 0 %}
            <a class="facet-chip" data-facet-link data-facet="topic" data-facet-value="{{ t.key }}" href="{{ '/paper-reviews/' | relative_url }}?topic={{ t.key | uri_escape }}#reviews-library">{{ t.label }} <span class="facet-chip__count">{{ topic_count }}</span></a>
          {% endif %}
        {% endfor %}
      </div>

      <p class="facet-count" data-filter-count aria-live="polite">{{ sorted_reviews.size }} {% if sorted_reviews.size == 1 %}entry{% else %}entries{% endif %}</p>
      <p class="filter-empty" data-filter-empty hidden>Nothing matches these filters yet.</p>
    </div>

    <div class="review-grid">
      {% for review in sorted_reviews %}
        {% include review-card.html review=review featured=review.featured filterable=true %}
      {% endfor %}
    </div>
  {% else %}
    <article class="premium-card" data-reveal>
      <h3 class="card-title">No reviews yet</h3>
      <p class="card-summary">Add a markdown file in <code>_paper_reviews/</code>, starting from <code>_paper_reviews/_template.md</code>.</p>
    </article>
  {% endif %}
</section>
