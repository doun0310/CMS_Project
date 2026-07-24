import { BadRequestError } from "../errors/app-error";

export function getParamString(param: string | string[] | undefined): string {
  if (!param) return "";
  return Array.isArray(param) ? param[0] : param;
}

export function getPositiveIntParam(
  param: string | string[] | undefined,
  name = "id"
): number {
  const value = getParamString(param);
  if (!/^[1-9]\d*$/.test(value)) {
    throw new BadRequestError(`${name} must be a positive integer`, {
      [name]: value
    });
  }

  return Number(value);
}
