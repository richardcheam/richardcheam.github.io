---
title: "World Model"
date: 2026-03-01
category: "world-models"
excerpt: "A concise post on latent dynamics, planning, and model-based control."
---

{% assign post_key = page.category | default: "" | slugify %}
{% assign post_label = "Blog Post" %}
{% for cat in site.data.blog_categories %}
  {% if cat.key == post_key %}
    {% assign post_label = cat.label %}
  {% endif %}
{% endfor %}

<article class="note-article">
<p><a class="notes-backlink" href="{{ '/blog/' | relative_url }}">Back to Blog</a></p>
<p class="note-meta">{{ post_label }} • {{ page.date | date: "%d %b %Y" }} • ~4 min read</p>

<!-- Practical checklist for comparing latent dynamics models under planning constraints.

## Comparison Protocol

- Keep data splits and evaluation settings identical.
- Separate model quality from planner quality.
- Track both compute budget and inference constraints.

<div class="note-callout note-callout--definition">
<p><strong>Rule:</strong> compare like-for-like protocols first; architecture discussions are meaningless if evaluation settings differ.</p>
</div>

## Failure Checks

- Evaluate under distribution shift, not only in-distribution.
- Measure compounding error over rollout horizon.
- Document failure trajectories, not only average scores.

<div class="note-callout note-callout--pitfall">
<p><strong>Common pitfall:</strong> reporting strong one-step prediction while long-horizon planning silently fails.</p>
</div>

## Review Summary

<div class="note-summary">
<ul>
  <li>Protocol alignment before architecture claims.</li>
  <li>Long-horizon robustness matters more than single-step metrics.</li>
  <li>Failure trajectories provide the most actionable signal.</li>
</ul>
</div> -->

## Related Notes

<div class="note-related">
<ul>
  <li><a href="{{ '/paper-reviews/paper-review/' | relative_url }}">Paper Review</a></li>
  <li><a href="{{ '/blog/speech-ai/' | relative_url }}">Speech AI</a></li>
</ul>
</div>
</article>
