import { UserRole } from "./constants.js";

export type AuthUser = {
  id: string;
  role: UserRole;
  employeeId: string;
  name: string;
};

export type JwtPayload = AuthUser & {
  iat?: number;
  exp?: number;
};
