import { query } from "../src/config/database";
import { listAuditLogs } from "../src/repositories/audit.repository";

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
});
