import { connection } from "..";
import Evidence from "@entities/models/Evidence";

const evidenceRepository = connection.getRepository(Evidence);
export { evidenceRepository as EvidenceRepository };
