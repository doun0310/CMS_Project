import { ForbiddenError } from "../src/errors/app-error";
import { PrintRequestService } from "../src/services/print-request.service";
import {
  findAssignablePrinterById,
  findPrintRequestById,
  isActiveTemplate
} from "../src/repositories/print-request.repository";

jest.mock("../src/repositories/print-request.repository", () => ({
  findAssignablePrinterById: jest.fn(),
  findPrintRequestById: jest.fn(),
  isActiveTemplate: jest.fn()
}));

const mockedFindPrintRequestById = jest.mocked(findPrintRequestById);
const mockedFindAssignablePrinterById = jest.mocked(findAssignablePrinterById);
const mockedIsActiveTemplate = jest.mocked(isActiveTemplate);

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

  it("blocks assigning a printer owned by another organization", async () => {
    mockedIsActiveTemplate.mockResolvedValue(true);
    mockedFindAssignablePrinterById.mockResolvedValue({
      id: 7,
      organization_id: 99,
      status: "ONLINE"
    });

    await expect(
      new PrintRequestService().create(
        {
          documentType: "REPORT",
          sourceDocumentId: "DOC-1",
          templateId: 1,
          printerId: 7,
          copies: 1
        },
        {
          id: 10,
          organizationId: 20
        }
      )
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
