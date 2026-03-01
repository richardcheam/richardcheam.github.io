---
title: "MoE Model Comparison Notes"
date: 2026-01-14
category: "NLP"
excerpt: "Practical criteria for comparing Mixture-of-Experts models with dense baselines."
---

## Comparison Criteria

- Keep tokenization and data splits identical across all runs.
- Separate quality metrics from efficiency metrics.
- Report training cost and inference cost independently.

## MoE-Specific Checks

- Monitor expert load balancing over time.
- Detect expert collapse early (few experts dominating routing).
- Stress test with domain-shifted samples.

## Reporting Template

- Accuracy/F1 and calibration.
- Throughput and latency.
- Memory footprint.
- Failure modes and examples.
