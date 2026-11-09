# Model development: research and publication index

Status date: 9 November 2026. Base repository revision: `8369cd62c698f358cbe77d0457a1afaf394ee773`. This first implementation is a reviewable branch; merging and deployment require Richard's explicit authorization.

## Scope and patterns

The public hub is `/model-development/`. Concept lessons and decision guides use the existing blog collection and `model-development` series. Paper reviews use the existing review collection. Reusable computational figures live beside the existing Astro figures, with pure mathematical functions under `src/lib/`. Existing foundational explanations are linked rather than duplicated. No new collection, backend, account system, analytics, progress storage or framework is introduced.

The source inventory is [`src/data/model-development/sources.json`](../../src/data/model-development/sources.json); claim mappings are [`claims.json`](../../src/data/model-development/claims.json). These records distinguish original research dates, inspected versions and source-verification dates. `Reported`, `Derived`, `Hypothesis` and `Unknown` are evidence statuses, not confidence scores. Unit-tested arithmetic is not a reproduced distributed-training experiment.

## Complete first vertical slice

| Artifact | Location | Review status |
|---|---|---|
| Curriculum and reading hub | `/model-development/` | Implemented; editorial review pending |
| Concept/decision lesson | `/blog/model-development-training-memory/` | Implemented; editorial review pending |
| Paper review | `/paper-reviews/zero/` | Reviewed version identified; editorial review pending |
| Memory estimator | `src/components/figures/TrainingMemoryEstimator.astro` | Numerical model tested; browser QA blocked by preview infrastructure |
| Memory arithmetic | `src/lib/training-memory.ts` | Tests cover known values, invalid inputs, units and allowances |
| Curriculum/evidence integrity | `src/lib/research-index.ts` | Tests cover cycles, dangling prerequisites, identities and source mappings |

The lesson and review use source-based educational analysis. They make no claim that Richard independently reproduced a paper, trained a frontier model, measured the calculator's allocations, or endorsed a disputed technique. The calculator's policy is deliberately narrow: illustrative mixed-precision full-parameter Adam with ideal balanced state ownership. Its allowances are user inputs, not measured peaks.

## Existing material reused

| Foundation | Existing route |
|---|---|
| Backpropagation | `/blog/foundations-neurons-backprop/` |
| Optimizers and schedules | `/blog/foundations-optimisers/` |
| Transformer and attention | `/blog/foundations-transformer/`, `/blog/foundations-attention/` |
| Likelihood and language models | `/blog/foundations-language-models/` |
| Tokenization context | `/blog/khmer-script-for-tts/` |
| Benchmark units and evidence | `/blog/benchmark-denominators/`, `/blog/speech-evaluation-metrics/` |
| Serving workload | `/blog/inference-workload-lifecycle/`, `/blog/throughput-versus-usable-latency/` |

## Prioritized next questions — no empty routes

| Priority | Question | Candidate reading | Dependencies and decision gate |
|---|---|---|---|
| 1 | What communication does a memory saving require? | ZeRO communication analysis, FSDP2, Megatron | Memory ledger; separate collective bytes from measured latency |
| 2 | How should model size and data share a compute budget? | Chinchilla, Llama 3 | Optimizer/loss units; derive assumptions and a held-out scaling test |
| 3 | How do tokenizer and corpus choices change the comparison? | SentencePiece, FineWeb, DCLM | Reversible encoding, common text and scoring units, contamination audit |
| 4 | When is a benchmark improvement useful evidence? | Adding Error Bars to Evals | Paired samples, dependence, practical effect size, confirmation data |
| 5 | How should continuation balance adaptation and retention? | Llama 3/DeepSeek phase reports; add targeted continuation sources | Fixed base checkpoint, target/general evaluations, matched resource accounting |
| 6 | Which feedback supports SFT, DPO or online RL? | DPO, DeepSeek-R1 | Likelihood, KL, preferences, verifier qualification and rollout cost |
| 7 | Which architecture reduces lifecycle cost? | Dense/sparse and attention reports | Workload, memory, network and time-to-quality evidence |
| 8 | Which serving constraint should influence training? | Existing inference notes; add serving primary sources | Prefill/decode, KV, batching and latency objectives |

Each future slice needs a finished concept/decision lesson, a closely related review when useful, a source-to-claim map, mathematical checks, and a reviewable PR. Research questions may change when evidence contradicts the initial hypothesis. Do not turn this table into stub pages.

## Contradictions and disclosure boundaries

- The illustrative sixteen-byte ledger is not a literal allocation trace of FSDP2's tutorial precision policy. They are distinct assumptions, explained beside the example.
- Parameter ownership and instantaneous residency are distinct; a state floor does not prove fit.
- Historical systems evaluations and current APIs are separate evidence. Preserve the reviewed paper version when updating a review.
- Different parallelism, batch, hardware and implementation choices confound a universal speedup attribution.
- Unknown real-run peaks, time to quality, recovery behavior and network contention require measurement; calculator output cannot fill these gaps.

When a report is corrected, update the record's `reviewedVersion` and verification date, preserve earlier historical context, and revisit affected claim IDs and articles. A new educational date must not replace the research's publication date.

## Validation record and limits

The untouched baseline built 54 pages. The initial integrated slice built 57 pages. The mathematical and research-index tests passed locally. The rendered-output checker verifies the three new pages, their local targets/anchors, math output, sitemap/feed entries and generated OG images. Existing menu links for separately hosted Inference Engineering and Embedding Diagnostics are outside this repository's `dist`; source declarations and public retrieval establish that boundary rather than creating false local pages.

The supported preview daemon started, but Vite rejected its exact assigned `terminal.local` host. Browser interaction, desktop visual QA, actual mobile viewport QA and keyboard interaction are therefore **unverified**. No alternative browser server, network bypass or unrelated application configuration change was introduced. Static responsive rules, native labeled controls, overflow regions, no-JS default estimates and source checks were inspected; these are not substitutes for live accessibility/browser testing.

No dependency versions or lockfile were changed. The new PR-only workflow has read permissions and runs tests, build and rendered-output checks; the production deployment workflow remains unchanged. An independent whole-branch review approved draft-PR readiness without defects. CI results are pending until the pull request runs. No distributed-training experiment, model download, paid API call or deployment occurred.

## Editorial decisions for review

1. Start with training memory and the historical ZeRO paper because the existing optimizer foundations support a precise first systems lesson.
2. Keep lessons inside the blog series; add a dedicated collection only if later requirements justify it.
3. Use a simple static curriculum and native self-check disclosures; defer browser-local progress tracking.
4. Review the public wording and research emphasis before merge. Completing more modules is separate work after this first slice's review.
