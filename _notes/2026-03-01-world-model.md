---
title: "World Model"
date: 2026-03-01
category: "world-models"
excerpt: "Working notes on latent dynamics, planning, and model-based control."
---

## Comparison Criteria

- Keep data splits and evaluation protocol identical.
- Separate modeling quality from planning performance.
- Track compute budget and inference-time constraints.

## Checks

- Evaluate under shift, not only in-distribution.
- Measure compounding error over rollout horizon.
- Document failure trajectories, not only averages.
