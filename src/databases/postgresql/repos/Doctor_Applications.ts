import { connection } from "..";
import { Doctor_Applications } from "@entities/models/";

const doctorApplicationsRepository = connection.getRepository(Doctor_Applications);

export { doctorApplicationsRepository as DoctorApplicationsRepository };
