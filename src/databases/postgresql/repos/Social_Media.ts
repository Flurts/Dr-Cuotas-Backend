import { connection } from "..";
import { Social_Media } from "@entities/models/";

const socialMediaRepository = connection.getRepository(Social_Media);

export { socialMediaRepository as SocialMediaRepository };
