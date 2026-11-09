import test from 'node:test';
import assert from 'node:assert/strict';
import rehypeTableWrap from '../src/lib/rehype-table-wrap.mjs';

const table = () => ({ type: 'element', tagName: 'table', properties: {}, children: [] });
const run = (tree: any) => { rehypeTableWrap()(tree); return tree; };

test('wraps a top-level table in a focusable scrolling region', () => {
  const tree = run({ type: 'root', children: [table()] });
  const wrap = tree.children[0];
  assert.equal(wrap.tagName, 'div');
  assert.deepEqual(wrap.properties, { className: ['table-wrap'], role: 'region', tabIndex: 0, ariaLabel: 'Table' });
  assert.equal(wrap.children[0].tagName, 'table');
});

test('wraps nested tables and keeps an author-supplied label', () => {
  const labelled = { ...table(), properties: { ariaLabel: 'Bytes per rank' } };
  const tree = run({ type: 'root', children: [{ type: 'element', tagName: 'figure', properties: {}, children: [labelled] }] });
  const wrap = tree.children[0].children[0];
  assert.equal(wrap.properties.ariaLabel, 'Bytes per rank');
});

test('leaves an existing wrapper alone, so tables are never double-wrapped', () => {
  const existing = { type: 'element', tagName: 'div', properties: { className: ['table-wrap'] }, children: [table()] };
  const tree = run({ type: 'root', children: [existing] });
  assert.equal(tree.children[0], existing);
  assert.equal(tree.children[0].children[0].tagName, 'table');
});
