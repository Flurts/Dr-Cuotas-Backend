import PingResolver from "./Ping";
import FileResolver from "./File";
import UserResolver from "./User";
import DoctorResolver from "./Doctor";
import SurgerieResolver from "./Surgery";
import AdjudicatedResolver from "./Adjudicated";
import EvidenceResolver, { AdResolver } from "./ad";
import Pagos360Resolver from "./pagos360";

export default [
  PingResolver,
  UserResolver,
  FileResolver,
  DoctorResolver,
  SurgerieResolver,
  AdjudicatedResolver,
  AdResolver,
  EvidenceResolver,
  Pagos360Resolver
] as const;
