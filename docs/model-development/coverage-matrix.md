# Model development: coverage matrix

Status date: 9 November 2026. One row per curriculum area, in the order of `src/data/model-development.ts`. **Published** means a finished page listed in `publishedUnits`; everything else is planned and has no route. Do not add a route, a navigation link or a hub entry for a planned item until its page is complete and checked.

Status columns: **Implementation** (page and figures exist), **Validation** (tests, build, `check:model-development`, live browser QA), **Editorial** (Richard's review of wording and emphasis). Source IDs refer to `src/data/model-development/sources.json`; "verified" means the cited section was opened and checked on the status date.

## Distributed training systems: two modules published

| | Memory module | Collectives module |
|---|---|---|
| Research question | What must each GPU store, and which saving addresses the actual bottleneck? | What does each GPU have to send, and when does that decide the step time? |
| Prerequisites | Backpropagation, Adam (foundations (`/blog/foundations-optimisers/`)) | The memory module; the Transformer's layers |
| Concept lesson | Published: `/blog/model-development-training-memory/` | Published: `/blog/model-development-collectives/` |
| Decision guide | (inside the lesson's last sections) | Published: `/blog/model-development-choosing-parallelism/` |
| Paper review | Published: `/paper-reviews/zero/` | Published: `/paper-reviews/megatron-ptd-p/` |
| Verified sources | `zero` (v3), `zero-config`, `fsdp2`, `fsdp2-tutorial`, `activation-recomputation` | `nccl-collectives` (2.32.3), `thakur-2005`, `nccl-tests-performance`, `pytorch-ddp` (2.15), `zero` (§7), `megatron-2021` (v5) |
| Interactive | Training-memory estimator | Ring all-reduce stepper, communication planner, pipeline schedule |
| Experiment | Proposed, capped synthetic memory measurement | Proposed nccl-tests link fit and DDP bucket-size overlap test |
| Implementation | Done | Done |
| Validation | Unit tests, build, output check, live desktop/mobile/keyboard/no-JS QA on 9 Nov 2026 | Same, on 9 Nov 2026 |
| Editorial | Pending | Pending |

Planned next in this area, no routes yet: activation memory and recomputation (Korthikanti et al. 2022 is already in the inventory); expert parallelism and all-to-all traffic; checkpointing and recovery (PyTorch Distributed Checkpoint).

## Areas with prerequisite reading only

| Area | Research question | Prerequisites (published) | Planned lesson or guide | Related review | Sources to verify | Interactive idea | Status |
|---|---|---|---|---|---|---|---|
| Evaluation and scientific reliability | Does an improved metric support the intended claim? | Benchmark denominators (`/blog/benchmark-denominators/`), speech evaluation (`/blog/speech-evaluation-metrics/`) | Paired comparisons and error bars for model evaluations | Adding Error Bars to Evals | `evaluation-statistics` | Paired-difference confidence interval calculator | Not started |
| Pre-training and optimization | What makes a numerically correct update useful at scale? | Losses (`/blog/foundations-loss-gradient-descent/`), optimisers (`/blog/foundations-optimisers/`) | Compute-optimal allocation of parameters and tokens | Chinchilla | `chinchilla`, `llama3` | Isoflop curve explorer from published fits | Not started |
| Architecture and scaling | How should capacity and training tokens share a fixed compute budget? | Transformer (`/blog/foundations-transformer/`), attention (`/blog/foundations-attention/`) | Dense versus mixture-of-experts capacity, and attention memory | DeepSeek-V3 | `chinchilla`, `llama3`, `deepseek-v3` | Active versus total parameter and KV-cache calculator | Not started |
| Data engineering and tokenization | Which text should become the next training token? | Language models (`/blog/foundations-language-models/`), Khmer script (`/blog/khmer-script-for-tts/`) | Tokenizer choice as a measurement and cost decision | SentencePiece or FineWeb | `sentencepiece`, `fineweb`, `dclm` | Tokens-per-character comparison across scripts | Not started |
| Mid-training and adaptation | When should we continue a checkpoint, fine-tune it or retrain? | Language models (`/blog/foundations-language-models/`), regularisation (`/blog/foundations-regularisation/`) | Continued pre-training: adaptation against retention | Llama 3 or DeepSeek phase reports | `llama3`, `deepseek-v3`; continuation sources to add | Learning-rate rewarming schedule sketch | Not started |
| Post-training and reinforcement learning | Which feedback signal identifies the behaviour we want? | Language models (`/blog/foundations-language-models/`), optimisers (`/blog/foundations-optimisers/`) | SFT, DPO and online RL: what each signal can identify | DPO | `dpo`, `deepseek-r1` | DPO loss and implicit-reward explorer | Not started |
| Inference and deployment | Which training choice delivers useful work within the serving budget? | Inference lifecycle (`/blog/inference-workload-lifecycle/`), throughput versus latency (`/blog/throughput-versus-usable-latency/`) | Prefill, decode and KV-cache budgets | PagedAttention | `deepseek-v3`, `llama3`; serving sources to add | KV-cache memory and batch-size calculator | Not started |

## Recommended order

1. **Evaluation and scientific reliability.** Every later module compares numbers; paired comparisons and uncertainty should come first. It is the handbook's first priority and has the strongest existing prerequisites on this site.
2. **Pre-training and optimization**, compute-optimal allocation, which reuses the memory and communication ledgers.
3. Activation memory, completing the systems area.

## Known issues outside these modules

Found by the 375 px overflow sweep on 9 Nov 2026 and left for a separate change: an inline formula in `/blog/foundations-recurrent-networks/`, an unbreakable code span in `/blog/khmer-script-for-tts/` and the contents rail on `/projects/xai-vision-transfer/` each widen the page on narrow screens.
