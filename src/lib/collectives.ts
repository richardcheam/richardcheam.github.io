/** Communication arithmetic for the model-development collectives lesson and
 * the parallelism decision guide. These are idealized cost models, not
 * measurements: the α–β ring model of Thakur, Rabenseifner and Gropp (2005),
 * the ZeRO v3 §7 volume accounting, Megatron-LM's (2021) tensor-parallel
 * all-reduce count and pipeline bubble. Units: bytes, seconds, bytes/second.
 */

export type Collective = 'all-reduce' | 'all-gather' | 'reduce-scatter';

export interface LinkModel {
  /** Ranks taking part in the collective (an integer ≥ 1). */
  ranks: number;
  /** Per-message latency α, in seconds. */
  alpha: number;
  /** Effective per-rank bandwidth B, in bytes per second. */
  bandwidth: number;
}

export interface RingCost {
  steps: number;
  latency: number;
  bandwidthTerm: number;
  total: number;
  /** Bytes each rank sends over the whole collective. */
  bytesSentPerRank: number;
}

function check(cond: boolean, message: string): void {
  if (!cond) throw new RangeError(message);
}
const finiteNonnegative = (v: number) => Number.isFinite(v) && v >= 0;

function checkLink({ ranks, alpha, bandwidth }: LinkModel): void {
  check(Number.isSafeInteger(ranks) && ranks >= 1, 'Ranks must be a whole number of at least 1.');
  check(finiteNonnegative(alpha), 'Latency must be finite and nonnegative.');
  check(Number.isFinite(bandwidth) && bandwidth > 0, 'Bandwidth must be finite and positive.');
}

/**
 * Ring cost of one collective on a buffer of `bytes` total (the full tensor,
 * as in nccl-tests' S): all-gather and reduce-scatter take p − 1 steps of
 * n/p bytes each; all-reduce is a reduce-scatter followed by an all-gather.
 * Reduction arithmetic (γ) is ignored.
 */
export function ringCollective(kind: Collective, input: LinkModel & { bytes: number }): RingCost {
  checkLink(input);
  check(finiteNonnegative(input.bytes), 'Bytes must be finite and nonnegative.');
  const { ranks: p, alpha, bandwidth, bytes } = input;
  const phases = kind === 'all-reduce' ? 2 : 1;
  const steps = phases * (p - 1);
  const bytesSentPerRank = phases * ((p - 1) / p) * bytes;
  const latency = steps * alpha;
  const bandwidthTerm = bytesSentPerRank / bandwidth;
  return { steps, latency, bandwidthTerm, total: latency + bandwidthTerm, bytesSentPerRank };
}

/** Message size at which a ring all-gather's latency and bandwidth terms are
 * equal: (p − 1)α = (p − 1)/p · n/B gives n = p·α·B. */
export function crossoverBytes(link: LinkModel): number {
  checkLink(link);
  return link.ranks * link.alpha * link.bandwidth;
}

/** Gradients reduced as ⌈bytes / bucket⌉ separate ring all-reduces. Only the
 * latency term depends on the bucket count; the bandwidth term does not. */
export function bucketedAllReduce(input: LinkModel & { bytes: number; bucketBytes: number }) {
  check(Number.isFinite(input.bucketBytes) && input.bucketBytes > 0, 'Bucket size must be finite and positive.');
  const whole = ringCollective('all-reduce', input);
  const buckets = input.bytes === 0 ? 0 : Math.ceil(input.bytes / input.bucketBytes);
  const latency = buckets * whole.steps * input.alpha;
  return { buckets, latency, bandwidthTerm: whole.bandwidthTerm, total: latency + whole.bandwidthTerm };
}

export type ZeroStage = 0 | 1 | 2 | 3;

/**
 * Per-step communication volume of data parallelism with ZeRO, in elements of
 * the communicated tensors, following ZeRO v3 §7: Ψ = parameter count.
 * Stages 0–2 move 2Ψ; stage 3 adds a parameter all-gather, 3Ψ in total.
 * The paper's Ψ per collective approximates the ring's (p − 1)/p · Ψ.
 */
export function zeroStepVolume(stage: ZeroStage, parameters: number) {
  check([0, 1, 2, 3].includes(stage), 'Stage must be 0, 1, 2 or 3.');
  check(finiteNonnegative(parameters), 'Parameters must be finite and nonnegative.');
  // perMicrobatch: whether the collective repeats for every microbatch under
  // gradient accumulation, in the illustrative schedule described below.
  const collectives: { kind: Collective; what: string; elements: number; perMicrobatch: boolean }[] =
    stage === 0 ? [{ kind: 'all-reduce', what: 'gradients', elements: 2 * parameters, perMicrobatch: false }]
    : stage === 3 ? [
      { kind: 'all-gather', what: 'parameters for forward', elements: parameters, perMicrobatch: true },
      { kind: 'all-gather', what: 'parameters for backward', elements: parameters, perMicrobatch: true },
      { kind: 'reduce-scatter', what: 'gradients', elements: parameters, perMicrobatch: true },
    ]
    : [
      { kind: 'reduce-scatter', what: 'gradients', elements: parameters, perMicrobatch: stage === 2 },
      { kind: 'all-gather', what: 'updated parameters', elements: parameters, perMicrobatch: false },
    ];
  return { collectives, elements: collectives.reduce((s, c) => s + c.elements, 0) };
}

/**
 * Megatron-style tensor parallelism: two all-reduces in the forward pass and
 * two in the backward pass per Transformer layer (Megatron-LM 2021 §3.2),
 * each on a b × s × h activation tensor.
 */
export function tensorParallelBytes(input: { microbatch: number; sequence: number; hidden: number; bytesPerValue: number; layers: number }) {
  for (const [k, v] of Object.entries(input)) check(Number.isSafeInteger(v) && v >= 1, `${k} must be a whole number of at least 1.`);
  const perAllReduce = input.microbatch * input.sequence * input.hidden * input.bytesPerValue;
  const allReducesPerStep = 4 * input.layers;
  return { perAllReduce, allReducesPerStep, totalBytes: perAllReduce * allReducesPerStep };
}

/**
 * Pipeline bubble of a flush schedule with p stages and m microbatches:
 * (p − 1)/m of the ideal time, divided by v with v interleaved virtual stages
 * (Megatron-LM 2021 §2.2). Utilization is ideal / (ideal + bubble).
 */
export function pipelineBubble({ stages, microbatches, interleave = 1 }: { stages: number; microbatches: number; interleave?: number }) {
  check(Number.isSafeInteger(stages) && stages >= 1, 'Stages must be a whole number of at least 1.');
  check(Number.isSafeInteger(microbatches) && microbatches >= 1, 'Microbatches must be a whole number of at least 1.');
  check(Number.isSafeInteger(interleave) && interleave >= 1, 'Interleaving must be a whole number of at least 1.');
  const bubbleFraction = (stages - 1) / (interleave * microbatches);
  return { bubbleFraction, utilization: 1 / (1 + bubbleFraction) };
}

export interface RingStep {
  phase: 'reduce-scatter' | 'all-gather';
  /** Step index within its phase, from 0. */
  step: number;
  sends: { from: number; to: number; chunk: number; value: number }[];
  /** Every rank's chunks after this step. */
  state: number[][];
}

/**
 * Exact trace of a ring all-reduce over p ranks, each holding p chunks.
 * Reduce-scatter step k: rank r sends chunk (r − k) mod p to rank r + 1,
 * which adds it. All-gather step k: rank r sends chunk (r + 1 − k) mod p,
 * which the receiver copies. Afterwards every rank holds every sum.
 */
export function ringAllReduceTrace(start: number[][]): RingStep[] {
  const p = start.length;
  check(p >= 1 && start.every(row => row.length === p && row.every(Number.isFinite)), 'Each rank needs exactly one finite value per rank.');
  const mod = (x: number) => ((x % p) + p) % p;
  let state = start.map(row => [...row]);
  const trace: RingStep[] = [];
  for (const phase of ['reduce-scatter', 'all-gather'] as const) {
    for (let k = 0; k < p - 1; k++) {
      const sends = state.map((row, r) => {
        const chunk = phase === 'reduce-scatter' ? mod(r - k) : mod(r + 1 - k);
        return { from: r, to: mod(r + 1), chunk, value: row[chunk] };
      });
      const next = state.map(row => [...row]);
      for (const s of sends) next[s.to][s.chunk] = phase === 'reduce-scatter' ? next[s.to][s.chunk] + s.value : s.value;
      state = next;
      trace.push({ phase, step: k, sends, state });
    }
  }
  return trace;
}

/** Step-time bounds for compute and communication that could overlap:
 * perfect overlap gives max(compute, comm); none gives the sum. */
export function overlapBounds({ compute, communication }: { compute: number; communication: number }) {
  check(finiteNonnegative(compute) && finiteNonnegative(communication), 'Times must be finite and nonnegative.');
  return {
    best: Math.max(compute, communication),
    worst: compute + communication,
    exposedBest: Math.max(0, communication - compute),
    exposedWorst: communication,
  };
}

/**
 * Per-step data-parallel communication for a ZeRO stage under the ring model,
 * with each collective split into ⌈tensor bytes / bucket⌉ buckets. Every
 * collective's tensor is the full parameter (or gradient) set: Ψ values of
 * `bytesPerValue` bytes. Stage 0 is one all-reduce, so it is counted as two
 * ring phases, matching ZeRO's 2Ψ.
 *
 * With `microbatches` > 1 (gradient accumulation), an illustrative schedule:
 * stages 0 and 1 accumulate full gradients locally and synchronise once per
 * step; stage 2 keeps gradients sharded, so it reduce-scatters every
 * microbatch; stage 3 also reshards parameters after use, so it regathers
 * them and reduce-scatters every microbatch (FSDP2's defaults). Keeping
 * unsharded parameters or gradients between microbatches avoids repeats at a
 * memory cost this function does not model.
 */
export function stageCommunication(stage: ZeroStage, input: LinkModel & { parameters: number; bytesPerValue: number; bucketBytes: number; microbatches?: number }) {
  checkLink(input);
  check(Number.isFinite(input.bytesPerValue) && input.bytesPerValue > 0, 'Bytes per value must be finite and positive.');
  check(Number.isFinite(input.bucketBytes) && input.bucketBytes > 0, 'Bucket size must be finite and positive.');
  const microbatches = input.microbatches ?? 1;
  check(Number.isSafeInteger(microbatches) && microbatches >= 1, 'Microbatches must be a whole number of at least 1.');
  const { collectives } = zeroStepVolume(stage, input.parameters);
  const tensorBytes = input.parameters * input.bytesPerValue;
  const buckets = tensorBytes === 0 ? 0 : Math.ceil(tensorBytes / input.bucketBytes);
  let latency = 0, bandwidthTerm = 0, bytesSentPerRank = 0;
  // Stage 0's all-reduce is listed as 2Ψ elements; every other entry is Ψ.
  for (const c of collectives) {
    const ring = ringCollective(c.kind, { ...input, bytes: tensorBytes });
    const times = c.perMicrobatch ? microbatches : 1;
    latency += times * buckets * ring.steps * input.alpha;
    bandwidthTerm += times * ring.bandwidthTerm;
    bytesSentPerRank += times * ring.bytesSentPerRank;
  }
  return { collectives, buckets, latency, bandwidthTerm, total: latency + bandwidthTerm, bytesSentPerRank };
}

export interface PipelineBlock { stage: number; microbatch: number; kind: 'F' | 'B'; start: number; duration: number }

/**
 * A GPipe-style flush schedule: all forwards, then all backwards, with a
 * forward taking `forward` time units and a backward `backward` units (the
 * illustrative default is 1 and 2). Stage s runs microbatch j's forward at
 * (s + j)·tf. Backwards start once the last stage finishes its forwards and
 * run in reverse microbatch order back down the stages.
 */
export function gpipeSchedule({ stages: p, microbatches: m, forward = 1, backward = 2 }: { stages: number; microbatches: number; forward?: number; backward?: number }) {
  pipelineBubble({ stages: p, microbatches: m });
  check(Number.isFinite(forward) && forward > 0 && Number.isFinite(backward) && backward > 0, 'Block durations must be finite and positive.');
  const blocks: PipelineBlock[] = [];
  const forwardsDone = (p - 1 + m) * forward;
  for (let s = 0; s < p; s++) {
    for (let j = 0; j < m; j++) blocks.push({ stage: s, microbatch: j, kind: 'F', start: (s + j) * forward, duration: forward });
    for (let k = 0; k < m; k++) blocks.push({ stage: s, microbatch: m - 1 - k, kind: 'B', start: forwardsDone + (p - 1 - s + k) * backward, duration: backward });
  }
  return { blocks, makespan: forwardsDone + (p - 1 + m) * backward };
}

/** Round half away from zero at `places` decimals, tolerating binary error
 * (0.03745 s is stored as 37.4499… ms and must still read 37.5 ms). */
function roundHalf(v: number, places: number): string {
  const f = 10 ** places;
  return (Math.sign(v) * Math.round(Math.abs(v) * f + 1e-7) / f).toFixed(places);
}

/** Seconds as "x.xxx s" from one second up, otherwise "x.x ms". */
export function formatSeconds(t: number): string {
  check(finiteNonnegative(t), 'Time must be finite and nonnegative.');
  return t >= 1 ? `${roundHalf(t, 3)} s` : `${roundHalf(t * 1000, 1)} ms`;
}

/** Bytes as decimal gigabytes (10⁹ bytes) with two decimals. */
export function formatGB(bytes: number): string {
  check(finiteNonnegative(bytes), 'Bytes must be finite and nonnegative.');
  return `${roundHalf(bytes / 1e9, 2)} GB`;
}
