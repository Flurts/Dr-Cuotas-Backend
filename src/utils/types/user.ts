import { User } from "@/databases/postgresql/entities/models";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class UserDataResponseSingInUp {
  @Field(() => User)
  user: User;

  @Field()
  token: string;
}

@ObjectType()
export class UpdateProfileImageResponse {
  @Field(() => Boolean)
  status: boolean;

  @Field(() => String, { nullable: true })
  profile_picture: string | null;
}

@ObjectType()
export class UpdateProfileCvResponse {
  @Field(() => Boolean)
  status: boolean;

  @Field(() => String, { nullable: true })
  cv: string | null;
}

@ObjectType()
export class PresignedUrlResponse {
  @Field(() => Boolean)
  status: boolean;

  @Field(() => String)
  key: string;

  @Field(() => String)
  url: string;
}
