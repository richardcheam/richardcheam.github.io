import test from 'node:test';
import assert from 'node:assert/strict';
import { validateResearchIndex } from '../src/lib/research-index.ts';

const source = { id: 'paper', url: 'https://arxiv.org/abs/1910.02054v3' };
const first = { id: 'first', dependsOn: [], sourceIds: ['paper'] };
const second = { id: 'second', dependsOn: ['first'], sourceIds: ['paper'] };
const claim = { id: 'C1', status: 'Derived', sourceIds: ['paper'], conditions: 'Explicit ledger', location: '/blog/example/' };

test('valid dependency order and source mapping are accepted', () => {
  assert.deepEqual(validateResearchIndex({ modules: [first, second], sources: [source], claims: [claim] }), []);
});

test('a cycle is rejected even when every dependency ID exists', () => {
  assert.ok(validateResearchIndex({ modules: [{ ...first, dependsOn: ['second'] }, second], sources: [source], claims: [claim] }).some(e => e.includes('cycle')));
});

test('a missing prerequisite cannot silently become an empty route', () => {
  assert.ok(validateResearchIndex({ modules: [{ ...second, dependsOn: ['missing'] }], sources: [source], claims: [claim] }).some(e => e.includes('missing')));
});

test('unresolved sources are rejected for both module readings and evidence claims', () => {
  const errors = validateResearchIndex({ modules: [{ ...first, sourceIds: ['lost'] }], sources: [source], claims: [{ ...claim, sourceIds: ['lost'] }] });
  assert.equal(errors.filter(e => e.includes('lost')).length, 2);
});

test('duplicate source identities and unsafe URL schemes are rejected', () => {
  const errors = validateResearchIndex({ modules: [first], sources: [source, { ...source, url: 'javascript:alert(1)' }], claims: [claim] });
  assert.ok(errors.some(e => e.includes('duplicate')));
  assert.ok(errors.some(e => e.includes('https')));
});

test('unqualified claims must retain a valid status and experimental conditions', () => {
  const errors = validateResearchIndex({ modules: [first], sources: [source], claims: [{ ...claim, status: 'Proven', conditions: '' }] });
  assert.ok(errors.some(e => e.includes('status')));
  assert.ok(errors.some(e => e.includes('conditions')));
});

const unit = { module: 'first', href: '/blog/example/' };

test('published units must belong to a known module, and claims must live on a published unit', () => {
  assert.deepEqual(validateResearchIndex({ modules: [first], sources: [source], claims: [claim], units: [unit] }), []);
  const orphan = validateResearchIndex({ modules: [first], sources: [source], claims: [claim], units: [{ ...unit, module: 'ghost' }] });
  assert.ok(orphan.some(e => e.includes('unknown module ghost')));
  const stray = validateResearchIndex({ modules: [first], sources: [source], claims: [{ ...claim, location: '/blog/unpublished/' }], units: [unit] });
  assert.ok(stray.some(e => e.includes('not a published unit')));
});

test('duplicate unit routes are rejected', () => {
  const errors = validateResearchIndex({ modules: [first], sources: [source], claims: [claim], units: [unit, unit] });
  assert.ok(errors.some(e => e.includes('duplicate unit')));
});
