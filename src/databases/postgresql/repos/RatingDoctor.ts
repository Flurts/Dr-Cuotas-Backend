import { connection } from "..";
import RatingDoctor from "@entities/models/ratingDoctor";

const ratingDoctorRepository = connection.getRepository(RatingDoctor);

export { ratingDoctorRepository as RatingDoctorRepository };
