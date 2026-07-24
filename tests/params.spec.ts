import { BadRequestError } from "../src/errors/app-error";
import { getPositiveIntParam } from "../src/utils/params";

describe("getPositiveIntParam", () => {
  it("parses a positive integer", () => {
    expect(getPositiveIntParam("42")).toBe(42);
  });

  it.each(["", "0", "-1", "1.5", "abc"])("rejects invalid value %p", (value) => {
    expect(() => getPositiveIntParam(value, "jobId")).toThrow(BadRequestError);
  });
});
