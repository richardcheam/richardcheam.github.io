import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ringCollective, crossoverBytes, bucketedAllReduce, zeroStepVolume,
  tensorParallelBytes, pipelineBubble, ringAllReduceTrace, overlapBounds, stageCommunication, gpipeSchedule, formatSeconds, formatGB,
} from '../src/lib/collectives.ts';

const close = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps * Math.max(1, Math.abs(b)), `${a} != ${b}`);

test('ring all-gather and reduce-scatter follow (p-1)α + (p-1)/p · n/B', () => {
  // 8 ranks, 1 GB total, α = 5 µs, B = 40 GB/s, all hand-computed.
  const ag = ringCollective('all-gather', { ranks: 8, bytes: 1e9, alpha: 5e-6, bandwidth: 40e9 });
  close(ag.latency, 7 * 5e-6);
  close(ag.bandwidthTerm, (7 / 8) * 1e9 / 40e9);
  close(ag.total, 35e-6 + 0.021875);
  assert.equal(ag.steps, 7);
  close(ag.bytesSentPerRank, 7 / 8 * 1e9);
  const rs = ringCollective('reduce-scatter', { ranks: 8, bytes: 1e9, alpha: 5e-6, bandwidth: 40e9 });
  close(rs.total, ag.total);
});

test('ring all-reduce is a reduce-scatter followed by an all-gather', () => {
  const p = { ranks: 32, bytes: 8.75e9, alpha: 5e-6, bandwidth: 40e9 };
  const ar = ringCollective('all-reduce', p);
  assert.equal(ar.steps, 62);
  close(ar.bandwidthTerm, 2 * (31 / 32) * 8.75e9 / 40e9); // ≈ 0.4238 s
  close(ar.bandwidthTerm, 0.423828125);
  close(ar.latency, 62 * 5e-6);
});

test('a single rank communicates nothing', () => {
  for (const kind of ['all-reduce', 'all-gather', 'reduce-scatter'] as const) {
    const r = ringCollective(kind, { ranks: 1, bytes: 1e9, alpha: 5e-6, bandwidth: 40e9 });
    assert.deepEqual([r.steps, r.latency, r.bandwidthTerm, r.total, r.bytesSentPerRank], [0, 0, 0, 0, 0]);
  }
});

test('latency dominates small messages: the crossover size is p·α·B', () => {
  close(crossoverBytes({ ranks: 32, alpha: 5e-6, bandwidth: 40e9 }), 6.4e6);
  // At the crossover, both terms of a ring all-gather are equal.
  const n = crossoverBytes({ ranks: 32, alpha: 5e-6, bandwidth: 40e9 });
  const ag = ringCollective('all-gather', { ranks: 32, bytes: n, alpha: 5e-6, bandwidth: 40e9 });
  close(ag.latency, ag.bandwidthTerm);
  // A 1 MiB all-reduce on 32 ranks: latency 0.31 ms.
  const small = ringCollective('all-reduce', { ranks: 32, bytes: 2 ** 20, alpha: 5e-6, bandwidth: 40e9 });
  close(small.latency, 3.1e-4);
});

test('bucketing trades collective count against latency', () => {
  // 14 GB of gradients in 25 MiB buckets on 8 ranks.
  const b = bucketedAllReduce({ ranks: 8, bytes: 14e9, bucketBytes: 25 * 2 ** 20, alpha: 5e-6, bandwidth: 40e9 });
  assert.equal(b.buckets, Math.ceil(14e9 / (25 * 2 ** 20))); // 535
  close(b.latency, 535 * 2 * 7 * 5e-6);
  close(b.bandwidthTerm, 2 * (7 / 8) * 14e9 / 40e9);
  // One bucket per collective changes only the latency term.
  const one = bucketedAllReduce({ ranks: 8, bytes: 14e9, bucketBytes: 14e9, alpha: 5e-6, bandwidth: 40e9 });
  assert.equal(one.buckets, 1);
  close(one.bandwidthTerm, b.bandwidthTerm);
  assert.ok(one.latency < b.latency);
});

test('ZeRO step volume: 2Ψ for stages 0-2 and 3Ψ for stage 3 (ZeRO v3 §7)', () => {
  const psi = 7e9;
  assert.deepEqual([0, 1, 2, 3].map(s => zeroStepVolume(s as 0 | 1 | 2 | 3, psi).elements), [2 * psi, 2 * psi, 2 * psi, 3 * psi]);
  assert.deepEqual(zeroStepVolume(3, psi).collectives.map(c => c.kind), ['all-gather', 'all-gather', 'reduce-scatter']);
  assert.deepEqual(zeroStepVolume(0, psi).collectives.map(c => c.kind), ['all-reduce']);
  assert.deepEqual(zeroStepVolume(2, psi).collectives.map(c => c.kind), ['reduce-scatter', 'all-gather']);
});

test('tensor parallelism: four all-reduces of b·s·h values per layer per step (Megatron §3.2)', () => {
  // b = 1, s = 2048, h = 8192, BF16, 80 layers.
  const tp = tensorParallelBytes({ microbatch: 1, sequence: 2048, hidden: 8192, bytesPerValue: 2, layers: 80 });
  assert.equal(tp.perAllReduce, 2048 * 8192 * 2); // 32 MiB
  assert.equal(tp.allReducesPerStep, 320);
  assert.equal(tp.totalBytes, 320 * 2048 * 8192 * 2);
});

test('pipeline bubble: (p-1)/(v·m) of ideal time, utilization m/(m+p-1) when v = 1', () => {
  close(pipelineBubble({ stages: 8, microbatches: 32 }).bubbleFraction, 7 / 32);
  close(pipelineBubble({ stages: 8, microbatches: 32 }).utilization, 32 / 39); // 0.8205
  close(pipelineBubble({ stages: 8, microbatches: 4 }).utilization, 4 / 11);   // 0.3636
  close(pipelineBubble({ stages: 8, microbatches: 32, interleave: 2 }).bubbleFraction, 7 / 64);
  assert.equal(pipelineBubble({ stages: 1, microbatches: 4 }).bubbleFraction, 0);
});

test('the ring trace ends with every rank holding every reduced chunk', () => {
  const p = 4;
  const start = Array.from({ length: p }, (_, r) => Array.from({ length: p }, (_, c) => (r + 1) * (c + 1)));
  const trace = ringAllReduceTrace(start);
  assert.equal(trace.length, 2 * (p - 1));
  const sums = [10, 20, 30, 40];
  // After reduce-scatter, rank r owns the full sum of chunk (r + 1) mod p.
  const afterRS = trace[p - 2].state;
  for (let r = 0; r < p; r++) assert.equal(afterRS[r][(r + 1) % p], sums[(r + 1) % p]);
  for (const row of trace.at(-1)!.state) assert.deepEqual(row, sums);
  // Every step, every rank sends exactly one chunk.
  for (const s of trace) assert.equal(s.sends.length, p);
});

test('overlap bounds: perfect overlap hides communication up to the compute time', () => {
  assert.deepEqual(overlapBounds({ compute: 1, communication: 0.4 }), { best: 1, worst: 1.4, exposedBest: 0, exposedWorst: 0.4 });
  assert.deepEqual(overlapBounds({ compute: 0.3, communication: 0.5 }), { best: 0.5, worst: 0.8, exposedBest: 0.2, exposedWorst: 0.5 });
});

test('invalid inputs throw instead of returning plausible numbers', () => {
  const ok = { ranks: 8, bytes: 1e9, alpha: 5e-6, bandwidth: 40e9 };
  for (const bad of [{ ranks: 0 }, { ranks: 2.5 }, { ranks: NaN }, { bytes: -1 }, { bytes: Infinity }, { alpha: -1 }, { bandwidth: 0 }, { bandwidth: -5 }]) {
    assert.throws(() => ringCollective('all-reduce', { ...ok, ...bad }), RangeError, JSON.stringify(bad));
  }
  assert.throws(() => bucketedAllReduce({ ...ok, bucketBytes: 0 }), RangeError);
  assert.throws(() => pipelineBubble({ stages: 4, microbatches: 0 }), RangeError);
  assert.throws(() => pipelineBubble({ stages: 4, microbatches: 8, interleave: 1.5 }), RangeError);
  assert.throws(() => zeroStepVolume(4 as 0, 1e9), RangeError);
  assert.throws(() => overlapBounds({ compute: -1, communication: 1 }), RangeError);
});

test('stage communication time, bucketed, for a 7B BF16 model on 8 ranks (hand-computed)', () => {
  const link = { ranks: 8, alpha: 5e-6, bandwidth: 40e9, bucketBytes: 25 * 2 ** 20 };
  // 14e9 gradient bytes → 535 buckets; each ring step costs α.
  const s0 = stageCommunication(0, { parameters: 7e9, bytesPerValue: 2, ...link });
  close(s0.latency, 535 * 14 * 5e-6);          // 0.03745 s
  close(s0.bandwidthTerm, 2 * (7 / 8) * 14e9 / 40e9); // 0.6125 s
  close(s0.bytesSentPerRank, 2 * (7 / 8) * 14e9);
  const s2 = stageCommunication(2, { parameters: 7e9, bytesPerValue: 2, ...link });
  close(s2.total, s0.total);                   // same 2Ψ volume as plain data parallelism
  const s3 = stageCommunication(3, { parameters: 7e9, bytesPerValue: 2, ...link });
  close(s3.bandwidthTerm, 3 * (7 / 8) * 14e9 / 40e9); // 0.91875 s
  close(s3.latency, 3 * 535 * 7 * 5e-6);
  close(s3.bandwidthTerm / s0.bandwidthTerm, 1.5);
  assert.equal(s3.collectives.length, 3);
});

test('stage communication rejects invalid sizes', () => {
  const base = { parameters: 7e9, bytesPerValue: 2, ranks: 8, alpha: 5e-6, bandwidth: 40e9, bucketBytes: 25 * 2 ** 20 };
  assert.throws(() => stageCommunication(0, { ...base, bytesPerValue: 0 }), RangeError);
  assert.throws(() => stageCommunication(0, { ...base, parameters: -1 }), RangeError);
  assert.throws(() => stageCommunication(0, { ...base, bucketBytes: NaN }), RangeError);
  const one = stageCommunication(3, { ...base, ranks: 1 });
  assert.equal(one.total, 0);
});

test('GPipe schedule: makespan (m + p − 1)(tf + tb), no stage runs two blocks at once', () => {
  for (const [p, m] of [[4, 8], [8, 4], [1, 3], [3, 1]]) {
    const { blocks, makespan } = gpipeSchedule({ stages: p, microbatches: m });
    assert.equal(blocks.length, 2 * p * m);
    assert.equal(makespan, (m + p - 1) * 3); // forward 1 unit, backward 2 units
    for (let st = 0; st < p; st++) {
      const mine = blocks.filter(b => b.stage === st).sort((a, b) => a.start - b.start);
      assert.equal(mine.reduce((s, b) => s + b.duration, 0), 3 * m);
      for (let i = 1; i < mine.length; i++) assert.ok(mine[i].start >= mine[i - 1].start + mine[i - 1].duration);
    }
    // Idle share equals the bubble formula's fraction of total time.
    const idle = 1 - (3 * m) / makespan;
    close(idle, (p - 1) / (m + p - 1));
  }
  // A microbatch's forward on stage s starts only after it left stage s − 1.
  const { blocks } = gpipeSchedule({ stages: 4, microbatches: 6 });
  for (const b of blocks.filter(x => x.kind === 'F' && x.stage > 0)) {
    const prev = blocks.find(x => x.kind === 'F' && x.stage === b.stage - 1 && x.microbatch === b.microbatch)!;
    assert.ok(b.start >= prev.start + prev.duration);
  }
  assert.throws(() => gpipeSchedule({ stages: 0, microbatches: 2 }), RangeError);
});

test('time and size formatting rounds decimal halves up despite binary floating point', () => {
  assert.equal(formatSeconds(0.03745), '37.5 ms');    // 37.449999… in binary
  assert.equal(formatSeconds(0.974925), '974.9 ms');
  assert.equal(formatSeconds(1.5468), '1.547 s');
  assert.equal(formatSeconds(0), '0.0 ms');
  assert.equal(formatGB(24.5e9), '24.50 GB');
  assert.throws(() => formatSeconds(NaN), RangeError);
});
