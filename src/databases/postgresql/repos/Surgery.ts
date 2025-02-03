import { connection } from "..";
import { Surgery } from "@entities/models/";

const surgeryRepository = connection.getRepository(Surgery);

export { surgeryRepository as SurgeryRepository };
