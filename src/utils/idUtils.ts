const uuidMap = new Map<string, string>();
const reverseMap = new Map<string, string>();

// Pre-register known static project UUIDs
registerMapping('p1', '513a426e-7dd6-470a-a3bf-22091e2f887a');
registerMapping('p2', 'a1b1755c-7d1b-4a6f-a1ed-8904f8dc7c94');
registerMapping('p3', 'd6d3748e-7e1e-4bbb-8ab8-0172bab4f1a0');

/**
 * Registers a two-way mapping between a local ID and a remote UUID.
 * Works dynamically for existing workspaces, newly created workspaces, and future workspaces.
 */
export function registerMapping(localId: string, uuid: string) {
  if (!localId || !uuid) return;
  const cleanUuid = uuid.toLowerCase();
  uuidMap.set(localId, cleanUuid);
  reverseMap.set(cleanUuid, localId);
}

/**
 * Helper to ensure an ID is a valid PostgreSQL UUID.
 * If the input is already a valid UUID v4, it returns it as-is (and registers it if known).
 * If the input is a local/mock string (e.g. 'sprint-24', 'epic-1', 'p1'),
 * it returns a 100% deterministic UUID so foreign keys match across tables.
 */
export function ensureUUID(id?: string | null): string {
  if (!id) return crypto.randomUUID();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) {
    return id.toLowerCase();
  }

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
  const deterministicUUID = `${hex1.slice(0, 8)}-${hex2.slice(0, 4)}-4${hex2.slice(4, 7)}-a${hex1.slice(0, 3)}-${hex1}${hex2.slice(0, 4)}`.toLowerCase();

  registerMapping(id, deterministicUUID);
  return deterministicUUID;
}

/**
 * Reverse mapping helper: Converts a DB UUID back to its original local ID
 * (e.g. '7567a364-2bd6-4d3e-a756-7567a3642bd6' -> 'sprint-24', '513a426e-...' -> 'p1')
 * If no reverse mapping exists, returns the UUID as-is.
 */
export function mapUUIDToLocalID(uuid?: string | null): string | null {
  if (!uuid) return null;
  const cleanUuid = uuid.toLowerCase();
  if (reverseMap.has(cleanUuid)) {
    return reverseMap.get(cleanUuid)!;
  }
  return uuid;
}

/**
 * Returns a new random UUID v4.
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}
