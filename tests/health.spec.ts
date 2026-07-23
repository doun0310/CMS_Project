import request from "supertest";
import { createApp } from "../src/app";

describe("GET /health", () => {
  it("returns ok status", async () => {
    const app = createApp();

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        status: "ok"
      }
    });
  });
});
