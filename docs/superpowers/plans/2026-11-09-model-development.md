# Model-development learning hub implementation plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task by task. Steps use checkbox syntax for tracking.

**Goal:** Deliver a source-grounded first learning module integrated into the existing portfolio and ready for PR review.

**Architecture:** Existing blog/review collections, one static learning hub, a native Astro figure and a pure TypeScript memory model. Typed curriculum and JSON evidence keep public navigation separate from research provenance.

**Tech stack:** Existing Astro/MDX/KaTeX/SCSS, TypeScript, Node's built-in test runner. No added dependencies.

**Spec:** `docs/superpowers/specs/2026-11-09-model-development-design.md`.

## Global constraints

- Default production branch is `master`; work on `feat/model-development-learning-hub` only.
- No production push, merge, deployment, paid compute, training jobs, or model downloads.
- Preserve existing content, collection schemas, layouts, styling and lockfile.
- All numerical estimates have explicit assumptions; state floors never imply guaranteed fit.
- Separate historical reported results, original derivations and unperformed proposed experiments.

## Review focus

- Blank, NaN, negative, fractional device counts or infinite numeric inputs must not yield plausible estimates.
- Device count 1 and non-divisible parameter counts must obey the documented ideal balanced-state model.
- A persistent floor below capacity must not be presented as an OOM-free configuration.
- Keyboard/mobile/no-JS users must retain controls, explanations and useful initial results.
- Planned topics must not generate dead routes or claim advanced coverage that does not yet exist.

### Task 1: Memory model and targeted tests

Files: create `src/lib/training-memory.ts`, `tests/training-memory.test.ts`; add test script in package.json.

Interface: `estimateTrainingMemory(input: MemoryInput): MemoryRow[]`, where input includes `parameters`, `devices`, `activationBytes`, `workspaceBytes`, `materializationBytes`; rows expose stage, weights, gradients, optimizer, persistent and budgeted bytes. `toGiB(bytes: number): number` converts by 2^30. Stage 3 alone receives the explicitly supplied additional materialization allowance.

- [x] Write tests with independently calculated 7B/8-device byte totals: 112e9, 38.5e9, 26.25e9, 14e9.
- [x] Run `node --test tests/training-memory.test.ts`; expect a missing-module failure before implementation.
- [x] Implement the fixed illustrative Adam ledger, validation and allowances.
- [x] Test single-device equality, monotonic floors, input rejection, decimal-vs-binary units and Stage-3 materialization/unchanged activation allowances.
- [x] Run the test command; expect all tests passing. Commit task.

### Task 2: Complete hub, lesson/review and estimator

Files: create `src/pages/model-development/index.astro`, `src/data/model-development.ts`, source/claim JSON, `src/components/figures/TrainingMemoryEstimator.astro`, the two MDX content files and research index; modify series, Base navigation and sitemap.

Consumes: Task 1's pure numerical interface. Produces: a static hub and mutually linked lesson/review with source-grounded knowledge checks.

- [x] Add a dependency-aware curriculum and immediate source/claim inventory; ensure every public link has a real destination.
- [x] Implement server-rendered estimator rows with labeled numeric controls and live client recalculation; blank inputs show validation rather than zero.
- [x] Reuse foundation posts and existing blog/review layouts; preserve existing content.
- [x] Add the concept lesson and ZeRO review with derivations, conditions, limitations and worked questions.
- [x] Run `npm test` and `npm run build`; expect green tests, schema-valid content and generated hub/blog/review routes. Commit task.

### Task 3: Validation, independent review and PR

Files: add `scripts/check-model-development.mjs`, targeted rendered-output checks and `.github/workflows/model-development-checks.yml`; update README and research status.

- [x] Validate built links/anchors and math on the hub, new lesson and review; validate the evidence inventory's IDs and mappings.
- [x] Add PR-only checks with read permissions and no deployment; run `npm test`, `npm run build`, and `npm run check:model-development`.
- [x] Inspect supported desktop/mobile browser behavior and no-JS initial content if reachable; explicitly record limits otherwise.
- [x] Obtain an independent whole-branch review; address important findings and verify fixes.
- [ ] Commit, push only the feature branch and open a draft PR with source, validation and editorial notes. Leave it unmerged.

## Execution record

Tasks 1–2 and local validation are complete. The whole-branch independent review of `8369cd6..e628228` approved draft-PR readiness without defects; live browser QA, real-training behavior and future lessons remain outside that verification. The final publication step is recorded by the resulting draft PR, and remains unchecked here until that external operation succeeds. No merge or deployment is authorized.

## Module 2: collectives and the choice of parallelism

Chosen after re-auditing the first slice: the memory lesson and ZeRO review both name communication as the next dependency, and the handbook (Volume 2, D2–D6) treats it as the main engineering priority.

- [x] Re-verify the first slice in this checkout (tests, build, output check) and run the live browser QA the handoff could not.
- [x] Fix the mobile overflow found by that QA: build-time table wrapping, with tests.
- [x] Verify every source against its primary page and version: ZeRO v3 §7, NCCL 2.32.3, Thakur et al. 2005, nccl-tests, PyTorch 2.15 DDP, Megatron-LM v5.
- [x] Write `src/lib/collectives.ts` test-first: ring costs, crossover, buckets, stage volumes, tensor-parallel bytes, bubble, ring trace, GPipe schedule, overlap bounds, formatting.
- [x] Build the ring stepper, communication planner and pipeline schedule with no-JS content and validated inputs.
- [x] Write the collectives lesson, the decision guide and the Megatron-LM review; compute every number with the tested library.
- [x] Add sources and claims; replace the single hard-coded module with `publishedUnits`; extend validation and the output check to every unit.
- [x] Run tests, build, output check and live desktop/mobile/keyboard/no-JS QA.
- [ ] Richard's editorial review; merge only on his authorization.
