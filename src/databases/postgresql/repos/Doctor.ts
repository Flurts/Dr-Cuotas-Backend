import { connection } from "..";
import { Doctor } from "@entities/models/";

const doctorRepository = connection.getRepository(Doctor);

export { doctorRepository as DoctorRepository };
