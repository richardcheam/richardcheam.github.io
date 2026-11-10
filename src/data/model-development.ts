export interface LearningLink { title: string; href: string }
export interface LearningModule {
  id: string;
  title: string;
  question: string;
  objective: string;
  dependsOn: string[];
  foundations: LearningLink[];
  sourceIds: string[];
}

// Only real published prerequisite routes appear here. Planned advanced topics
// are questions, not empty pages. Advanced lessons are added after review.
export const modelDevelopmentModules: LearningModule[] = [
  { id: 'architecture', title: 'Architecture and scaling', question: 'How should capacity and training tokens share a fixed compute budget?', objective: 'Compare dense and sparse capacity, attention memory, and conditional scaling predictions.', dependsOn: ['optimization'], foundations: [{ title: 'Inside a Transformer', href: '/blog/foundations-transformer/' }, { title: 'Attention', href: '/blog/foundations-attention/' }], sourceIds: ['chinchilla', 'llama3', 'deepseek-v3', 'gqa', 'glu-variants', 'besiroglu-2024', 'sardana-2024'] },
  { id: 'data', title: 'Data engineering and tokenization', question: 'Which text should become the next training token?', objective: 'Reason about coverage, normalization, deduplication, leakage and comparable tokenization budgets.', dependsOn: ['evaluation'], foundations: [{ title: 'Language-model foundations', href: '/blog/foundations-language-models/' }, { title: 'Khmer script and tokenization', href: '/blog/khmer-script-for-tts/' }], sourceIds: ['sentencepiece', 'fineweb', 'dclm', 'datatrove-0.10.1', 'broder-1997', 'muennighoff-2023', 'cs336-2026', 'unimax', 'petrov-2023', 'kudo-2018', 'llama1', 'xlmr', 'flores-200', 'hf-tokenizers-measured', 'tinyshakespeare'] },
  { id: 'optimization', title: 'Pre-training and optimization', question: 'What makes a numerically correct update useful at scale?', objective: 'Connect optimizer state, loss weighting, batch semantics, initialization and schedules.', dependsOn: ['evaluation'], foundations: [{ title: 'Losses and gradient descent', href: '/blog/foundations-loss-gradient-descent/' }, { title: 'Optimizers and schedules', href: '/blog/foundations-optimisers/' }], sourceIds: ['chinchilla', 'llama3', 'transformers-4.51.3-loss', 'pytorch-2.6-optim', 'adamw-paper', 'nanogpt'] },
  { id: 'systems', title: 'Distributed training systems', question: 'What must each accelerator store, compute and communicate?', objective: 'Execute the single-device update across many devices without changing its meaning: batch semantics, sharded state, tensor and pipeline parallelism, communication and recovery.', dependsOn: ['optimization', 'architecture'], foundations: [{ title: 'Backpropagation', href: '/blog/foundations-neurons-backprop/' }, { title: 'Optimizers and schedules', href: '/blog/foundations-optimisers/' }], sourceIds: ['zero', 'zero-guide', 'zero-config', 'fsdp2', 'activation-recomputation', 'nccl-collectives', 'thakur-2005', 'megatron-2021', 'fsdp2-tutorial', 'nccl-tests-performance', 'pytorch-ddp', 'ptd-2020', 'megatron-2019', 'ring-attention', 'flashattention', 'mixed-precision', 'young-1974'] },
  { id: 'adaptation', title: 'Mid-training and adaptation', question: 'When should we continue a checkpoint, fine-tune it or retrain?', objective: 'Separate knowledge acquisition, format teaching and retention under a distribution shift.', dependsOn: ['data', 'optimization'], foundations: [{ title: 'Language models', href: '/blog/foundations-language-models/' }, { title: 'Regularization', href: '/blog/foundations-regularisation/' }], sourceIds: ['llama3', 'deepseek-v3'] },
  { id: 'posttraining', title: 'Post-training and reinforcement learning', question: 'Which feedback signal can identify the behavior we actually want?', objective: 'Distinguish demonstration learning, offline preferences, online exploration and verifier integrity.', dependsOn: ['adaptation', 'evaluation'], foundations: [{ title: 'Likelihood and language models', href: '/blog/foundations-language-models/' }, { title: 'Optimization foundations', href: '/blog/foundations-optimisers/' }], sourceIds: ['dpo', 'deepseek-r1'] },
  { id: 'evaluation', title: 'Evaluation and scientific reliability', question: 'Does an improved metric support the intended claim?', objective: 'Define comparison units, credible baselines, uncertainty, leakage checks and regression boundaries.', dependsOn: [], foundations: [{ title: 'Benchmark denominators', href: '/blog/benchmark-denominators/' }, { title: 'Speech-evaluation metrics', href: '/blog/speech-evaluation-metrics/' }], sourceIds: ['evaluation-statistics', 'dclm'] },
  { id: 'inference', title: 'Inference and deployment', question: 'Which training choice delivers useful work within the serving budget?', objective: 'Separate cache residency, prefill, decode, latency, throughput and workload-specific cost.', dependsOn: ['architecture', 'systems'], foundations: [{ title: 'Inference workload lifecycle', href: '/blog/inference-workload-lifecycle/' }, { title: 'Throughput versus usable latency', href: '/blog/throughput-versus-usable-latency/' }], sourceIds: ['deepseek-v3', 'llama3'] },
];

export type UnitKind = 'lesson' | 'guide' | 'review';

/** A published page in the field guide. Only finished, reviewed-for-accuracy
 * pages are listed; planned topics stay questions in the curriculum above. */
export interface LearningUnit {
  module: string;
  kind: UnitKind;
  title: string;
  href: string;
  /** What the reader does on the page, in one line. */
  task: string;
}

export const unitKindLabel: Record<UnitKind, string> = { lesson: 'Concept lesson', guide: 'Decision guide', review: 'Paper review' };

/** Published units in reading order. */
export const publishedUnits: LearningUnit[] = [
  { module: 'optimization', kind: 'lesson', title: 'One training update: from tokens to an AdamW step', href: '/blog/model-development-one-update/', task: 'Trace real tokens through targets, masks, loss normalization, gradients, clipping and one AdamW step.' },
  { module: 'data', kind: 'lesson', title: 'Building a pre-training corpus: from a web crawl to training text', href: '/blog/model-development-pretraining-corpus/', task: 'Follow a crawl through each processing stage and judge each one at a fixed training budget.' },
  { module: 'data', kind: 'review', title: 'FineWeb: what each stage of a web-data pipeline is worth', href: '/paper-reviews/fineweb/', task: 'Weigh each pipeline choice against the ablation that justifies it.' },
  { module: 'systems', kind: 'review', title: 'ZeRO: what sharding removes, and what it leaves live', href: '/paper-reviews/zero/', task: 'Separate the memory argument from the experiments offered for it.' },
  { module: 'systems', kind: 'review', title: 'Megatron-LM: what the parallelism comparisons control', href: '/paper-reviews/megatron-ptd-p/', task: 'Weigh the layout rules against their hardware and controls.' },
  { module: 'data', kind: 'lesson', title: 'Data mixtures and repetition: deciding how often the model sees each source', href: '/blog/model-development-data-mixtures/', task: 'Turn sampling weights into passes per source and compare proportional, temperature and capped sampling.' },
  { module: 'data', kind: 'lesson', title: 'Tokenization: what a tokenizer decides before training starts', href: '/blog/model-development-tokenization/', task: 'Measure what the same text costs in tokens across languages and tokenizers.' },
  { module: 'architecture', kind: 'lesson', title: 'The decoder architecture: the choices that matter and what they cost', href: '/blog/model-development-decoder-architecture/', task: 'Count where parameters go and size the KV cache for a modern decoder.' },
  { module: 'optimization', kind: 'lesson', title: 'A complete small training run: from raw text to a checkpoint you can trust', href: '/blog/model-development-small-training-run/', task: 'Train a 1M-parameter model end to end and diagnose five real runs.' },
  { module: 'architecture', kind: 'lesson', title: 'Scaling laws: spending a compute budget on parameters and tokens', href: '/blog/model-development-scaling-laws/', task: 'Split a compute budget between parameters and tokens, then add serving cost.' },
  { module: 'architecture', kind: 'review', title: 'Chinchilla: how much data a model should see', href: '/paper-reviews/chinchilla/', task: 'Separate the robust equal-scaling result from the mis-estimated parametric fit.' },
  { module: 'systems', kind: 'lesson', title: 'GPU memory and compute: what training stores, computes and waits for', href: '/blog/model-development-gpu-memory-compute/', task: 'Account for memory and time, and classify operations by arithmetic intensity.' },
  { module: 'systems', kind: 'lesson', title: 'Data parallelism: one update computed on many GPUs', href: '/blog/model-development-data-parallelism/', task: 'Keep the token-mean objective when gradients are averaged across GPUs.' },
  { module: 'systems', kind: 'lesson', title: 'Sharding and recomputation: making a model fit', href: '/blog/model-development-sharding-recomputation/', task: 'Compute per-GPU state for each ZeRO stage and weigh recomputation.' },
  { module: 'systems', kind: 'lesson', title: 'Model parallelism: splitting layers, sequences and experts across GPUs', href: '/blog/model-development-model-parallelism/', task: 'Split an MLP exactly across GPUs and size a pipeline bubble.' },
  { module: 'systems', kind: 'lesson', title: 'Efficient execution: IO-aware attention, mixed precision and FP8', href: '/blog/model-development-efficient-execution/', task: 'Compute attention in blocks with an online softmax and choose number formats.' },
  { module: 'systems', kind: 'review', title: 'FlashAttention: exact attention made fast by counting memory traffic', href: '/paper-reviews/flashattention/', task: 'Weigh the IO analysis against baseline-dependent speedups.' },
  { module: 'systems', kind: 'lesson', title: 'Running at scale: throughput, failures and choosing a layout', href: '/blog/model-development-running-at-scale/', task: 'Measure MFU, plan checkpoints around failures and lay out a 70B model.' },
];
