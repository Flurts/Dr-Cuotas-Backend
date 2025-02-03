import { Field, InputType } from "type-graphql";
import { Status } from "../constants/status.enum";

@InputType()
export class newAdjudicatedInput {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  quotas_number: number;

  @Field({ nullable: true })
  quotas_paid: number;

  @Field({ nullable: true })
  date_surgery: Date;

  @Field({ nullable: true })
  date_payment: Date;

  @Field({ nullable: true })
  status: Status;
}
