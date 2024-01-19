export type UserRoleDB = "admin" | "guest";

export type IdentifiedByIdDB = { id: string };

export type IdentifiedByGroupIdDB = { group_id: string };

export type UserDB = IdentifiedByIdDB &
  IdentifiedByGroupIdDB & {
    role: UserRoleDB;
  };

export type ResourceDB = IdentifiedByIdDB &
  IdentifiedByGroupIdDB & {
    value: number;
  };
