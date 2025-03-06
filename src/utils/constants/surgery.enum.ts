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
  // ArmLift = "ArmLift",
  // ThighLift = "ThighLift",

  // Cosmetic Surgeries
  // Botox = "Botox",
  // DermalFillers = "DermalFillers",
  // ChemicalPeel = "ChemicalPeel",
  // LaserHairRemoval = "LaserHairRemoval",

  // Reconstructive Surgeries
  // ScarRevision = "ScarRevision",
  // HandSurgery = "HandSurgery",
  // Microsurgery = "Microsurgery",
  // BurnSurgery = "BurnSurgery",

  // Orthopedic Surgeries
  // JointReplacement = "JointReplacement",
  // Arthroscopy = "Arthroscopy",
  // SpinalFusion = "SpinalFusion",
  // ACLReconstruction = "ACLReconstruction",

  // Cardiovascular Surgeries
  // CoronaryArteryBypass = "CoronaryArteryBypass",
  // HeartValveReplacement = "HeartValveReplacement",
  // PacemakerInsertion = "PacemakerInsertion",
  // AorticAneurysmRepair = "AorticAneurysmRepair",

  // Neurological Surgeries
  // BrainTumorRemoval = "BrainTumorRemoval",
  // SpinalCordInjuryRepair = "SpinalCordInjuryRepair",
  // DeepBrainStimulation = "DeepBrainStimulation",
  // Craniotomy = "Craniotomy",

  // Ophthalmic Surgeries
  // CataractSurgery = "CataractSurgery",
  // LASIK = "LASIK",
  // GlaucomaSurgery = "GlaucomaSurgery",
  // RetinalSurgery = "RetinalSurgery",

  // Pediatric Surgeries
  // PediatricCardiacSurgery = "PediatricCardiacSurgery",
  // PediatricOrthopedicSurgery = "PediatricOrthopedicSurgery",
  // PediatricNeurosurgery = "PediatricNeurosurgery",
  // PediatricGeneralSurgery = "PediatricGeneralSurgery",

  // Urologic Surgeries
  // Prostatectomy = "Prostatectomy",
  // KidneyStoneRemoval = "KidneyStoneRemoval",
  // BladderSurgery = "BladderSurgery",
  // Vasectomy = "Vasectomy",

  // Gynecologic Surgeries
  // Hysterectomy = "Hysterectomy",
  // OvarianCystRemoval = "OvarianCystRemoval",
  // EndometriosisSurgery = "EndometriosisSurgery",
  // Myomectomy = "Myomectomy",

  // Thoracic Surgeries
  // LungCancerSurgery = "Lung CancerSurgery",
  // EsophagealSurgery = "EsophagealSurgery",
  // Thoracotomy = "Thoracotomy",
  // Pneumonectomy = "Pneumonectomy",

  // Transplant Surgeries
  // KidneyTransplant = "KidneyTransplant",
  // LiverTransplant = "LiverTransplant",
  // HeartTransplant = "HeartTransplant",
  // LungTransplant = "LungTransplant",

  // ENT Surgeries (Ear, Nose, and Throat)
  // Tonsillectomy = "Tonsillectomy",
  // SinusSurgery = "SinusSurgery",
  // CochlearImplant = "CochlearImplant",
  // ThyroidSurgery = "ThyroidSurgery",

  // Dental Surgeries
  // DentalImplants = "DentalImplants",
  // WisdomToothExtraction = "WisdomToothExtraction",
  // OrthognathicSurgery = "OrthognathicSurgery",
  // RootCanal = "RootCanal",

  // General Surgeries
  // Appendectomy = "Appendectomy",
  // GallbladderRemoval = "GallbladderRemoval",
  // HerniaRepair = "HerniaRepair",
  // BariatricSurgery = "BariatricSurgery"
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
  GeneralSurgeries = "GeneralSurgeries"
  // CosmeticSurgeries = "CosmeticSurgeries",
  // OrthopedicSurgeries = "OrthopedicSurgeries",
  // CardiovascularSurgeries = "CardiovascularSurgeries",
  // NeurologicalSurgeries = "NeurologicalSurgeries",
  // OphthalmicSurgeries = "OphthalmicSurgeries",
  // PediatricSurgeries = "PediatricSurgeries",
  // UrologicSurgeries = "UrologicSurgeries",
  // GynecologicSurgeries = "GynecologicSurgeries",
  // ThoracicSurgeries = "ThoracicSurgeries",
  // TransplantSurgeries = "TransplantSurgeries",
  // ENTSurgeries = "ENTSurgeries",
  // DentalSurgeries = "DentalSurgeries",
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
