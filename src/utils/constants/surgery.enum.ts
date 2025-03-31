import { registerEnumType } from "type-graphql";

export enum SurgeryTypes {
  // Facial Surgeries
  Rhinoplasty = "Rhinoplasty", // Incluye estética y funcional
  Facelift = "Facelift", // Lifting
  Blepharoplasty = "Blepharoplasty", // Eyelid Surgery
  Otoplasty = "Otoplasty", // Ear Surgery
  BuccalFatRemoval = "BuccalFatRemoval", // Bichectomía
  // BrowLift = "BrowLift",

  // Breast Surgeries
  BreastAugmentation = "BreastAugmentation",
  BreastLift = "BreastLift",
  BreastReduction = "BreastReduction",
  // BreastReconstruction = "BreastReconstruction",

  // Body Surgeries
  Liposuction = "Liposuction", // Liposucción
  TummyTuck = "TummyTuck", // Abdominoplastia convencional y circular
  LiposuctionWithTummyTuck = "LiposuctionWithTummyTuck", // Lipo + abdominoplastia
  LiposuctionWithButtockAugmentation = "LiposuctionWithButtockAugmentation", // Lipo + lipotransferencia glútea
  SkinLesionTreatment = "SkinLesionTreatment", // Lesiones de piel
  ButtockAugmentation = "ButtockAugmentation"
}

registerEnumType(SurgeryTypes, {
  name: "SurgeryTypes",
  description: "Types of surgeries"
});

export enum SurgeryCategories {
  FacialSurgeries = "FacialSurgeries",
  BreastSurgeries = "BreastSurgeries",
  BodySurgeries = "BodySurgeries",
  ReconstructiveSurgeries = "ReconstructiveSurgeries",
  GeneralSurgeries = "GeneralSurgeries",
  CosmeticSurgeries = "CosmeticSurgeries",
  OrthopedicSurgeries = "OrthopedicSurgeries",
  NeurologicalSurgeries = "NeurologicalSurgeries",
  OphthalmicSurgeries = "OphthalmicSurgeries",
  PediatricSurgeries = "PediatricSurgeries",
  UrologicSurgeries = "UrologicSurgeries",
  GynecologicSurgeries = "GynecologicSurgeries",
  ThoracicSurgeries = "ThoracicSurgeries",
  TransplantSurgeries = "TransplantSurgeries",
  ENTSurgeries = "ENTSurgeries",
  DentalSurgeries = "DentalSurgeries"
}

export enum SubSurgeryCategories {
  EyelidSurgery = "EyelidSurgery",
  Facelift = "Facelift",
  BreastAugmentation = "BreastAugmentation",
  BreastReduction = "BreastReduction",
  BreastLift = "BreastLift",
  Liposuction = "Liposuction",
  TummyTuck = "TummyTuck",
  ButtockLift = "ButtockLift"
}

registerEnumType(SurgeryCategories, {
  name: "SurgeryCategories",
  description: "Categories of surgeries"
});

registerEnumType(SubSurgeryCategories, {
  name: "SubSurgeryCategories",
  description: "Enum de subcategorías de cirugía"
});
