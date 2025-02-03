import { Field, InputType } from "type-graphql";
import { SocialMedia } from "../constants/status.enum";

@InputType()
export class SocialMediaInput {
  @Field({ nullable: false })
  type: SocialMedia;

  @Field({ nullable: false })
  link: string;
}
