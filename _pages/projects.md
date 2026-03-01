---
layout: default
title: "Projects"
permalink: /projects/
---

<p class="minimal-intro">Selected projects with focused problem framing, build details, and outcomes.</p>

<section id="imdb-moe" class="minimal-project">
  <p class="minimal-kicker">NLP • March 2025</p>
  <h2>IMDb Sentiment with Mixture of Experts</h2>
  <div class="project-points">
    <p><strong>Problem:</strong> Compare strong transformer baselines while testing a more specialized routing architecture.</p>
    <p><strong>Build:</strong> End-to-end IMDb pipeline with DistilBERT, RoBERTa, DeBERTa, and custom MoE dynamic expert routing.</p>
    <p><strong>Result:</strong> Reproducible experimentation framework for scalable model comparison and selective expert activation.</p>
  </div>
  <p><strong>Stack:</strong> Hugging Face, PyTorch, MoE</p>
  <p class="project-links">
    <a class="btn btn--inverse" href="{{ '/projects/imdb-moe/' | relative_url }}">More info</a>
  </p>
</section>

<section id="mnist-ssl" class="minimal-project">
  <p class="minimal-kicker">Computer Vision • December 2024</p>
  <h2>SSL and Semi-Supervised Learning on MNIST</h2>
  <div class="project-points">
    <p><strong>Problem:</strong> Train high-quality models with extremely limited labels (only 100 labels over 60,000 images).</p>
    <p><strong>Build:</strong> CNN with pseudo-labeling and data augmentation, plus SimCLR representation learning pipeline.</p>
    <p><strong>Result:</strong> 97.18% (semi-supervised), 98.55% linear-probe with SimCLR, 98.44% with MLP head.</p>
  </div>
  <p><strong>Stack:</strong> PyTorch, CNN, SimCLR</p>
  <p class="project-links">
    <a class="btn btn--inverse" href="{{ '/projects/mnist-ssl/' | relative_url }}">More info</a>
  </p>
</section>
