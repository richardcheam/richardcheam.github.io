# Model development: plan and progress

Started 9 November 2026; reorganized around reader abilities on 10 November 2026. This is the durable internal record for the series: read it first in every session, and update the progress log at the end of one. Writing standards, including how deep to treat each concept, are in [`writing-guide.md`](writing-guide.md); read it before writing or revising a post or review. Source and claim provenance lives in `src/data/model-development/sources.json` and `claims.json`.

## Goal

An accessible, technically rigorous learning resource about building, post-training, scaling and using foundation models, delivered as blog posts (`model-development` series) and paper reviews. Language models are the main starting point; a later post explains which principles transfer to vision, speech and multimodal models and where their objectives and architectures differ. Other modalities are not expanded before that.

## Abilities the series builds

Each topic exists to develop one or more of these. A topic that serves none of them does not belong in the essential sequence.

| Code | The reader can… |
|---|---|
| **A1** | Explain and implement a small language model's training loop. |
| **A2** | Make informed choices about data, tokenization, architecture and optimization. |
| **A3** | Understand how that training loop is distributed across GPUs. |
| **A4** | Adapt a base model with SFT, preference optimization and reinforcement learning. |
| **A5** | Build and evaluate a useful application using an existing model. |
| **A6** | Diagnose failures and compare alternatives under a stated compute, latency or cost budget. |

## How topics are recorded

For every topic: the **question** it answers, the **ability** it develops, its **actual prerequisites** (only what is needed to follow it, not everything earlier in the list), and whether it is **essential** or **optional** further study. Within a post, how deeply to treat each concept (understand deeply, understand operationally, recognize and reference) is decided by the post's question, following the writing guide.

There is no single prerequisite chain. Four tracks share the Foundations series as their base and meet where a topic genuinely needs another:

- **Build**: how a base model is made.
- **Scale**: how the same training loop runs on many GPUs.
- **Adapt**: post-training a base model.
- **Use**: building and evaluating applications on existing models.

Post-training needs the model, probability and optimization foundations (B1 and the Foundations posts), not the Scale track. The Use track opens with only the Foundations language-model post as a prerequisite, so applications are reachable early.

## Essential sequence

Topics are questions, not post slots: a substantial question may be split across posts, and overlapping explanations combined into one. Each published post answers one clear question. `series_order` follows the track order below; each post states its real prerequisites in its opening, so readers can enter the Adapt or Use track without the Scale track.

| Order | Slug (`/blog/…/`) | Question | Abilities | Needs | Review | Status |
|---|---|---|---|---|---|---|
| **Build** | | | | | | |
| 1 | `model-development-one-update` | What happens between a batch of token IDs and a changed weight? | A1, A6 | Foundations: backprop, losses, optimisers, language models | — | Published |
| 2 | `model-development-pretraining-corpus` | How does each processing stage change the training distribution, and is it worth what it removes? | A2, A6 | 1 | FineWeb | PR #6 |
| 3 | `model-development-data-mixtures` | How do sampling weights decide how often each source is seen, and when is repetition acceptable? | A2, A6 | 2 | — | Planned |
| 4 | `model-development-tokenization` | How does text become token IDs, and what does the tokenizer cost in compute, context and multilingual coverage? | A1, A2 | Foundations: language models | — | Planned |
| 5 | `model-development-decoder-architecture` | Which choices in a modern decoder matter, and what does each cost or buy? | A2 | Foundations: attention, Transformer, normalisation | — | Planned |
| 6 | `model-development-small-training-run` | What does a complete small training run involve, and how do you know it is working? | A1, A2, A6 | 1, 4, 5 | — | Planned |
| 7 | `model-development-scaling-laws` | How should parameters and tokens share a compute budget, and what can small experiments predict? | A2, A6 | 6 | Chinchilla | Planned |
| **Scale** | | | | | | |
| 8 | `model-development-gpu-memory-compute` | What does a GPU store and compute during training, and where are the bottlenecks? | A3, A6 | 1, 5 | — | Planned |
| 9 | `model-development-data-parallelism` | How is one update computed on many GPUs without changing its meaning? | A3 | 1, 8 | — | Planned |
| 10 | `model-development-sharding-recomputation` | How do ZeRO/FSDP and activation recomputation make a model fit, and what do they cost? | A3, A6 | 8, 9 | ZeRO | Planned |
| 11 | `model-development-model-parallelism` | How are layers and sequences split across GPUs (tensor, pipeline, sequence/context, expert parallelism)? | A3, A6 | 5, 9 | Megatron-LM | Planned |
| 12 | `model-development-efficient-execution` | Why do IO-aware attention, mixed precision and FP8 speed training, and what do they assume? | A3, A6 | 5, 8 | FlashAttention | Planned |
| 13 | `model-development-running-at-scale` | How do you measure throughput, overlap communication, recover from failures and choose a layout? | A3, A6 | 9–12 | — | Planned |
| **Adapt** | | | | | | |
| 14 | `model-development-supervised-fine-tuning` | How does a base model learn to follow instructions, and what do templates and loss masks decide? | A4 | 1 | — | Planned |
| 15 | `model-development-post-training-data` | Where does post-training data come from: curated prompts, synthetic data, rejection sampling and distillation? | A4, A6 | 14 | Tülu 3 | Planned |
| 16 | `model-development-preference-optimization` | How do pairwise preferences become a training signal, through a reward model or directly (DPO)? | A4 | 14 | DPO | Planned |
| 17 | `model-development-reinforcement-learning` | How do policy gradients, KL regularization and verifiable rewards improve a model; how do PPO and GRPO differ? | A4 | 14, 16 | DeepSeekMath (GRPO) | Planned |
| 18 | `model-development-post-training-failures` | How do reward hacking, length effects and distribution shift show up, and how is post-training evaluated? | A4, A6 | 16, 17 | — | Planned |
| **Use** | | | | | | |
| 19 | `model-development-choosing-a-model` | How do you choose a model and establish a baseline worth beating? | A5, A6 | Foundations: language models | — | Planned |
| 20 | `model-development-prompting-context` | How do instructions, context and structured outputs control what a model does? | A5 | 19 | — | Planned |
| 21 | `model-development-retrieval-tools` | How does a model use information and actions it was not trained on, and when is an agentic loop justified? | A5, A6 | 20 | — | Planned |
| 22 | `model-development-adapt-or-prompt` | Prompting, retrieval or fine-tuning: which fits, and how does LoRA adapt a model cheaply? | A4, A5, A6 | 20, 21; 14 for fine-tuning | LoRA | Planned |
| 23 | `model-development-inference-serving` | What determines latency, throughput and cost when serving, and what does quantization trade? | A5, A6 | 5 | — | Planned |
| 24 | `model-development-evaluating-applications` | How do you know an application works, and keep knowing after release, safely? | A5, A6 | 19–21 | — | Planned |
| **Connections** | | | | | | |
| 25 | `model-development-how-it-fits` | How do data, training, post-training, inference and application requirements constrain one another? | A2, A5, A6 | any track | — | Planned |
| 26 | `model-development-other-modalities` | What transfers to vision, speech and multimodal models, and what differs? | A2, A5 | 5, 6 | — | Planned |

Evaluation is taught where it is used: validation loss and its noise (6), what small experiments predict (7), throughput metrics (13), post-training evaluation (18), baselines (19) and application evaluation (24).

## Optional further study

Specialist material that serves readers implementing one subsystem. Write an optional article only when one is actually needed (a reader question, or a post that would otherwise be interrupted); otherwise summarize in the main post and link to a good external explanation.

| Topic | Question | Needs | Good external starting points |
|---|---|---|---|
| MinHash and locality-sensitive hashing | Why does minhash agreement estimate Jaccard similarity, and how do buckets set the threshold? | B2 | CS336 lecture 14 (`jaccard_minhash`, `locality_sensitive_hashing`); Broder (1997); FineWeb App. E.1 |
| Advanced mixture optimization | How can mixture weights be optimized with proxy models or regression, and do they transfer across scale? | B2b, B5 | CS336 lecture 14 (`data_mixing`: RegMix and related); DoReMi |
| Optimizer and schedule details | Warmup, cosine versus warmup-stable-decay, critical batch size, loss spikes | B5 | OLMo 2 report |
| Collective communication | Ring and tree all-reduce cost models | S1 | CMU 15-442 "ML Parallelization (Data Parallelism and Zero Redundancy)" (11 Feb 2026); NCCL documentation |
| Pipeline schedules | GPipe, 1F1B, interleaving and bubbles | S2 | Megatron-LM review; CMU 15-442 "ML Parallelization (Model and Pipeline Parallelism)" (16 Feb 2026) |
| Mixture-of-experts at scale | Routing, load balancing, expert parallelism | B4, S2 | DeepSeek-V3 report; CMU 15-442 "LLMs: Mixture of Experts" (25 Mar 2026) |
| PPO in detail | Value functions, GAE, clipping | T3 | InstructGPT; Tülu 3 report |
| Reasoning through reinforcement learning | Long chains of thought, cold start, distillation | T3 | DeepSeek-R1; Berkeley CS294-280 (2025) lectures on reasoning |
| Speculative decoding and serving internals | Paged attention, continuous batching, drafting | U4 | CMU 15-442 "LLM Serving" parts 1 and 2 (9 and 16 Mar 2026) |

## Resources

Courses support the progression, papers supply methods and evidence, implementations reveal operational details. Each post picks a small set that actually explains its question and records exact sections or lecture timestamps here or in `sources.json`. A video is recorded as used only if it was watched; otherwise the record names the slides or notes that were read. Where sources disagree (conventions, defaults, results), the post explains the disagreement instead of silently mixing them.

| Resource | Role | What has actually been read |
|---|---|---|
| [Stanford CS336, Spring 2026](https://cs336.stanford.edu/) | Primary backbone for building language models: tokenization (lecture 1), resource accounting (2), architectures (3–4), GPUs and kernels (5–6), parallelism (7–8), scaling laws (9, 11), inference (10), evaluation (12), data (13–14), post-training (15–16) | Lecture files `lecture_01.py`, `lecture_13.py` and `lecture_14.py` at `stanford-cs336/lectures` commit `de53a9f`: section structure, and `filtering`, `deduplication`, `data_mixing` of lecture 14 in full. No videos watched. |
| [CMU 15-442/642 Machine Learning Systems, Spring 2026](https://mlsyscourse.org/) | Systems supplement (lectures are unnumbered; cited by title and date): data parallelism and ZeRO (11 Feb), model and pipeline parallelism (16 Feb), memory optimization (18 Feb), LLM serving (9 and 16 Mar), PEFT (18 Mar), MoE (25 Mar) | Schedule page only. |
| [Tülu 3](https://allenai.org/tulu) (arXiv 2411.15124), with OLMo reports | Open post-training recipe with released data, code (open-instruct), evaluation (oe-eval) and decontamination tooling: anchor for T1–T3 | Project page only. |
| [Berkeley CS294/194-280 Advanced LLM Agents, Spring 2025](https://rdi.berkeley.edu/adv-llm-agents/sp25) | Inference-time reasoning (Jan 27, Feb 3), open training recipes for reasoning (Feb 24), agents, tools and security (Apr 28): anchor for U2, T3 and agent safety | Syllabus page only. |
| Llama 3 and DeepSeek-V3/R1 reports | Large-scale recipes and evidence | Llama 3 v3 §3.2 (for B1). |

## Reference configuration

For the Scale track and wherever realistic scale changes a conclusion: a 7B-class dense decoder (width 4096, 32 layers, 32 heads, feed-forward width 11008, vocabulary 32000, sequence length 4096, BF16 compute with FP32 optimizer state, AdamW), to be verified against a published config before use. Small exactly computable toys are used for worked arithmetic.

## Paper reviews

A review deepens the evidence and interpretation behind a post rather than repeating it. Format: the problem and prior approach; the method and its central argument; the decisive experiments and ablations; what the evidence supports, confounds and leaves open; how it changes a decision. A worked example appears only when it serves the evidence.

Published: ZeRO and Megatron-LM (for S2, to be revised then), FineWeb (B2, in review). Planned anchors, to be verified before use: SentencePiece (B3), Llama 3 architecture sections or OLMo 2 (B4, B5), Chinchilla (B6), Tülu 3 (T1–T3), DPO (T2), DeepSeekMath or DeepSeek-R1 (T3).

## Earlier audit (9–10 November 2026)

The first version taught only systems topics (training memory, collectives, a parallelism guide, with calculators). Those posts were removed on 10 November 2026 and remain in git history; the ZeRO and Megatron-LM reviews were kept. The Foundations series (15 posts) is the shared prerequisite base: linked, not duplicated.

## Progress log

- **2026-11-09.** Direction reset: the course replaces the systems-first field guide. Implementation starts with P1 (now B1).
- **2026-11-09, P1 drafted.** `/blog/model-development-one-update/`. Verified against Transformers 4.51.3 and PyTorch 2.6 source, Loshchilov and Hutter v3 Algorithm 2, Llama 3 v3 §3.2 and nanoGPT; numbers reproduced by `scripts/course/p1_update.py`. Claims P1-01 to P1-07.
- **2026-11-10.** Removed the three systems-first posts, their figures and libraries, and the old hub records; kept the ZeRO and Megatron-LM reviews. Removed on-page meta commentary from P1 and both reviews.
- **2026-11-10, P1 revised after review.** Rebuilt on separate small examples per `writing-guide.md`; fixed eight review findings (ignored labels still pass input gradients; clipping versus Adam updates; non-finite gradients; zero-target steps; Adam's history dependence; accumulation equivalence; position IDs; the attention demo position). Trainer 4.51.3 count re-verified in source and by an executed one-step run. Claims P1-02, P1-06, P1-07 rewritten; P1-08, P1-09 added. Merged as PR #5 and deployed.
- **2026-11-10, P2 drafted with the FineWeb review (PR #6).** Verified against FineWeb arXiv v2, DCLM v4 §4.2–4.4 and datatrove v0.10.1 (filters, language ID and PII formatter executed on the toy documents). Claims P2-01 to P2-11.
- **2026-11-10, plan reorganized.** Curriculum restructured around abilities A1–A6 with four tracks (Build, Scale, Adapt, Use), real prerequisites, an essential sequence of eighteen topics and an optional list; application coverage added (U1–U5); resource roles recorded with what has actually been read (CS336 lecture files 1, 13, 14 at commit `de53a9f`; CMU, Tülu and Berkeley pages only). The previous P/D/T tables are superseded: P1→B1, P2→B2, P3→B3, P5→B4, P6 and P8→B5, P7→B6, D1–D2→S1, D3–D6→S2, D8→S3, D7→optional, T1→T1, T2+T5→T2, T3+T4+T6+T7+T8→T3 with PPO and reasoning details optional, T9→folded into T1/T3. Writing guide extended with the editorial depth rule.
- **2026-11-10, B2 (P2) revised under the editorial rule.** Post shortened by about 28% (4,978 to 3,596 words including front matter) and refocused on the training decision: a new section judges each stage at a fixed training budget, with a predict-token-exposure activity (100B and 1T budgets; 30% versus 10% thresholds) grounded in Muennighoff et al. 2023 (abstract, Fig. 1) and CS336 lecture 14 (`filtering`). MinHash reduced to an operational paragraph (similarity example, signature intuition, the 77% / 99% match rates and the cost trade-off); the derivation moved to further reading (CS336 lecture 14, FineWeb App. E.1, Broder) and the review; figures MinHashOrders and BandingCurve deleted. Global deduplication now presented in FineWeb's setting, with the toy figure relabelled as a toy and a counterexample (CS336's product description repeated 61,036 times in C4); the newspaper analogy removed. Contamination corrected: exposure to items, answers and close derivatives, not general knowledge; the toy now compares a textbook page, a quiz copy and a reworded item (1/6, 6/6, 1/6 shared 3-grams). Paper-versus-code discrepancies removed from the post (kept in the review). The script caught one error during revision: a pair at similarity 0.6 is matched about 21% of the time, not "rarely". Review: the toy figure removed in favour of a deeper account of the 2013-48 kept-versus-removed experiment and what it does not establish; a fixed-budget confound and a budget-aware decision added. Claims P2-02, P2-03, P2-06 updated; P2-12 to P2-14 and sources `muennighoff-2023`, `cs336-2026` added. **Status: revised, awaiting Richard's preview; PR #6 not merged.**

## Continuation notes

Working branch `feat/md-series`, stacked on `feat/p2-corpus` (PR #6). Merging and deployment need Richard's separate authorization.

- **Done (drafted and verified):** Build 1–7 and Scale 8–13, with reviews Chinchilla and FlashAttention. Every post's numbers are reproduced by `scripts/course/p3_…p13_*.py`; executed checks include five CPU training runs (p6), two-process DDP normalization (p9), ZeRO-1 with `ZeroRedundancyOptimizer` (p10), a tensor-parallel MLP (p11) and tiled attention and FP8 scaling (p12). FLORES-200 and three tokenizers' files were downloaded for p4 (FLORES_DIR needed to rerun).
- **Not executed:** FSDP2 `fully_shard` (PyTorch 2.6 needs accelerator streams on this machine); any GPU throughput measurement; anything at scale.
- **Open forward links:** posts 14, 18, 23 and 24 are linked from Build/Scale posts and must exist before the check passes.
- **Exact next action:** write post 14 (`model-development-supervised-fine-tuning`), then the rest of the Adapt track.
