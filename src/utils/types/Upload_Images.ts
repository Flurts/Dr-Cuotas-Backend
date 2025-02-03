import { Field, ObjectType } from "type-graphql";
import { File_Type } from "../constants/file_type.enum";

@ObjectType()
export class Upload_Images {
  @Field(() => File_Type)
  file_type: File_Type;

  @Field()
  image: string;
}
