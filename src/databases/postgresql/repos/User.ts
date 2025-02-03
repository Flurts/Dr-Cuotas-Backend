import { connection } from "..";
import { User } from "@entities/models/";

const userRepository = connection.getRepository(User);

export { userRepository as UserRepository };
