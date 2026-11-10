# Model development: research and publication index

Status date: 9 November 2026. Base repository revision: `8369cd62c698f358cbe77d0457a1afaf394ee773`. Branch `feat/model-development-learning-hub`, draft PR #1; merging and deployment require Richard's explicit authorization. The area-by-area status is in [`coverage-matrix.md`](coverage-matrix.md).

## Scope and patterns

Since 9 November 2026 the material is published as a plain blog series, like Foundations: the separate hub, nav item and course pages were dropped to keep the site to one pattern, and `/model-development/` redirects to `/blog/?series=model-development`. Concept lessons and decision guides use the existing blog collection and `model-development` series. Paper reviews use the existing review collection. Reusable computational figures live beside the existing Astro figures, with pure mathematical functions under `src/lib/`. Existing foundational explanations are linked rather than duplicated. No new collection, backend, account system, analytics, progress storage or framework is introduced.

The source inventory is [`src/data/model-development/sources.json`](../../src/data/model-development/sources.json); claim mappings are [`claims.json`](../../src/data/model-development/claims.json). These records distinguish original research dates, inspected versions and source-verification dates. `Reported`, `Derived`, `Hypothesis` and `Unknown` are evidence statuses, not confidence scores. Unit-tested arithmetic is not a reproduced distributed-training experiment.

## Published units

The output check reads `publishedUnits` in `src/data/model-development.ts`; list every finished page there so its links, math, claims and figures are checked. Readers find the pages through the blog series.

| Artifact | Location | Review status |
|---|---|---|
| Former hub | `/model-development/` | Redirect to the blog series; kept out of the sitemap |
| Concept/decision lesson | `/blog/model-development-training-memory/` | Implemented; editorial review pending |
| Paper review | `/paper-reviews/zero/` | Reviewed version identified; editorial review pending |
| Memory estimator | `src/components/figures/TrainingMemoryEstimator.astro` | Numerical model tested; browser QA blocked by preview infrastructure |
| Memory arithmetic | `src/lib/training-memory.ts` | Tests cover known values, invalid inputs, units and allowances |
| Curriculum/evidence integrity | `src/lib/research-index.ts` | Tests cover cycles, dangling prerequisites, identities, source mappings, units in known modules and claims only on published units |
| Collectives lesson | `/blog/model-development-collectives/` | Implemented; editorial review pending |
| Parallelism decision guide | `/blog/model-development-choosing-parallelism/` | Implemented; editorial review pending |
| Megatron-LM review | `/paper-reviews/megatron-ptd-p/` | Reviewed version v5 identified; editorial review pending |
| Ring all-reduce stepper, communication planner, pipeline schedule | `src/components/figures/RingAllReduceStepper.astro`, `CommunicationPlanner.astro`, `PipelineSchedule.astro` | Live desktop, mobile, keyboard and no-JS QA done 9 Nov 2026 |
| Communication arithmetic | `src/lib/collectives.ts` | Tests cover ring costs, crossover, buckets, ZeRO volumes, tensor-parallel bytes, bubble, an exact ring trace, the GPipe schedule, overlap bounds, formatting and invalid inputs |

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
| Done | What communication does a memory saving require? | ZeRO §7, NCCL, Thakur et al., Megatron-LM | Published as the collectives module |
| 2 | How should model size and data share a compute budget? | Chinchilla, Llama 3 | Optimizer/loss units; derive assumptions and a held-out scaling test |
| 3 | How do tokenizer and corpus choices change the comparison? | SentencePiece, FineWeb, DCLM | Reversible encoding, common text and scoring units, contamination audit |
| 1 next | When is a benchmark improvement useful evidence? | Adding Error Bars to Evals | Paired samples, dependence, practical effect size, confirmation data |
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

Historical: the untouched baseline built 54 pages; the first slice built 57.

Re-verified on 9 November 2026 in this checkout, not taken from the handoff: `npm test` passes (37 tests), `npm run build` produces 60 pages and `npm run check:model-development` checks 6 pages, 389 internal links and anchors, 8 modules, 20 sources and 19 claims.

The earlier preview limitation no longer applies in this environment: `astro preview` on 127.0.0.1 served the build and Playwright drove a real browser. Done live: every step of the ring stepper; planner and memory-estimator inputs including blank, zero, negative, fractional, extreme and single-rank values; keyboard operation of the pipeline sliders; no horizontal overflow at 375 px on all six module pages; and with JavaScript disabled, the default worked examples, the ring summary and disabled inputs. Not done: screen-reader testing with assistive technology, and real mobile devices rather than an emulated viewport.

The 375 px sweep of all 55 built pages found Markdown tables widening several pages, including the memory lesson and a Foundations post; a build-time `rehype-table-wrap` plugin now wraps every Markdown table in a scrolling region. Three unrelated pages still overflow; they are listed in the coverage matrix.

No dependency or lockfile change. No distributed-training experiment, benchmark, model download, paid API call or deployment occurred.

## Review record

- 9 November 2026, Codex review of `f806972`: (1) communication accounting assumed one forward/backward pass per update; (2) the 7B scenario turned a state estimate into a fit claim. Both accepted. Fixed by modelling gradient accumulation with an explicit schedule (FSDP2 defaults for stage 3, verified in PyTorch 2.15), adding a microbatch input to the planner, stating each scenario's microbatches, recomputing the 70B comparison (layout A: about 101 s of modelled traffic, not 12.7 s) and rewording the fit sentence. Claims COM-13 and COM-14 added.

## Editorial decisions for review

Collectives module:

5. After the accumulation fix, the 70-billion-parameter scenario no longer shows a near tie: modelled traffic and Megatron's measurement point the same way. The guide notes that with one microbatch per step the layouts would look close.
6. All link constants (5 µs, 40 GB/s between servers, 200 GB/s inside) are illustrative assumptions, labelled as such; choose whether to replace them with figures from hardware you have used.
7. The review title calls the paper "Megatron-LM"; its arXiv title starts "Efficient Large-Scale Language Model Training".

First module:

1. Start with training memory and the historical ZeRO paper because the existing optimizer foundations support a precise first systems lesson.
2. Keep lessons inside the blog series; add a dedicated collection only if later requirements justify it.
3. Use a simple static curriculum and native self-check disclosures; defer browser-local progress tracking.
4. Review the public wording and research emphasis before merge. Completing more modules is separate work after this first slice's review.
