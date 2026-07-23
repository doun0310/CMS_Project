import request from "supertest";
import { createApp } from "../src/app";

describe("GET /docs", () => {
  it("serves swagger ui", async () => {
    const app = createApp();

    const response = await request(app).get("/docs");

    expect([200, 301, 302]).toContain(response.status);
  });
});
