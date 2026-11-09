/** Ideal per-rank ledger, not a profiler or a guarantee that a job fits.
 * Fixed illustrative policy: 2-byte weights + 2-byte gradients,
 * 4-byte master weights and two 4-byte Adam moments. No offload/TP/PP.
 */
export interface MemoryInput {
  parameters: number;
  devices: number;
  activationBytes: number;
  workspaceBytes: number;
  /** Additional live full-parameter/prefetch buffer allowance on each rank. */
  materializationBytes: number;
}

export interface MemoryRow {
  stage: 0 | 1 | 2 | 3;
  weights: number;
  gradients: number;
  optimizer: number;
  persistent: number;
  budgeted: number;
}

function nonnegative(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`${name} must be finite and nonnegative.`);
}

export function toGiB(bytes: number): number {
  nonnegative(bytes, 'Bytes');
  return bytes / 1_073_741_824;
}

export function estimateTrainingMemory(input: MemoryInput): MemoryRow[] {
  const { parameters: n, devices: d, activationBytes, workspaceBytes, materializationBytes } = input;
  if (!Number.isSafeInteger(n) || n <= 0) throw new RangeError('Parameters must be a positive safe integer.');
  if (!Number.isSafeInteger(d) || d <= 0) throw new RangeError('Devices must be a positive safe integer.');
  nonnegative(activationBytes, 'Activations');
  nonnegative(workspaceBytes, 'Workspace');
  nonnegative(materializationBytes, 'Materialization allowance');
  return ([0, 1, 2, 3] as const).map(stage => {
    const weights = 2 * n / (stage === 3 ? d : 1);
    const gradients = 2 * n / (stage >= 2 ? d : 1);
    const optimizer = 12 * n / (stage >= 1 ? d : 1);
    const persistent = weights + gradients + optimizer;
    const budgeted = persistent + activationBytes + workspaceBytes + (stage === 3 ? materializationBytes : 0);
    return { stage, weights, gradients, optimizer, persistent, budgeted };
  });
}
