---
layout: default
title: "Enigmatica"
permalink: /projects/enigmatica/
demo_url: "https://richardcheam.github.io/enigmatica/"
github_url: "https://github.com/richardcheam/enigmatica"
---

<div class="detail-shell" data-detail-tabs>
  <p data-reveal><a class="project-backlink" href="{{ '/projects/' | relative_url }}">Back to Projects</a></p>
  <p class="minimal-kicker" data-reveal>Interactive Systems · April 2026</p>
  <p class="minimal-intro" data-reveal>Chapter-based cipher game that translates manga decoding mechanics into reusable Python architecture and a public playable web interface.</p>

  <div class="detail-chips" aria-label="Project highlights" data-reveal>
    <span class="detail-chip detail-chip--role"><span class="detail-chip__label">Role:</span> <span class="detail-chip__value">Python / Product Engineer</span></span>
    <span class="detail-chip detail-chip--impact"><span class="detail-chip__label">Impact:</span> <span class="detail-chip__value">Public playable cipher chapter pipeline</span></span>
    <span class="detail-chip detail-chip--stack"><span class="detail-chip__label">Stack:</span> <span class="detail-chip__value">Python · Static Web · GitHub Pages · Puzzle Design</span></span>
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
      <li><strong>Problem:</strong> Turn manga-style decoding challenges into a game without losing the reusable cipher logic underneath.</li>
      <li><strong>Approach:</strong> Python-first chapter architecture for ciphers, chapter demos, docs/assets, and a static export pipeline for a public web interface.</li>
      <li><strong>Outcome:</strong> Public Chapter 1 release with sequential puzzles, hints, progress tracking, and a clean foundation for many future chapters.</li>
    </ul>
  </section>

  <section id="build" class="detail-block" data-detail-panel hidden>
    <h2>What I Built</h2>
    <div class="project-points">
      <p><strong>Reusable mechanics layer:</strong> separated cipher and extraction logic from chapter-specific puzzle scripting so each new chapter can build on the same core modules.</p>
      <p><strong>Chapter pipeline:</strong> each chapter owns its own playable sequence, notes, and assets, which keeps manga analysis and game implementation aligned.</p>
      <p><strong>Static web delivery:</strong> exported Python chapter data into JSON, then rendered it through a dedicated landing page and one-puzzle-at-a-time play interface.</p>
      <p><strong>Deployment workflow:</strong> GitHub Pages automation rebuilds the public project site from the repo whenever the chapter content changes.</p>
    </div>
  </section>

  <section id="results" class="detail-block" data-detail-panel hidden>
    <h2>Results</h2>
    <div class="detail-metric-grid">
      <article class="detail-metric">
        <p class="detail-metric__label">Release</p>
        <h3>Public Demo</h3>
        <p>Chapter 1 is live as a playable GitHub Pages experience rather than just a code repository.</p>
      </article>
      <article class="detail-metric">
        <p class="detail-metric__label">Playable Scope</p>
        <h3>3 Puzzles</h3>
        <p>Index extraction, grid extraction, and a guided Hill-cipher step are already sequenced into the first chapter.</p>
      </article>
      <article class="detail-metric">
        <p class="detail-metric__label">Scalability</p>
        <h3>Chapter Pipeline</h3>
        <p>New manga chapters can flow into the same Python, docs, assets, export, and web-delivery path.</p>
      </article>
    </div>

    <div class="project-points" style="margin-top: 1rem;">
      <p><strong>Player-facing design:</strong> the public build separates a clean landing page from an interactive play page so the project reads like a real product instead of a raw prototype.</p>
      <p><strong>Engineering direction:</strong> the same chapter data currently powers CLI demos, local docs, and the deployed web interface, which keeps the project maintainable as the manga progresses.</p>
    </div>
  </section>

  <section id="visuals" class="detail-block" data-detail-panel hidden>
    <h2>Visuals</h2>
    <p>Current public-build cover artwork used for the project presentation.</p>
    <p>
      <img src="{{ '/assets/projects/enigmatica/cover.png' | relative_url }}" alt="Enigmatica project cover" style="width:100%; border-radius: 18px; border: 1px solid #d6dce5; margin-top: 0.75rem;" />
    </p>
  </section>

  <section id="links" class="detail-block" data-detail-panel hidden>
    <h2>Links</h2>
    <p class="project-links">
      <a class="btn btn--primary" href="{{ page.demo_url }}" target="_blank" rel="noopener noreferrer">Live Demo</a>
      <a class="btn btn--inverse" href="{{ page.github_url }}" target="_blank" rel="noopener noreferrer">GitHub</a>
    </p>
  </section>
</div>
