const uuidMap = new Map<string, string>();

/**
 * Helper to ensure an ID is a valid PostgreSQL UUID.
 * If the input is already a valid UUID v4, it returns it as-is.
 * If the input is a legacy/mock string (e.g. 'sprint-24', 'epic-1', 'p1'),
 * it returns a 100% deterministic UUID so foreign keys match across tables.
 */
export function ensureUUID(id?: string | null): string {
  if (!id) return crypto.randomUUID();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;

  if (uuidMap.has(id)) {
    return uuidMap.get(id)!;
  }

  // Generate a deterministic UUID for non-UUID strings
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < id.length; i++) {
    const ch = id.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hex1 = Math.abs(h1).toString(16).padStart(8, '0');
  const hex2 = Math.abs(h2).toString(16).padStart(8, '0');

  const deterministicUUID = `${hex1.slice(0, 8)}-${hex2.slice(0, 4)}-4${hex2.slice(4, 7)}-a${hex1.slice(0, 3)}-${hex1}${hex2.slice(0, 4)}`;
  uuidMap.set(id, deterministicUUID);
  return deterministicUUID;
}

/**
 * Returns a new random UUID v4.
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}
