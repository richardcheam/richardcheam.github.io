# Model-development learning hub: first vertical slice

## Intent and authorization

Extend the existing Astro portfolio into a source-grounded learning environment. The user's 9 November 2026 brief explicitly authorizes repository audit, curriculum design, implementation on an isolated branch, validation and a pull request. It prohibits production-branch pushes, merge and deployment. This design records implementation decisions made within that scope; public content remains subject to the PR's editorial review.

## Audit

Base: `8369cd62c698f358cbe77d0457a1afaf394ee773`, default branch `master`. The repository uses Astro, MDX, typed content collections, remark-math/rehype-katex, one shared SCSS stylesheet, and native Astro interactive figures with separate mathematical libraries. Blog and paper-review routes, feed and OG images derive from collections. The sitemap has a manually enumerated static route list. Foundations already cover backpropagation, optimizers, Transformers, regularization and attention; inference and benchmark posts provide further prerequisites. No test command exists at baseline. `pages.yml` deploys only on master pushes or explicit dispatch; leave it unchanged. No repository AGENTS.md was present.

## Approach and alternatives

Use the existing blog collection for concept/decision lessons, existing paper-reviews for reviews, and one static `/model-development/` hub backed by a small typed curriculum plus JSON source/claim records. Extend the existing series/navigation/sitemap. Reuse existing prerequisite URLs. A separate app would duplicate routing, styling and math. A new lesson collection/layout is unnecessary for one vertical slice and would split the established writing workflow. Browser progress tracking is deferred because it does not improve the first mathematical lesson enough to justify state and privacy semantics.

## First module

Topic: GPU training memory and ZeRO. Deliver one detailed concept/decision lesson, one ZeRO v3 paper review, and an interactive estimator separating persistent state from user-declared activation, workspace and materialization allowances. Explain a fixed illustrative mixed-precision Adam ledger: 2-byte weights, 2-byte gradients, a 4-byte master copy, and 8 bytes of moments. Derive all stage floors. Label estimates as estimates and make no measured-throughput or guaranteed-fit claim. Review the historical evaluation separately from current framework documentation; the original ZeRO-100B experiment is not an isolated Stage-3 benchmark.

## Content and UX

Map eight areas: architecture/scaling; data/tokenization; optimization; distributed systems; adaptation; post-training/RL; evaluation; serving. Each hub area offers real existing prerequisite links and a specific learning question. Only finished articles receive new routes. Add a dependency-aware start path and source reading list. Native details/summary questions reveal worked answers. Use the site's typography, spacing, neutral palette, borders and existing figure classes. Native controls must be labeled, keyboard accessible, responsive, and usable without relying on color. Initial server-rendered estimates and explanatory text remain available without JS. No backend, accounts, analytics or new runtime dependencies.

## Source discipline

Store verified source versions/dates, claim mappings, planned/completed work and review status under version control. Public prose distinguishes Reported, Derived, Hypothesis and Unknown; no claim of personal experimental reproduction. Research publication dates and educational-article dates remain separate. Source inventory covers immediate module sources and prioritized future readings; the earlier large handbook remains a research aid rather than material to bulk publish.

## Validation and completion

Add Node built-in tests for numerical functions, invalid inputs, unit conversion, sharding limits and allowances. Build with the lockfile unchanged. Check rendered links/anchors, math errors, content integration, generated OG/feed/sitemap and schema behavior. Add PR-only CI without deployment. Inspect desktop/mobile via the supported browser if reachable; record any verification limit. Publish the feature branch and open a draft PR with sources, claims, validation and editorial decisions. Do not merge or deploy.
