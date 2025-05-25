import { connection } from "..";
import RatingDoctor from "@entities/models/RatingDoctor";

const ratingDoctorRepository = connection.getRepository(RatingDoctor);

export { ratingDoctorRepository as RatingDoctorRepository };
