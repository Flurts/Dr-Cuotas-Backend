import { Field, InputType } from "type-graphql";

@InputType()
export class DateInput {
  @Field()
  day: number;

  @Field()
  month: number;

  @Field()
  year: number;
}
