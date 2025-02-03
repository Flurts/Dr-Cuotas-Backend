import { registerEnumType } from "type-graphql";

export enum File_Type {
  CURRICULUM_VITAE = "CURRICULUM_VITAE",
  DOCTOR_PHOTOS = "DOCTOR_PHOTOS",
  DOCTOR_VIDEOS = "DOCTOR_VIDEOS",
  SURGERY_PHOTOS = "SURGERY_PHOTOS",
  SURGERY_VIDEOS = "SURGERY_VIDEOS",
  PAYMENT_RECEIPT = "PAYMENT_RECEIPT"
}

// Register gender enum with TypeGraphQL
registerEnumType(File_Type, {
  name: "File_Type",
  description: "List of available file types"
});
