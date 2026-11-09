import test from 'node:test';
import assert from 'node:assert/strict';
import { courseStep, courseOutline, minutes } from '../src/lib/course.ts';
import { publishedUnits, courseParts } from '../src/data/model-development.ts';

const u = (href: string, part: string) => ({ module: 'systems', part, kind: 'lesson' as const, title: href, href, task: '' });
const parts = [{ id: 'a', title: 'A', outcome: '' }, { id: 'b', title: 'B', outcome: '' }];

test('course step gives position, part and neighbours', () => {
  const units = [u('/1/', 'a'), u('/2/', 'a'), u('/3/', 'b')];
  const s = courseStep('/2/', units, parts)!;
  assert.deepEqual([s.number, s.total, s.partNumber, s.prev?.href, s.next?.href], [2, 3, 1, '/1/', '/3/']);
  const last = courseStep('/3/', units, parts)!;
  assert.equal(last.next, undefined);
  assert.equal(last.part.id, 'b');
  assert.equal(courseStep('/elsewhere/', units, parts), undefined);
});

test('the outline rejects split or unknown parts and empty parts', () => {
  assert.throws(() => courseOutline([u('/1/', 'a'), u('/2/', 'b'), u('/3/', 'a')], parts), /not consecutive/);
  assert.throws(() => courseOutline([u('/1/', 'a'), u('/2/', 'z')], [...parts]), /no units|unknown/);
  assert.throws(() => courseOutline([u('/1/', 'a')], parts), /no units/);
});

test('the published course is well formed', () => {
  const outline = courseOutline(publishedUnits, courseParts);
  assert.deepEqual(outline.map((p) => p.units.length), [2, 3]);
  assert.equal(courseStep('/blog/model-development-collectives/')!.number, 3);
});

test('reading time parses minutes and refuses to guess', () => {
  assert.equal(minutes('12 min'), 12);
  assert.equal(minutes(9), 9);
  assert.equal(minutes('about a quarter hour'), undefined);
  assert.equal(minutes(undefined), undefined);
});
