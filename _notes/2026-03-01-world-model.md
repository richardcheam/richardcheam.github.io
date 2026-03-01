---
title: "World Model"
date: 2026-03-01
category: "world-models"
excerpt: "Working notes on latent dynamics, planning, and model-based control."
---

<article class="note-article">
<p><a class="notes-backlink" href="{{ '/notes/' | relative_url }}">Back to Notes</a></p>
<p class="note-meta">World Models • {{ page.date | date: "%d %b %Y" }} • ~4 min read</p>

Practical checklist for comparing latent dynamics models under planning constraints.

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
</div>

## Related Notes

<div class="note-related">
<ul>
  <li><a href="{{ '/notes/2026-03-01-paper-review/' | relative_url }}">Paper Review</a></li>
  <li><a href="{{ '/notes/2026-03-01-speech-ai/' | relative_url }}">Speech AI</a></li>
</ul>
</div>
</article>
