import PingResolver from "./Ping";
import FileResolver from "./File";
import UserResolver from "./User";
import DoctorResolver from "./Doctor";
import SurgerieResolver from "./Surgery";
import AdjudicatedResolver from "./Adjudicated";
import { AdResolver } from "./ad";

export default [
  PingResolver,
  UserResolver,
  FileResolver,
  DoctorResolver,
  SurgerieResolver,
  AdjudicatedResolver,
  AdResolver
] as const;
