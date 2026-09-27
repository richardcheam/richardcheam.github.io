---
layout: default
title: "Embedding Diagnostics"
permalink: /projects/embedding-diagnostics/
demo_url: ""
github_url: "https://github.com/richardcheam/embedding-diagnostics"
findings_url: "https://github.com/richardcheam/embedding-diagnostics/blob/main/docs/STATUS.md"
---

<div class="detail-shell" data-detail-tabs>
  <p data-reveal><a class="project-backlink" href="{{ '/projects/' | relative_url }}">Back to Projects</a></p>
  <p class="minimal-kicker" data-reveal>Self-Supervised Learning · August 2026</p>
  <p class="minimal-intro" data-reveal>A controlled study of which label-free diagnostics can tell that a self-supervised embedding has degenerated, first on CIFAR-10 and then on BDD100K driving scenarios, where the downstream task is scenario retrieval.</p>

  <div class="detail-chips" aria-label="Project highlights" data-reveal>
    <span class="detail-chip detail-chip--role"><span class="detail-chip__label">Role:</span> <span class="detail-chip__value">ML Research Engineer</span></span>
    <span class="detail-chip detail-chip--impact"><span class="detail-chip__label">Impact:</span> <span class="detail-chip__value">Geometric collapse shown to be separable from information loss</span></span>
    <span class="detail-chip detail-chip--stack"><span class="detail-chip__label">Stack:</span> <span class="detail-chip__value">PyTorch · masked JEPA · SIGReg · BDD100K</span></span>
  </div>

  <nav class="detail-nav" aria-label="Section navigation" data-reveal>
    <a href="#tldr" data-detail-trigger>TL;DR</a>
    <a href="#build" data-detail-trigger>Build</a>
    <a href="#results" data-detail-trigger>Results</a>
    <a href="#links" data-detail-trigger>Links</a>
  </nav>

  <section id="tldr" class="detail-block" data-detail-panel>
    <h2>TL;DR</h2>
    <ul class="detail-list">
      <li><strong>Problem:</strong> Scenario mining embeds huge numbers of unlabelled driving clips, and there are no labels to check whether the embedding has gone wrong. Which label-free diagnostics can you trust?</li>
      <li><strong>Approach:</strong> Manufacture known degeneration in masked JEPA training, using stop-gradient, EMA, SIGReg and a projector as controlled interventions: 7 conditions × 5 paired seeds, on CIFAR-10 and then on BDD100K, with endpoints and the claim rule fixed in advance.</li>
      <li><strong>Outcome:</strong> An encoder that every geometric measure calls destroyed stays nearly as linearly decodable as one that genuinely trained, while retrieval, the task scenario mining depends on, clearly degrades.</li>
    </ul>
  </section>

  <section id="build" class="detail-block" data-detail-panel hidden>
    <h2>What I Built</h2>
    <div class="project-points">
      <p><strong>Controlled degradation bench:</strong> seven training conditions, including a control with no collapse prevention that is built to fail, run over five paired seeds on CIFAR-10 (Phase A) and BDD100K driving scenarios (Phase B).</p>
      <p><strong>Diagnostics under test:</strong> total variance, mean pairwise cosine, RankMe, participation ratio, linear probes and retrieval precision, each documented with its formula, a worked example and its blind spot.</p>
      <p><strong>Validated components:</strong> the SIGReg loss matches the reference implementation bit for bit, and that validation found a real bug in the first version. The rest of the system (masked latent prediction, a project-specific projector) is not a LeJEPA reproduction.</p>
      <p><strong>Minimal sufficient panel:</strong> an exhaustive search over subsets found that no single label-free diagnostic covers every collapse mode, but total variance plus RankMe does, with zero misclassifications across all 14 condition-dataset pairs.</p>
      <p><strong>Reproducible runs:</strong> environment checks before training, crash recovery that reruns only unfinished jobs, one locked CUDA 12.8 environment across x86 and Grace Hopper machines, and CI that runs lint, 300+ tests and the panel validation.</p>
    </div>
  </section>

  <section id="results" class="detail-block" data-detail-panel hidden>
    <h2>Results</h2>
    <div class="detail-metric-grid">
      <article class="detail-metric">
        <p class="detail-metric__label">Decodability survives</p>
        <h3>0.914 vs 0.927</h3>
        <p>Time-of-day probe accuracy, contracted control vs healthy encoder (majority floor 0.483), although the control's total variance is 0.0001 against 107.71.</p>
      </article>
      <article class="detail-metric">
        <p class="detail-metric__label">Retrieval degrades</p>
        <h3>0.566 vs 0.675</h3>
        <p>Retrieval P@10 for the same two encoders (chance 0.429); unlike the probe gap, this one clears the across-seed noise.</p>
      </article>
      <article class="detail-metric">
        <p class="detail-metric__label">Effective rank inverts</p>
        <h3>25.45 vs 10.99</h3>
        <p>Participation ratio rates the contracted encoder as higher-dimensional than the healthy one; RankMe gets it right (1.06 vs 78.36).</p>
      </article>
    </div>

    <div class="project-points" style="margin-top: 1rem;">
      <p><strong>What I withdrew:</strong> an earlier headline claimed the standard probe was blind to collapse. It was wrong: the unstandardized probe's optimiser stopped before fitting on very small features. Re-measuring Phase B from saved encoders moved the control's score from 0.4832 to 0.9137 and refuted the claim, and the write-up says so.</p>
      <p><strong>Scope:</strong> all figures above are Phase B (BDD100K), 7 conditions × 5 paired seeds. Phase A probe numbers are not quoted because they have not been re-measured. SIGReg is paired here with masked latent prediction, so none of this is evidence about LeJEPA's own claims.</p>
    </div>
  </section>

  <section id="links" class="detail-block" data-detail-panel hidden>
    <h2>Links</h2>
    <p class="project-links">
      <a class="btn btn--primary" href="{{ page.findings_url }}" target="_blank" rel="noopener noreferrer">Findings</a>
      <a class="btn btn--inverse" href="{{ page.github_url }}" target="_blank" rel="noopener noreferrer">GitHub</a>
    </p>
  </section>
</div>
