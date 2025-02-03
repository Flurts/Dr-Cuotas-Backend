import { connection } from "..";
import { Adjudicated } from "@entities/models/";

const adjudicatedRepository = connection.getRepository(Adjudicated);

export { adjudicatedRepository as AdjudicatedRepository };
