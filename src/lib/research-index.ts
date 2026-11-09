interface Module { id: string; dependsOn: string[]; sourceIds: string[] }
interface Source { id: string; url: string }
interface Claim { id: string; status: string; sourceIds: string[]; conditions: string; location: string }

/** Validate the relationships our learning hub promises, independently of UI. */
export function validateResearchIndex(index: { modules: Module[]; sources: Source[]; claims: Claim[] }): string[] {
  const errors: string[] = [];
  for (const [kind, list] of [['module', index.modules], ['source', index.sources], ['claim', index.claims]] as const) {
    const seen = new Set<string>();
    for (const entry of list) {
      if (!entry.id || seen.has(entry.id)) errors.push(`${kind}: missing or duplicate id ${entry.id}`);
      seen.add(entry.id);
    }
  }
  const modules = new Map(index.modules.map(m => [m.id, m]));
  const sources = new Set(index.sources.map(s => s.id));
  for (const s of index.sources) {
    try { if (new URL(s.url).protocol !== 'https:') throw new Error(); }
    catch { errors.push(`${s.id}: source needs a valid https URL`); }
  }
  for (const entry of [...index.modules, ...index.claims]) {
    for (const id of entry.sourceIds) if (!sources.has(id)) errors.push(`${entry.id}: unknown source ${id}`);
  }
  const visited = new Set<string>(), active = new Set<string>();
  function visit(id: string): void {
    if (active.has(id)) { errors.push(`dependency cycle at ${id}`); return; }
    if (visited.has(id)) return;
    const module = modules.get(id);
    if (!module) { errors.push(`missing prerequisite ${id}`); return; }
    active.add(id);
    module.dependsOn.forEach(visit);
    active.delete(id);
    visited.add(id);
  }
  index.modules.forEach(m => visit(m.id));
  for (const c of index.claims) {
    if (!['Reported', 'Derived', 'Hypothesis', 'Unknown'].includes(c.status)) errors.push(`${c.id}: invalid evidence status`);
    if (!c.conditions.trim()) errors.push(`${c.id}: missing conditions`);
    if (!c.location.startsWith('/')) errors.push(`${c.id}: location must be a site route`);
  }
  return errors;
}
