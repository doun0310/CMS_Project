import { query } from "../config/database";

export interface OrganizationRow {
  id: number;
  name: string;
  parent_id: number | null;
  org_type: string;
  status: string;
}

export async function findOrganizationById(id: number) {
  const result = await query<OrganizationRow>(
    `
      SELECT id, name, parent_id, org_type, status
      FROM organizations
      WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] ?? null;
}
