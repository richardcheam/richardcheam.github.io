// Blog series double as the blog's topics: the Blog menu and the series filter
// list them in this order. `topic` is the short name used in navigation.
export const series: { key: string; title: string; topic: string; next?: string }[] = [
  {
    key: "speech-ai",
    title: "Speech generation from the inside",
    topic: "Speech AI",
  },
  {
    key: "dual-gh200",
    title: "Running large language models on dual GH200",
    topic: "LLM inference",
  },
  {
    key: "representation-collapse",
    title: "Diagnosing representation collapse",
    topic: "Representation learning",
  },
  {
    key: "foundations",
    title: "Foundations",
    topic: "Foundations",
  },
  // Model development, in four parts read in order: `next` names the part
  // that continues it, so the last post of one part links to the first of the next.
  {
    key: "pretraining",
    title: "Model development I: Pre-training",
    topic: "Pre-training",
    next: "training-at-scale",
  },
  {
    key: "training-at-scale",
    title: "Model development II: Training at scale",
    topic: "Training at scale",
    next: "post-training",
  },
  {
    key: "post-training",
    title: "Model development III: Post-training",
    topic: "Post-training",
    next: "llm-applications",
  },
  {
    key: "llm-applications",
    title: "Model development IV: Building with language models",
    topic: "LLM applications",
  },
];
