import { connection } from "..";
import Ad from "@entities/models/ad";

const adRepository = connection.getRepository(Ad);

export { adRepository as AdRepository };
