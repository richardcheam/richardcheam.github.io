---
# ─────────────────────────────────────────────────────────────────────────────
# Authoring template for Paper Reviews.
# Files starting with "_" are never published by Jekyll, so this file is safe
# to keep here. Copy it to `_paper_reviews/<slug>.md` (the slug becomes the URL:
# /paper-reviews/<slug>/), fill it in, and delete what you do not use.
#
# Layout: `paper-review` is applied automatically (see `defaults` in _config.yml).
# ─────────────────────────────────────────────────────────────────────────────

title: "Model or Paper Name"            # required; shown as the page h1
date: 2026-10-01                        # required; review date, sorts the index
excerpt: "One or two sentences that say what this is and why it matters."  # required; card summary and page subtitle

type: tech-report                       # paper | tech-report (default: paper). Keys live in _data/paper_review_topics.yml
topic: [moe, attention, serving]        # one or more topic keys from _data/paper_review_topics.yml
tags: [MLA, FP8, MTP]                   # free text; searchable, shown on the entry

org: "Lab or company"                   # shown on cards and in the header
authors: "First Author, Second Author"  # optional
source_url: https://arxiv.org/abs/0000.00000   # optional; the primary button
source_label: "Read the report"         # optional; default is "Read the paper" or "Read the report"
links:                                  # optional extra buttons
  - label: "Model card"
    url: https://huggingface.co/
  - label: "Code"
    url: https://github.com/
source_date: 2026-09-20                 # optional; when the paper or report came out

featured: false                         # optional; true makes the card span the full row on the index
series: model-family                    # optional; entries sharing this key get Previous / Next links
series_title: "Model Family"            # optional; readable series name
series_order: 1                         # optional; position inside the series

read_time: 12                           # optional; minutes. Leave out to compute from word count (220 wpm)
math: true                              # optional; loads KaTeX on this page only

tldr:                                   # optional but recommended: 3 to 5 answers up front. Markdown allowed
  - "The single most important result, with its number."
  - "What changed compared with the previous version."
  - "What this means if you serve or fine-tune it."

glance:                                 # optional; tech reports. Any label / value pairs, shown as a spec card
  - label: "Total params"
    value: "000B"
  - label: "Active params"
    value: "00B"
  - label: "Context length"
    value: "128K"
  - label: "Attention"
    value: "MLA"
  - label: "Precision"
    value: "FP8"
  - label: "License"
    value: "MIT"
---

<!--
  Write the body in Markdown. Every `##` and `###` heading goes into the
  "On this page" contents automatically, and `##` headings are numbered.
  Keep headings short: they are also the navigation.
-->

## First section

Plain paragraphs, **bold** for the key number, and `inline code` for names such as `max_num_seqs`.

### A subsection

Lists work as usual:

- First point.
- Second point.

## Tables

Write standard Markdown tables. They scroll sideways inside their own frame on small screens, so wide benchmark tables are fine.

| Model | Params | Active | MMLU | GSM8K |
|:--|--:|--:|--:|--:|
| Previous version | 000B | 00B | 00.0 | 00.0 |
| This version | 000B | 00B | **00.0** | **00.0** |

## Figures

Inline SVG goes inside a figure. Use the `fig-*` classes so the drawing follows the site colours: `fig-box`, `fig-box--soft`, `fig-box--on` (black, for the highlighted element), `fig-line`, `fig-line--on`, `fig-text`, `fig-text--strong`, `fig-text--on`, `fig-text--label`.

<figure class="review-figure">
  <div class="review-figure__frame">
    <svg viewBox="0 0 640 120" role="img" aria-labelledby="fig-template-title">
      <title id="fig-template-title">Describe the diagram for screen readers</title>
      <rect class="fig-box" x="20" y="40" width="160" height="44" rx="10"/>
      <text class="fig-text fig-text--strong" x="100" y="67" text-anchor="middle">Input</text>
      <path class="fig-line fig-line--on" d="M180 62 H460"/>
      <rect class="fig-box fig-box--on" x="460" y="40" width="160" height="44" rx="10"/>
      <text class="fig-text fig-text--on" x="540" y="67" text-anchor="middle">Output</text>
    </svg>
  </div>
  <figcaption><strong>Figure 1.</strong> A caption that says what to notice, not what is drawn.</figcaption>
</figure>

Images work the same way: put an `<img src="..." alt="...">` inside `review-figure__frame`.

## Code and config

```python
from vllm import LLM, SamplingParams

llm = LLM(model="org/model", tensor_parallel_size=8)
print(llm.generate(["Hello"], SamplingParams(max_tokens=32)))
```

```yaml
max_model_len: 131072
enable_expert_parallel: true
```

## Math

Needs `math: true` in the front matter. Inline math uses double dollars inside a sentence, such as $$O(n^2)$$, and a display equation sits on its own lines:

$$
\mathrm{Attention}(Q, K, V) = \mathrm{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V
$$

## Callouts

<div class="note-callout note-callout--definition" markdown="1">
**Definition.** For terms the reader needs before going further.
</div>

<div class="note-callout note-callout--pitfall" markdown="1">
**Pitfall.** For claims that do not hold outside the paper's setup, or easy misreadings.
</div>

<div class="note-callout note-callout--inference" markdown="1">
**Inference note.** For serving implications: memory, kernels, batching, latency.
</div>

<!--
  ──────────────────────────────────────────────────────────────────────────
  Optional section set for classic paper reviews (type: paper).
  Delete the sections above and keep these, or mix both.
  ──────────────────────────────────────────────────────────────────────────

## 10 Minute Pass

1. The **problem** in one sentence.
2. The **core method** in one sentence.
3. The **main result** in one sentence.

<div class="note-callout note-callout--definition" markdown="1">
**Why this works:** forcing one line summaries exposes whether the paper was really understood.
</div>

## Deep Pass

- What assumptions are hidden?
- What data constraints limit transferability?
- Which component is reusable in my own projects?

## Action Block

- One experiment to run.
- One idea to reuse.
- One claim to verify before trusting it.

## Review Summary

- Why the paper matters, in one sentence.
- What I would do differently.
-->
