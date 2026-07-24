import request from "supertest";
import { createApp } from "../src/app";
import { env } from "../src/config/env";

describe("API authentication boundary", () => {
  const originalMockAuth = env.enableMockAuth;

  afterEach(() => {
    env.enableMockAuth = originalMockAuth;
  });

  it("rejects protected routes when development mock auth is disabled", async () => {
    env.enableMockAuth = false;
    const response = await request(createApp()).get("/api/v1/print-requests");

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHORIZED");
  });
});
