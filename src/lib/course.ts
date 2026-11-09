// The model-development course: where a page sits in the reading order, for
// the course bar on lessons and reviews and the syllabus on the hub.
import { publishedUnits, courseParts, type LearningUnit, type CoursePart } from "../data/model-development.ts";

export interface CourseStep {
  unit: LearningUnit;
  /** 1-based position in the whole course. */
  number: number;
  total: number;
  part: CoursePart;
  /** 1-based position of the part. */
  partNumber: number;
  prev?: LearningUnit;
  next?: LearningUnit;
}

/** The course step for a route, or undefined if the page is not in the course. */
export function courseStep(href: string, units: LearningUnit[] = publishedUnits, parts: CoursePart[] = courseParts): CourseStep | undefined {
  const i = units.findIndex((u) => u.href === href);
  if (i < 0) return undefined;
  const unit = units[i];
  const partIndex = parts.findIndex((p) => p.id === unit.part);
  if (partIndex < 0) throw new Error(`${href}: unknown course part ${unit.part}`);
  return { unit, number: i + 1, total: units.length, part: parts[partIndex], partNumber: partIndex + 1, prev: units[i - 1], next: units[i + 1] };
}

/** Parts in order with their units; a part's units must be consecutive. */
export function courseOutline(units: LearningUnit[] = publishedUnits, parts: CoursePart[] = courseParts) {
  const outline = parts.map((part) => ({ part, units: units.map((u, i) => ({ unit: u, number: i + 1 })).filter((x) => x.unit.part === part.id) }));
  const order = units.map((u) => u.part);
  for (const { part, units: mine } of outline) {
    if (mine.length === 0) throw new Error(`course part ${part.id} has no units`);
    const first = mine[0].number - 1, last = mine.at(-1)!.number - 1;
    if (order.slice(first, last + 1).some((p) => p !== part.id)) throw new Error(`course part ${part.id} is not consecutive`);
  }
  const listed = new Set(parts.map((p) => p.id));
  for (const u of units) if (!listed.has(u.part)) throw new Error(`${u.href}: unknown course part ${u.part}`);
  return outline;
}

/** "12 min" → 12; unknown formats give undefined rather than a guess. */
export function minutes(readTime: string | number | undefined): number | undefined {
  if (typeof readTime === "number") return readTime;
  const m = readTime?.match(/^(\d+)\s*min/);
  return m ? +m[1] : undefined;
}
