export const USER_ROLES = {
  WORKER: "WORKER",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export const STATUSES = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export const UNITS = {
  METER: "METER",
  SQM: "SQM",
} as const;

export const SYNC_STATUSES = {
  PENDING: "PENDING",
  SYNCED: "SYNCED",
  FAILED: "FAILED",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
