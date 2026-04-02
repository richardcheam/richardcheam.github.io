---
layout: default
title: "XAI Vision Transfer"
permalink: /projects/xai-vision-transfer/
demo_url: ""
github_url: "https://github.com/richardcheam/xai-vision-transfer"
---

<div class="detail-shell" data-detail-tabs>
  <p data-reveal><a class="project-backlink" href="{{ '/projects/' | relative_url }}">Back to Projects</a></p>
  <p class="minimal-kicker" data-reveal>Computer Vision · April 2026</p>
  <p class="minimal-intro" data-reveal>Explainable and budget-aware transfer-learning study comparing CNN, ViT, and DHVT across CIFAR-10, EuroSAT, and Brain Tumor MRI.</p>

  <div class="detail-chips" aria-label="Project highlights" data-reveal>
    <span class="detail-chip detail-chip--role"><span class="detail-chip__label">Role:</span> <span class="detail-chip__value">ML / CV Research Engineer</span></span>
    <span class="detail-chip detail-chip--impact"><span class="detail-chip__label">Impact:</span> <span class="detail-chip__value">Checkpoint-first evaluation and XAI workflow</span></span>
    <span class="detail-chip detail-chip--stack"><span class="detail-chip__label">Stack:</span> <span class="detail-chip__value">PyTorch · CNN · ViT · DHVT · Grad-CAM</span></span>
  </div>

  <nav class="detail-nav" aria-label="Section navigation" data-reveal>
    <a href="#tldr" data-detail-trigger>TL;DR</a>
    <a href="#build" data-detail-trigger>Build</a>
    <a href="#results" data-detail-trigger>Results</a>
    <a href="#visuals" data-detail-trigger>Visuals</a>
    <a href="#links" data-detail-trigger>Links</a>
  </nav>

  <section id="tldr" class="detail-block" data-detail-panel>
    <h2>TL;DR</h2>
    <ul class="detail-list">
      <li><strong>Problem:</strong> Compare how CNNs, transformers, and hybrid transformers behave under limited data, domain shift, and explainability constraints.</li>
      <li><strong>Approach:</strong> Controlled CIFAR-10 source study with robustness and data-efficiency analysis, followed by transfer to EuroSAT and Brain Tumor MRI with scratch, linear-probe, and full-fine-tune settings.</li>
      <li><strong>Outcome:</strong> DHVT became the strongest clean CIFAR-10 model and the best Brain MRI transfer model, while ViT stayed the most texture-robust and linear probing was consistently weaker than full fine-tuning.</li>
    </ul>
  </section>

  <section id="build" class="detail-block" data-detail-panel hidden>
    <h2>What I Built</h2>
    <div class="project-points">
      <p><strong>Unified training pipeline:</strong> one configurable framework for CNN, ViT, and DHVT across source and downstream datasets.</p>
      <p><strong>Frugal-learning protocol:</strong> CIFAR-10 data-efficiency runs plus downstream comparison between scratch, frozen-backbone linear probing, and full fine-tuning.</p>
      <p><strong>Checkpoint-first evaluation:</strong> saved model weights, per-run histories, plot regeneration, and canonical result export through a master results table.</p>
      <p><strong>Explainability workflow:</strong> Grad-CAM for CNN, attention rollout for ViT, head-token influence for DHVT, confusion matrices, class diagnostics, and misclassification interpretability.</p>
    </div>
  </section>

  <section id="results" class="detail-block" data-detail-panel hidden>
    <h2>Results</h2>
    <div class="detail-metric-grid">
      <article class="detail-metric">
        <p class="detail-metric__label">Source stage</p>
        <h3>88.88%</h3>
        <p>DHVT clean CIFAR-10 accuracy, the strongest source-stage model in the study.</p>
      </article>
      <article class="detail-metric">
        <p class="detail-metric__label">EuroSAT</p>
        <h3>97.52%</h3>
        <p>Best downstream EuroSAT result with DHVT trained from scratch.</p>
      </article>
      <article class="detail-metric">
        <p class="detail-metric__label">Brain MRI</p>
        <h3>94.00%</h3>
        <p>Best downstream Brain Tumor MRI result with pretrained DHVT and full fine-tuning.</p>
      </article>
    </div>

    <div class="project-points" style="margin-top: 1rem;">
      <p><strong>Architecture comparison:</strong> DHVT was strongest on clean CIFAR-10, CNN remained competitive in the low-data regime, and vanilla ViT was the most robust to texture corruption.</p>
      <p><strong>Budget-aware transfer:</strong> linear probing reduced cost for transformer-style models, but the performance drop was too large to make it the preferred transfer strategy.</p>
      <p><strong>XAI insight:</strong> the explanation maps often showed that failures came from semantically plausible confusion rather than attention drifting to unrelated background.</p>
    </div>
  </section>

  <section id="visuals" class="detail-block" data-detail-panel hidden>
    <h2>Visuals</h2>
    <p>Selected report-ready panels from the experiment repository.</p>
    <p>
      <img src="{{ '/assets/projects/xai-vision-transfer/source_overview.png' | relative_url }}" alt="Source-stage overview panel" style="width:100%; border-radius: 18px; border: 1px solid #d6dce5; margin-top: 0.75rem;" />
    </p>
    <p>
      <img src="{{ '/assets/projects/xai-vision-transfer/downstream_dynamics.png' | relative_url }}" alt="Downstream learning dynamics panel" style="width:100%; border-radius: 18px; border: 1px solid #d6dce5;" />
    </p>
    <p>
      <img src="{{ '/assets/projects/xai-vision-transfer/downstream_interpretability_overview.png' | relative_url }}" alt="Downstream interpretability panel" style="width:100%; border-radius: 18px; border: 1px solid #d6dce5;" />
    </p>
  </section>

  <section id="links" class="detail-block" data-detail-panel hidden>
    <h2>Links</h2>
    <p class="project-links">
      <a class="btn btn--inverse" href="{{ page.github_url }}" target="_blank" rel="noopener noreferrer">GitHub</a>
      <a class="btn btn--primary" href="https://github.com/richardcheam/xai-vision-transfer/blob/main/report/report.pdf" target="_blank" rel="noopener noreferrer">Report</a>
    </p>
  </section>
</div>
