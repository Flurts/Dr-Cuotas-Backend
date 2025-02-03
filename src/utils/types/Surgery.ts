import { Field, InputType } from "type-graphql";
import { Status } from "../constants/status.enum";
import { SurgeryCategories, SurgeryTypes } from "../constants/surgery.enum";

@InputType()
export class SurgeryInput {
  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  amount: number;

  @Field((type) => SurgeryTypes, { nullable: true })
  type: SurgeryTypes;

  @Field((type) => SurgeryCategories, { nullable: true })
  category: SurgeryCategories;

  @Field({ nullable: true })
  surgeryImage?: string;

  @Field({ nullable: true })
  surgeryImageLocation?: string;

  @Field({ nullable: true })
  surgeryImageKey?: string;

  @Field((type) => Status, { nullable: true })
  status: Status;
}
