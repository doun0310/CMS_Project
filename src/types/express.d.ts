import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        roleCode: string;
        organizationId: number;
      };
    }
  }
}

export {};
