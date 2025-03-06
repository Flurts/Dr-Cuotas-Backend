import { registerEnumType } from "type-graphql";

export enum EvidenceType {
  YOUTUBE = "youtube",
  MEDIA = "media"
}

// 🔹 Registra el enum en GraphQL para que Type-GraphQL lo reconozca correctamente
registerEnumType(EvidenceType, {
  name: "EvidenceType",
  description: "Enum para definir el tipo de evidencia (YouTube o Media)"
});
