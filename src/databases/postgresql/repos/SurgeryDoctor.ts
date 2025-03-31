import { connection } from "..";
import SurgeryDoctor from "@entities/models/SurgeryDoctor";

const surgeryDoctorRepository = connection.getRepository(SurgeryDoctor);

export { surgeryDoctorRepository as SurgeryDoctorRepository };
