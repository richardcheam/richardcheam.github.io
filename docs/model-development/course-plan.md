# Foundation-model training: course plan and progress

Started 9 November 2026. This is the durable record for the course: read it first in every session, and update the progress log at the end of one. It supersedes `coverage-matrix.md` as the plan; the evidence records (`sources.json`, `claims.json`) remain the place for source and claim provenance.

## Goal and learner

Teach foundation-model **pre-training**, **large-scale distributed training** and **post-training** to an AI/ML engineer with mathematics and deep-learning foundations, at the depth and progression of a strong graduate course combined with careful paper reading. The learner should finish able to read the primary papers, reason about training decisions, inspect implementations and design sound experiments.

Delivered through the existing blog (`model-development` series) and paper-review collections. No hub, navigation work or calculators in this phase.

## Quality bar: when a lesson counts as done

A lesson is done only when it has all of the following, and has been re-read for technical and pedagogical correctness (website tests do not count):

1. The quantities defined, with shapes and units.
2. The assumptions stated, separating established results, implementation-dependent choices and open questions.
3. The mathematics developed step by step, not quoted.
4. A concrete worked example whose numbers are reproduced by code (kept in `scripts/course/`), with illustrative numbers labelled as such.
5. The connection to implementation: what the real code does, verified against a pinned version of that code.
6. Failure modes: what goes wrong, how it shows up, how to diagnose it.
7. Exercises with explained solutions.
8. Every substantive claim checked against a primary source or implementation, with the version and section recorded.

An outline, a placeholder page, an interactive figure or a passing build is not completion.

Pages show only teaching content. Evidence status (reported, derived, implementation-dependent, open), versions and verification live in `claims.json`, `sources.json` and this file, not on the page: no evidence labels, disclaimers or notes about how the page was produced. Cite sources naturally in the text.

## Audit of the existing material (9 November 2026)

The first version of this series taught only systems topics: a training-memory lesson, a collectives lesson and a parallelism decision guide, with interactive calculators. They started from memory and communication rather than from the update they distribute, and did not follow the sequence below. **On 10 November 2026 those three posts, their four figures and their two calculation libraries were removed** (recoverable from git history before commit `9fc3f83`'s successor). The distributed strand rewrites these topics in order, on the reference configuration.

Kept:

| Page | Role now |
|---|---|
| ZeRO review (`/paper-reviews/zero/`) | Review for D4; to be revised to the six-part format when D4 is written |
| Megatron-LM review (`/paper-reviews/megatron-ptd-p/`) | Review for D5 and D6; to be revised likewise |
| Foundations series (15 posts) | Prerequisites: backprop, losses, optimisers, normalisation, attention, Transformer, language models; linked, not duplicated |

Nothing taught pre-training or post-training before P1.

## Reference configuration

One configuration is used across the distributed strand and wherever a realistic scale helps, so shapes, state, communication and memory can be tracked consistently. It follows the publicly documented shape of a 7B-class dense decoder (to be verified against the model's published config before use): width 4096, 32 layers, 32 attention heads, feed-forward width 11008, vocabulary 32000, sequence length 4096, BF16 compute with FP32 optimizer state, AdamW. Global batch and device counts are chosen per lesson and stated. A small mixture-of-experts variant is introduced in D7.

Small exactly computable toys are used for worked arithmetic; the reference configuration is used for scale.

## Course sequence

Numbers are reading order within a strand. "Needs" lists hard dependencies. Reviews deepen the lesson they sit next to and follow the six-part review format: problem and prior approach; method, notation and central derivation; worked example or training-loop walkthrough; experiments and decisive ablations; what the evidence supports, confounds and leaves open; how it changes training decisions.

### Strand P: pre-training, from a corpus to a base model

| # | Lesson | Core content | Needs | Review |
|---|---|---|---|---|
| P1 | From a training example to an optimizer update | Causal prediction, shifted targets, masks, padding, document boundaries and packing, token-level loss normalization, backward pass to parameter gradients, clipping, AdamW step; traced on real numbers and against the PyTorch and Hugging Face code paths | Foundations: backprop, losses, optimisers, language models | — |
| P2 | Building a pre-training corpus | Provenance and licensing, HTML extraction, language ID, heuristic and model-based quality filters, exact and MinHash near-duplicate removal, contamination screening, PII; each stage as a measurable transformation | P1 | FineWeb (and DCLM as contrast) |
| P3 | Tokenization | BPE versus Unigram derived, normalization, byte fallback, vocabulary size trade-offs, fertility across languages and its cost in compute and context, special tokens | P1, P2 | SentencePiece |
| P4 | Mixtures and sampling | Domain weights, epochs and repetition, temperature sampling for multilingual data, curricula and annealing data | P2, P3 | Scaling Data-Constrained Language Models; DoReMi as contrast |
| P5 | The decoder architecture as a set of choices | Pre-norm versus post-norm, RMSNorm, SwiGLU, RoPE, grouped-query attention, initialization and residual scaling, dense versus mixture-of-experts at equal active compute | P1, Foundations: attention, Transformer | Llama 3 (architecture sections); GQA |
| P6 | Optimization for pre-training | AdamW with decoupled decay, warmup, cosine and warmup-stable-decay schedules, batch size and the critical batch, gradient accumulation equivalence, clipping, BF16/FP32 precision and loss spikes | P1, P5 | — (uses OLMo 2 stability findings) |
| P7 | Scaling laws and budgets | Parameters, tokens and FLOPs (6ND and its assumptions), fitting loss curves, the Chinchilla approaches compared, inference-aware budgets, how to design pilots that transfer | P6 | Chinchilla |
| P8 | Running and assessing a pre-training run | Checkpointing, validation loss and its noise, downstream evaluation with uncertainty, data ablations, diagnosing instability, annealing, continuation and recovery | P2–P7 | OLMo 2 (open training report); Llama 3 (pre-training recipe) |

### Strand D: large-scale distributed training

Starts from the semantics of one correct update (P1) and keeps that update invariant while its execution is distributed.

| # | Lesson | Core content | Needs | Review |
|---|---|---|---|---|
| D1 | One update, many devices | Global, local and micro batches; token weighting under data parallelism and accumulation; the equivalence a distributed run must preserve; DDP's gradient all-reduce | P1, P6 | — |
| D2 | Communicating gradients | Collectives, ring cost model, buckets and overlap (revised from the existing collectives lesson) | D1 | — |
| D3 | Activation memory and recomputation | Saved tensors per Transformer layer with shapes; selective and full recomputation; the peak over one step | P5, D1 | Reducing Activation Recomputation |
| D4 | Sharded state: ZeRO and FSDP | Ownership, materialization, resharding, accumulation policies, peak memory (revised from the existing memory lesson) | D1–D3 | ZeRO (revised) |
| D5 | Tensor, sequence and context parallelism | Column/row partition of attention and MLP with shapes; required all-reduce/all-gather/reduce-scatter; sequence parallelism; ring attention for long context | D2, P5 | Megatron-LM (revised) |
| D6 | Pipeline parallelism | GPipe, 1F1B and interleaved schedules; activation lifetimes; bubbles and their coupling to batch | D3, D5 | Megatron-LM (pipeline sections) |
| D7 | Mixture-of-experts at scale | Routing, capacity, load-balancing losses and auxiliary-loss-free balancing, expert parallelism and all-to-all traffic | D2, P5 | DeepSeek-V3 (MoE and training-infrastructure sections) |
| D8 | Efficient execution | IO-aware attention, kernel fusion, mixed precision and FP8 recipes with their assumptions | P6, D3 | FlashAttention |
| D9 | Running at scale | Topology, profiling, throughput and MFU, stragglers, checkpointing and fault recovery | D1–D8 | Llama 3 (infrastructure and reliability sections) |
| D10 | Choosing a layout | Capstone decision procedure on the reference configuration (revised from the existing guide) | D1–D9 | — |

### Strand T: post-training, from a base model to a useful policy

| # | Lesson | Core content | Needs | Review |
|---|---|---|---|---|
| T1 | Supervised fine-tuning | Demonstration data, chat templates, assistant-only loss masking, sequence versus token weighting, packing, distribution shift | P1 | InstructGPT (SFT stage) |
| T2 | Preference data and reward models | Pairwise comparisons, Bradley–Terry likelihood derived, annotation noise and agreement, reward-model overoptimization | T1 | InstructGPT (reward-model stage) |
| T3 | KL-regularized policy optimization | Why a reference policy appears; the optimal policy of the KL-regularized objective derived; what the KL coefficient trades | T2 | — |
| T4 | PPO-based RLHF | Policy-gradient derivation, importance ratios and clipping, value function and GAE, rollouts and the update loop | T3 | InstructGPT (PPO stage) |
| T5 | Direct Preference Optimization | DPO derived from T3's optimal policy and Bradley–Terry; the implicit reward; what offline optimization cannot do | T2, T3 | DPO |
| T6 | GRPO and verifiable rewards | Group sampling and group-relative advantages, normalization and its biases, clipping, KL choices, rollout cost | T4 | DeepSeekMath |
| T7 | Reasoning via reinforcement learning | Rule-based rewards, emergent long reasoning, cold-start data, distillation of reasoning | T6 | DeepSeek-R1 |
| T8 | Failure and evaluation in post-training | Reward hacking, verifier weaknesses, length effects, evaluation leakage, measuring reasoning | T2–T7 | — |
| T9 | Rejection sampling, distillation and iterative data | What each stage transfers, how to assess it | T1, T7 | Llama 3 (post-training sections) |

Offline preference optimization (T5) and online reinforcement learning (T4, T6, T7) are distinguished explicitly in T3, where both are introduced as answers to the same objective.

## Paper anchors to verify before use

Chinchilla (arXiv 2203.15556), Llama 3 (2407.21783), OLMo 2 (2501.00656), ZeRO (1910.02054v3), Megatron-LM (2104.04473v5), Reducing Activation Recomputation (2205.05198), FlashAttention (2205.14135), FineWeb (2406.17557), SentencePiece (Kudo and Richardson 2018), InstructGPT (2203.02155), DPO (2305.18290), DeepSeekMath (2402.03300), DeepSeek-R1 (2501.12948), DeepSeek-V3 (2412.19437). Each review records the version and sections relied on.

## Progress log

- **2026-11-09.** Direction reset: the course replaces the systems-first field guide. Audit and sequence written (this file). Implementation starts with P1. Branch `feat/course-pretraining`, based on `feat/model-development-series` (PR #4, unmerged).
- **2026-11-09, P1 drafted.** `/blog/model-development-one-update/` (series order 1). Verified against Transformers 4.51.3 and PyTorch 2.6 source, Loshchilov and Hutter v3 Algorithm 2, Llama 3 v3 §3.2 and nanoGPT; worked example and every number reproduced by `scripts/course/p1_update.py`, which checks hand gradients against autograd and the hand AdamW step against `torch.optim.AdamW`. Found and documented: the 4.51.3 Trainer counts each row's first label in `num_items_in_batch`. Self-review corrected one exercise (weight-decay factor) and two overstated phrases. Claims P1-01 to P1-07 added. **Status: drafted, awaiting Richard's review; not yet independently reviewed.**
- Existing systems posts renumbered (memory 12, collectives 13, guide 20) so P1 comes first; memory stays before collectives until both are revised for the D strand, because the collectives text builds on the memory lesson.
- **Next:** P2 (building a pre-training corpus) with the FineWeb review; first verify FineWeb (2406.17557) and the extraction, filtering and MinHash details against the paper and the datatrove code.
- **2026-11-10.** Removed the three systems-first posts (memory, collectives, layout guide), their figures and libraries, and the old hub records (`coverage-matrix.md`, `research-index.md`, `docs/superpowers`); kept the ZeRO and Megatron-LM reviews and made them self-contained. Claims located on removed pages were dropped; the course plan is now the single record.
- **2026-11-10.** Removed on-page meta commentary from P1 and both reviews (evidence-label headings and tags, the "Evidence and its limits" section, disclaimers, verification narration), per Richard; provenance stays in the claim and source records.
