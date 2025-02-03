import { connection } from "..";
import { File_DB } from "@entities/models/";

const fileRepository = connection.getRepository(File_DB);

export { fileRepository as FileRepository };
