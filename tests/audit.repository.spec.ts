import { query } from "../src/config/database";
import { listAuditLogs, verifyAuditChain } from "../src/repositories/audit.repository";

jest.mock("../src/config/database", () => ({
  query: jest.fn()
}));

const mockedQuery = jest.mocked(query);

describe("audit log repository query", () => {
  it("only references columns present in the current schema", async () => {
    mockedQuery.mockResolvedValue({ rows: [] } as never);

    await listAuditLogs(1);

    const sql = String(mockedQuery.mock.calls[0][0]);
    expect(sql).not.toContain("a.ip_address");
  });

  it("verifies Merkle audit chain integrity correctly", async () => {
    mockedQuery.mockResolvedValue({
      rows: [
        { id: 1, detail_json: { prevHash: "GENESIS_HASH_00000000000000000000000000000000", auditHash: "HASH_1" } },
        { id: 2, detail_json: { prevHash: "HASH_1", auditHash: "HASH_2" } }
      ]
    } as never);

    const result = await verifyAuditChain();

    expect(result.isValid).toBe(true);
    expect(result.tamperedLogId).toBeNull();
    expect(result.totalLogsVerified).toBe(2);
  });
});
