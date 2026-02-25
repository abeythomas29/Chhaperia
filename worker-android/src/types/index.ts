export type User = {
  id: string;
  name: string;
  role: "WORKER" | "ADMIN" | "SUPER_ADMIN";
  employeeId: string;
};

export type Category = {
  id: string;
  name: string;
  codes: { id: string; code: string; status: string }[];
};

export type Company = {
  id: string;
  name: string;
  status?: string;
};

export type EntryPayload = {
  productCodeId: string;
  date: string;
  rollsCount: number;
  unit: "METER" | "SQM";
  quantityPerRoll: number;
  issuedToCompanyId: string;
  sourceDeviceId?: string;
  syncStatus?: "PENDING" | "SYNCED" | "FAILED";
};

export type LocalEntry = EntryPayload & {
  localId: string;
  status: "PENDING" | "SYNCED" | "FAILED";
  createdAt: string;
};

export type MasterData = {
  categories: Category[];
  companies: Company[];
  updatedAt: string;
};

export type OfflineCredential = {
  identity: string;
  password: string;
  user: User;
};
