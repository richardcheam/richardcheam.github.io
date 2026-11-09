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
  { id: 'architecture', title: 'Architecture and scaling', question: 'How should capacity and training tokens share a fixed compute budget?', objective: 'Compare dense and sparse capacity, attention memory, and conditional scaling predictions.', dependsOn: ['optimization'], foundations: [{ title: 'Inside a Transformer', href: '/blog/foundations-transformer/' }, { title: 'Attention', href: '/blog/foundations-attention/' }], sourceIds: ['chinchilla', 'llama3', 'deepseek-v3'] },
  { id: 'data', title: 'Data engineering and tokenization', question: 'Which text should become the next training token?', objective: 'Reason about coverage, normalization, deduplication, leakage and comparable tokenization budgets.', dependsOn: ['evaluation'], foundations: [{ title: 'Language-model foundations', href: '/blog/foundations-language-models/' }, { title: 'Khmer script and tokenization', href: '/blog/khmer-script-for-tts/' }], sourceIds: ['sentencepiece', 'fineweb', 'dclm'] },
  { id: 'optimization', title: 'Pre-training and optimization', question: 'What makes a numerically correct update useful at scale?', objective: 'Connect optimizer state, loss weighting, batch semantics, initialization and schedules.', dependsOn: ['evaluation'], foundations: [{ title: 'Losses and gradient descent', href: '/blog/foundations-loss-gradient-descent/' }, { title: 'Optimizers and schedules', href: '/blog/foundations-optimisers/' }], sourceIds: ['chinchilla', 'llama3'] },
  { id: 'systems', title: 'Distributed training systems', question: 'What must each accelerator store, compute and communicate?', objective: 'Derive a training-memory ledger and distinguish persistent state from the live execution peak.', dependsOn: ['optimization', 'architecture'], foundations: [{ title: 'Backpropagation', href: '/blog/foundations-neurons-backprop/' }, { title: 'Optimizers and schedules', href: '/blog/foundations-optimisers/' }], sourceIds: ['zero', 'zero-config', 'fsdp2', 'activation-recomputation'] },
  { id: 'adaptation', title: 'Mid-training and adaptation', question: 'When should we continue a checkpoint, fine-tune it or retrain?', objective: 'Separate knowledge acquisition, format teaching and retention under a distribution shift.', dependsOn: ['data', 'optimization'], foundations: [{ title: 'Language models', href: '/blog/foundations-language-models/' }, { title: 'Regularization', href: '/blog/foundations-regularisation/' }], sourceIds: ['llama3', 'deepseek-v3'] },
  { id: 'posttraining', title: 'Post-training and reinforcement learning', question: 'Which feedback signal can identify the behavior we actually want?', objective: 'Distinguish demonstration learning, offline preferences, online exploration and verifier integrity.', dependsOn: ['adaptation', 'evaluation'], foundations: [{ title: 'Likelihood and language models', href: '/blog/foundations-language-models/' }, { title: 'Optimization foundations', href: '/blog/foundations-optimisers/' }], sourceIds: ['dpo', 'deepseek-r1'] },
  { id: 'evaluation', title: 'Evaluation and scientific reliability', question: 'Does an improved metric support the intended claim?', objective: 'Define comparison units, credible baselines, uncertainty, leakage checks and regression boundaries.', dependsOn: [], foundations: [{ title: 'Benchmark denominators', href: '/blog/benchmark-denominators/' }, { title: 'Speech-evaluation metrics', href: '/blog/speech-evaluation-metrics/' }], sourceIds: ['evaluation-statistics', 'dclm'] },
  { id: 'inference', title: 'Inference and deployment', question: 'Which training choice delivers useful work within the serving budget?', objective: 'Separate cache residency, prefill, decode, latency, throughput and workload-specific cost.', dependsOn: ['architecture', 'systems'], foundations: [{ title: 'Inference workload lifecycle', href: '/blog/inference-workload-lifecycle/' }, { title: 'Throughput versus usable latency', href: '/blog/throughput-versus-usable-latency/' }], sourceIds: ['deepseek-v3', 'llama3'] },
];

export const firstModule = {
  lesson: { title: 'Training memory: from an Adam ledger to ZeRO', href: '/blog/model-development-training-memory/' },
  review: { title: 'ZeRO: what sharding removes, and what it leaves live', href: '/paper-reviews/zero/' },
};
