import { Doctor, File_DB } from "@/databases/postgresql/entities/models";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class DoctorBasicData {
  @Field(() => Boolean)
  status: boolean;

  @Field(() => Doctor, { nullable: true })
  doctor: Doctor | null;

  @Field(() => File_DB, { nullable: true }) // Aquí especificamos que el campo puede ser null
  curriculum: File_DB | null;
}
