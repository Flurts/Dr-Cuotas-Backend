import { registerEnumType } from "type-graphql";

export enum Role {
  Admin = "Admin",
  User = "User",
  Guest = "Guest",
  Doctor = "Doctor"
}

// Register role enum with TypeGraphQL
registerEnumType(Role, {
  name: "Role",
  description: "List of available roles"
});
