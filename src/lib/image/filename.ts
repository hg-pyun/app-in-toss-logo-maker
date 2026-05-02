export function filename(name: string, existingNames: string[] = []): string {
  const base = stripExtension(name);
  const candidate = `${base}-600.png`;
  const existing = new Set(existingNames);
  if (!existing.has(candidate)) return candidate;
  let counter = 2;
  while (true) {
    const next = `${base}-600 (${counter}).png`;
    if (!existing.has(next)) return next;
    counter++;
  }
}

function stripExtension(name: string): string {
  const dotIdx = name.lastIndexOf('.');
  if (dotIdx <= 0) return name;
  return name.slice(0, dotIdx);
}
