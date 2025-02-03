import { connection } from "..";
import { Locality } from "@entities/models/";

const localityRepository = connection.getRepository(Locality);

export { localityRepository as LocalityRepository };
