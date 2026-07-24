import request from "supertest";
import { createApp } from "../src/app";

describe("API input validation", () => {
  it("rejects invalid optional print request fields before database access", async () => {
    const response = await request(createApp())
      .post("/api/v1/print-requests")
      .send({
        documentType: "REPORT",
        sourceDocumentId: "DOC-1",
        templateId: 1,
        copies: 1,
        isSensitive: "yes"
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("rejects oversized approval comments before database access", async () => {
    const response = await request(createApp())
      .post("/api/v1/approvals/1/approve")
      .send({
        comment: "x".repeat(301)
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("300");
  });

  it("rejects oversized agent polling batches", async () => {
    const response = await request(createApp())
      .post("/api/v1/agent/jobs/poll")
      .send({
        agentKey: "agent-1",
        printerIds: Array.from({ length: 101 }, (_, index) => index + 1)
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
