import { registerEnumType } from "type-graphql";

export enum Gender {
  Male = "Male",
  Female = "Female",
  Other = "Other",
  PreferNotToSay = "PreferNotToSay"
}

// Register gender enum with TypeGraphQL
registerEnumType(Gender, {
  name: "Gender",
  description: "List of available genres"
});
