import { connection } from "..";
import CodeReference from "@entities/models/Code_Reference";

const codeReferenceRepository = connection.getRepository(CodeReference);

export { codeReferenceRepository as CodeReferenceRepository };
