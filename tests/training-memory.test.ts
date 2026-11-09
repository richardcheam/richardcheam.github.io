import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateTrainingMemory, toGiB } from '../src/lib/training-memory.ts';

const input = { parameters: 7_000_000_000, devices: 8, activationBytes: 0, workspaceBytes: 0, materializationBytes: 0 };

test('7B Adam ledger reproduces hand-derived persistent bytes for every stage', () => {
  const rows = estimateTrainingMemory(input);
  assert.deepEqual(rows.map(r => r.persistent), [112e9, 38.5e9, 26.25e9, 14e9]);
  assert.deepEqual(rows.map(r => r.weights), [14e9, 14e9, 14e9, 1.75e9]);
  assert.deepEqual(rows.map(r => r.gradients), [14e9, 14e9, 1.75e9, 1.75e9]);
  assert.deepEqual(rows.map(r => r.optimizer), [84e9, 10.5e9, 10.5e9, 10.5e9]);
});

test('one device cannot gain state-memory savings from sharding', () => {
  assert.deepEqual(estimateTrainingMemory({ ...input, devices: 1 }).map(r => r.persistent), [112e9, 112e9, 112e9, 112e9]);
});

test('increasing the shard count does not reduce replicated DP memory', () => {
  assert.equal(estimateTrainingMemory({ ...input, devices: 64 })[0].persistent, 112e9);
  assert.equal(estimateTrainingMemory({ ...input, devices: 64 })[3].persistent, 1.75e9);
});

test('activation and workspace allowances stay per rank instead of being divided by devices', () => {
  assert.deepEqual(estimateTrainingMemory({ ...input, activationBytes: 6e9, workspaceBytes: 2e9 }).map(r => r.budgeted), [120e9, 46.5e9, 34.25e9, 22e9]);
});

test('materialization allowance is additional live memory only for full parameter sharding', () => {
  const rows = estimateTrainingMemory({ ...input, activationBytes: 6e9, workspaceBytes: 2e9, materializationBytes: 3e9 });
  assert.deepEqual(rows.map(r => r.budgeted), [120e9, 46.5e9, 34.25e9, 25e9]);
  assert.deepEqual(rows.map(r => r.persistent), [112e9, 38.5e9, 26.25e9, 14e9]);
});

test('ideal average sharding is explicit even when the parameter count is not divisible', () => {
  assert.deepEqual(estimateTrainingMemory({ ...input, parameters: 101, devices: 4 }).map(r => r.persistent), [1616, 707, 555.5, 404]);
});

test('GiB conversion does not silently use decimal GB', () => {
  assert.equal(toGiB(1_073_741_824), 1);
  assert.equal(toGiB(14e9), 13.0385160446167);
  assert.equal(toGiB(0), 0);
});

test('invalid parameter and device counts never produce plausible estimates', () => {
  for (const value of [0, -1, NaN, Infinity, 1.5]) {
    assert.throws(() => estimateTrainingMemory({ ...input, parameters: value }), RangeError);
    assert.throws(() => estimateTrainingMemory({ ...input, devices: value }), RangeError);
  }
});

test('negative or nonfinite allowances are rejected instead of subtracting memory', () => {
  for (const key of ['activationBytes', 'workspaceBytes', 'materializationBytes']) {
    for (const value of [-1, NaN, Infinity]) assert.throws(() => estimateTrainingMemory({ ...input, [key]: value }), RangeError);
  }
  assert.throws(() => toGiB(-1), RangeError);
  assert.throws(() => toGiB(Infinity), RangeError);
});

test('memory components reconcile and input is not mutated across repeated calls', () => {
  const frozen = Object.freeze({ ...input });
  for (const r of estimateTrainingMemory(frozen)) assert.equal(r.persistent, r.weights + r.gradients + r.optimizer);
  assert.deepEqual(estimateTrainingMemory(frozen), estimateTrainingMemory(frozen));
});
