---
title: "Layout Example: A Sparse MoE Technical Report"
published: false
date: 2026-09-27
excerpt: "A placeholder explainer that exercises every part of the review layout: spec card, wide tables, an SVG diagram, code, config and math. The model and every number in it are invented."
type: tech-report
topic: [moe, attention, serving]
tags: [Example, MoE, MLA, FP8, Speculative decoding]
org: "Example Lab"
authors: "Placeholder Authors"
source_url: https://arxiv.org/
source_label: "Read the report"
links:
  - label: "Model card"
    url: https://huggingface.co/
source_date: 2026-09-15
featured: true
math: true
tldr:
  - "**Placeholder content.** Model X is a made-up 240B parameter mixture of experts with **12B active** parameters per token, used here only to test the layout."
  - "Compared with the previous version, it trades dense layers for more, smaller experts and a shared expert, which cuts active compute by about a third at similar quality."
  - "Latent attention shrinks the KV cache by roughly **7x**, so long context serving is bounded by expert weights rather than cache memory."
  - "For serving, expect expert parallelism plus FP8 weights to be the default recipe, with speculative decoding giving the largest single latency win."
glance:
  - label: "Total params"
    value: "240B"
  - label: "Active params"
    value: "12B"
  - label: "Context length"
    value: "128K"
  - label: "Attention"
    value: "Latent (MLA)"
  - label: "Precision"
    value: "FP8 weights"
  - label: "License"
    value: "Example only"
---

## Why this report matters

Everything on this page is a stand in. It exists to show how a long technical report explainer reads on this site, so the numbers are plausible but invented, and **Model X** does not exist. Replace this file with the first real explainer when it is ready.

A frontier technical report usually answers three questions at once: what the architecture is, how it was trained, and what it costs to run. The explainer should keep those threads separate, open with the answer, and push the evidence into tables and figures that a reader can scan later.

The rest of the page follows the order a practitioner would read in: architecture first, then what changed, then attention, training, results, and finally what it means for serving.

## Architecture

Model X is a decoder only transformer with 60 layers. The first three layers are dense; every layer after that replaces the feed forward block with a mixture of experts. Each token is routed to a small subset of experts, so only a fraction of the weights take part in any single forward pass.

### The mixture of experts layer

Each MoE layer holds 128 routed experts and one shared expert. A learned router scores every routed expert for the current token and keeps the top $$k = 2$$. The shared expert always runs, which gives every token a common path and makes the routed experts free to specialise.

<figure class="review-figure">
  <div class="review-figure__frame">
    <svg viewBox="0 0 760 300" role="img" aria-labelledby="fig-moe-title fig-moe-desc">
      <title id="fig-moe-title">Mixture of experts routing</title>
      <desc id="fig-moe-desc">A token passes through a router that selects two of eight routed experts. The two selected experts and an always active shared expert are combined by a weighted sum into the output.</desc>

      <text class="fig-text fig-text--label" x="30" y="30">Token</text>
      <rect class="fig-box fig-box--soft" x="30" y="128" width="96" height="44" rx="10"/>
      <text class="fig-text fig-text--strong" x="78" y="155" text-anchor="middle">h&#8348;</text>

      <path class="fig-line fig-line--on" d="M126 150 H176"/>
      <rect class="fig-box" x="176" y="118" width="110" height="64" rx="12"/>
      <text class="fig-text fig-text--strong" x="231" y="146" text-anchor="middle">Router</text>
      <text class="fig-text" x="231" y="166" text-anchor="middle">top-2</text>

      <text class="fig-text fig-text--label" x="360" y="30">Routed experts</text>
      <path class="fig-line" d="M286 150 C 320 150, 320 60, 360 60"/>
      <path class="fig-line fig-line--on" d="M286 150 C 320 150, 320 100, 360 100"/>
      <path class="fig-line" d="M286 150 C 320 150, 320 140, 360 140"/>
      <path class="fig-line fig-line--on" d="M286 150 C 320 150, 320 180, 360 180"/>
      <path class="fig-line" d="M286 150 C 320 150, 320 220, 360 220"/>
      <path class="fig-line" d="M286 150 C 320 150, 320 260, 360 260"/>

      <rect class="fig-box" x="360" y="44" width="120" height="32" rx="8"/>
      <text class="fig-text" x="420" y="65" text-anchor="middle">Expert 1</text>
      <rect class="fig-box fig-box--on" x="360" y="84" width="120" height="32" rx="8"/>
      <text class="fig-text fig-text--on" x="420" y="105" text-anchor="middle">Expert 2 &#183; 0.62</text>
      <rect class="fig-box" x="360" y="124" width="120" height="32" rx="8"/>
      <text class="fig-text" x="420" y="145" text-anchor="middle">Expert 3</text>
      <rect class="fig-box fig-box--on" x="360" y="164" width="120" height="32" rx="8"/>
      <text class="fig-text fig-text--on" x="420" y="185" text-anchor="middle">Expert 4 &#183; 0.38</text>
      <rect class="fig-box" x="360" y="204" width="120" height="32" rx="8"/>
      <text class="fig-text" x="420" y="225" text-anchor="middle">Expert 5</text>
      <rect class="fig-box" x="360" y="244" width="120" height="32" rx="8"/>
      <text class="fig-text" x="420" y="265" text-anchor="middle">&#8230; 128</text>

      <rect class="fig-box fig-box--soft" x="176" y="232" width="110" height="44" rx="10"/>
      <text class="fig-text fig-text--strong" x="231" y="259" text-anchor="middle">Shared</text>
      <path class="fig-line fig-line--on" d="M78 172 V254 H176"/>
      <path class="fig-line fig-line--on" d="M286 254 C 540 254, 560 170, 590 160"/>

      <path class="fig-line fig-line--on" d="M480 100 C 540 100, 560 140, 590 146"/>
      <path class="fig-line fig-line--on" d="M480 180 C 540 180, 560 156, 590 154"/>
      <circle class="fig-box" cx="610" cy="150" r="20"/>
      <text class="fig-text fig-text--strong" x="610" y="155" text-anchor="middle">&#931;</text>
      <path class="fig-line fig-line--on" d="M630 150 H676"/>
      <text class="fig-text fig-text--label" x="686" y="30">Output</text>
      <rect class="fig-box fig-box--on" x="676" y="128" width="60" height="44" rx="10"/>
      <text class="fig-text fig-text--on" x="706" y="155" text-anchor="middle">y&#8348;</text>
    </svg>
  </div>
  <figcaption><strong>Figure 1.</strong> One MoE layer. Only the two highest scoring routed experts run for this token (black), weighted by their gate values; the shared expert runs for every token. Illustrative, not taken from a real report.</figcaption>
</figure>

The output of the layer is the shared expert plus the gate weighted sum of the selected experts:

$$
y_t = E_{\text{shared}}(h_t) + \sum_{i \in \mathcal{T}_t} g_{i,t}\, E_i(h_t),
\qquad
g_{i,t} = \frac{\exp(s_{i,t})}{\sum_{j \in \mathcal{T}_t} \exp(s_{j,t})}
$$

where $$\mathcal{T}_t$$ is the set of top-2 experts for token $$t$$ and $$s_{i,t}$$ is the router score.

### Specification

| Component | Value | Note |
|:--|--:|:--|
| Layers | 60 | first 3 dense |
| Hidden size | 6,144 | |
| Routed experts per layer | 128 | top-2 per token |
| Shared experts per layer | 1 | always active |
| Expert hidden size | 1,536 | small experts, many of them |
| Attention heads | 96 | latent attention |
| KV latent dimension | 512 | compressed cache |
| Vocabulary | 160K | byte level BPE |
| Total parameters | 240B | |
| Active parameters | 12B | per token |

<div class="note-callout note-callout--definition" markdown="1">
**Active parameters.** The weights that actually take part in computing one token. For an MoE model this is the dense layers, attention, the shared expert and the $$k$$ selected experts, which is why a 240B model can cost about as much per token as a 12B dense one.
</div>

## What changed from the previous version

The previous release used fewer, larger experts and standard grouped query attention. The new version pushes further toward sparsity and fixes the cache problem that made long contexts expensive.

| | Previous version | This version | Effect |
|:--|:--|:--|:--|
| Experts per layer | 32 routed | 128 routed + 1 shared | finer specialisation |
| Experts per token | top-4 | top-2 + shared | about 33% less active compute |
| Attention | GQA, 8 KV heads | latent attention | about 7x smaller KV cache |
| Context length | 32K | 128K | long document tasks |
| Load balancing | auxiliary loss | bias based, no aux loss | less quality loss from balancing |
| Weights released in | BF16 | FP8 | half the memory to serve |
| Multi token prediction | none | 1 extra head | enables self speculative decoding |

<div class="note-callout note-callout--pitfall" markdown="1">
**Pitfall.** "Active parameters" is not a latency number. Expert weights still have to be in GPU memory, and when the batch is small, loading them dominates the time per token. A 12B active model is only as fast as a 12B dense model when batches are large enough to keep every expert busy.
</div>

## Attention

Latent attention compresses keys and values into a small shared latent vector per token, caches only that vector, and expands it back to per head keys and values when needed.

### Why the cache shrinks

For standard multi head attention, the cache per token and per layer stores keys and values for every head:

$$
\text{KV}_{\text{MHA}} = 2\, n_h\, d_h
\qquad\text{versus}\qquad
\text{KV}_{\text{latent}} = d_c + d_h^{R}
$$

With $$n_h = 96$$ heads of size $$d_h = 128$$, a latent size $$d_c = 512$$ and a small rotary part $$d_h^R = 64$$, the latent cache holds 576 values per token per layer instead of 24,576. Against the previous version's grouped query attention, the saving is the 7x quoted in the summary.

### What it costs

The expansion step adds matrix multiplications at decode time. In practice these are absorbed into the query and output projections, so the extra compute is small, but it does mean the attention kernel has to understand the latent layout. Generic attention kernels will not work without a specialised backend.

## Training recipe

The report describes three stages. As with everything here, the figures are placeholders.

1. **Pre-training** on 14T tokens at 4K context, with the learning rate warmed up over the first 2K steps and decayed with a cosine schedule.
2. **Context extension** to 128K in two steps (32K then 128K), each on about 100B tokens of long documents.
3. **Post-training** with supervised fine-tuning followed by reinforcement learning on verifiable tasks (maths, code) and a reward model for everything else.

A minimal config for the pre-training stage might look like this:

```yaml
model:
  n_layers: 60
  n_dense_layers: 3
  hidden_size: 6144
  moe:
    n_routed_experts: 128
    n_shared_experts: 1
    top_k: 2
    expert_hidden_size: 1536
    balancing: bias      # no auxiliary loss
  attention:
    type: latent
    kv_latent_dim: 512
    rope_dim: 64
train:
  tokens: 14e12
  seq_len: 4096
  lr: 2.2e-4
  warmup_steps: 2000
  schedule: cosine
  precision: fp8
```

### Load balancing without an auxiliary loss

Instead of adding a balancing term to the loss, each expert gets a bias $$b_i$$ that is added to its score only for the top-k selection. After every step, the bias of an overloaded expert goes down and that of an underloaded one goes up:

$$
b_i \leftarrow b_i - \gamma \,\operatorname{sign}\!\left(\text{load}_i - \overline{\text{load}}\right)
$$

The gate weights themselves still use the unbiased scores, so balancing changes which experts are chosen but not how their outputs are mixed.

## Results

The benchmark table is intentionally wide, to check that it scrolls inside its own frame on a phone instead of pushing the page sideways.

| Benchmark | Metric | Previous version | Model X | Dense 70B baseline | MoE baseline A | MoE baseline B |
|:--|:--|--:|--:|--:|--:|--:|
| MMLU | acc | 78.4 | **82.1** | 79.9 | 80.3 | 81.0 |
| MMLU-Pro | acc | 55.2 | **61.7** | 58.8 | 59.4 | 60.2 |
| GPQA Diamond | acc | 41.0 | **49.5** | 45.1 | 46.0 | 47.3 |
| MATH-500 | acc | 71.3 | **80.2** | 74.6 | 76.1 | 78.8 |
| HumanEval | pass@1 | 72.6 | **79.3** | 75.0 | 76.8 | 77.4 |
| LiveCodeBench | pass@1 | 30.1 | **36.9** | 32.4 | 33.0 | 35.2 |
| RULER 128K | score | n/a | **86.4** | 81.2 | 83.5 | 84.0 |

Two things are worth noticing. The largest gains are on reasoning heavy tasks (GPQA, MATH), which is consistent with the reinforcement learning stage rather than the architecture. And the long context score only exists because of the new attention: the previous version could not run 128K at all.

## Serving implications

This is where the architecture decisions show up as cost. Three levers matter most.

### Expert parallelism

With 128 experts per layer, placing all of them on every GPU wastes memory. Expert parallelism spreads experts across GPUs and sends each token to the GPU that holds its experts, which turns the MoE layer into an all-to-all communication step.

```python
from vllm import LLM, SamplingParams

llm = LLM(
    model="example-lab/model-x",      # placeholder name
    tensor_parallel_size=8,
    enable_expert_parallel=True,
    max_model_len=131072,
    kv_cache_dtype="fp8",
)

params = SamplingParams(temperature=0.6, max_tokens=512)
outputs = llm.generate(["Explain expert parallelism in one paragraph."], params)
print(outputs[0].outputs[0].text)
```

### Quantised expert kernels

FP8 weights halve the memory for experts. At small batch sizes the MoE layer is memory bound, so specialised mixed precision kernels that read quantised weights and compute in higher precision give most of the speed up.

<div class="note-callout note-callout--inference" markdown="1">
**Inference note.** For a model like this, memory for expert weights sets the minimum number of GPUs, and the all-to-all traffic of expert parallelism sets the latency floor. Measure both before choosing between one large node and several smaller ones.
</div>

### Speculative decoding

The extra multi token prediction head can draft the next token for free, and the main model verifies it in the same forward pass. With an acceptance rate $$\alpha$$ for a single drafted token, the expected tokens per step is:

$$
\mathbb{E}[\text{tokens per step}] = 1 + \alpha
$$

At the $$\alpha \approx 0.85$$ reported here, that is about 1.85 tokens per forward pass, which is close to the 1.8x decode speed up the placeholder report claims.

| Setting | Batch | Tokens / s / user | Time to first token |
|:--|--:|--:|--:|
| BF16, tensor parallel | 1 | 38 | 410 ms |
| FP8, expert parallel | 1 | 57 | 380 ms |
| FP8, expert parallel, MTP draft | 1 | 101 | 385 ms |
| FP8, expert parallel, MTP draft | 32 | 64 | 520 ms |

## Limits and open questions

- The report compares against baselines at their released precision, not at matched precision, so part of the serving gain is quantisation rather than architecture.
- Bias based balancing is only shown at this scale; whether it stays stable with more experts per token is not tested.
- Long context results use synthetic retrieval tasks, which say little about reasoning over long documents.

> The architecture is interesting, but the most reusable idea is operational: design the model so that the cheapest serving recipe is also the default one.

## Takeaways

- Sparse models move the bottleneck from compute to memory and communication; read every "active parameters" claim with that in mind.
- A compressed KV cache is what makes 128K context practical, more than any training trick.
- Built-in draft heads make speculative decoding a default rather than an extra deployment step.
