import { ForbiddenError } from "../src/errors/app-error";
import { PrintRequestService } from "../src/services/print-request.service";
import { findPrintRequestById } from "../src/repositories/print-request.repository";

jest.mock("../src/repositories/print-request.repository", () => ({
  findPrintRequestById: jest.fn()
}));

const mockedFindPrintRequestById = jest.mocked(findPrintRequestById);

describe("PrintRequestService organization boundary", () => {
  it("blocks access to another organization's request", async () => {
    mockedFindPrintRequestById.mockResolvedValue({
      id: 10,
      requester_organization_id: 20
    } as never);

    await expect(
      new PrintRequestService().getById(10, {
        organizationId: 30,
        roleCode: "STAFF"
      })
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("allows an administrator to inspect another organization", async () => {
    const request = {
      id: 10,
      requester_organization_id: 20
    };
    mockedFindPrintRequestById.mockResolvedValue(request as never);

    await expect(
      new PrintRequestService().getById(10, {
        organizationId: 30,
        roleCode: "ADMIN"
      })
    ).resolves.toBe(request);
  });
});
