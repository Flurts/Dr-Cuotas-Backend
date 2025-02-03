import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { SocialMedia, Status } from "@/utils/constants/status.enum";
import User from "./User";

// Payment entity
@ObjectType()
@Entity()
class Social_Media {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id: string;

  @Column({
    type: "enum",
    enum: SocialMedia,
    nullable: false
  })
  @Field(() => SocialMedia, { defaultValue: SocialMedia.Facebook })
  type: SocialMedia;

  @Column({ length: 100 })
  @Field()
  link: string;

  @Column({
    type: "enum",
    enum: Status,
    nullable: false
  })
  @Field(() => Status, { defaultValue: Status.Active })
  status: Status;

  @ManyToMany(() => User, (user) => user.social_media, { onDelete: "CASCADE", nullable: true })
  @Field(() => [User], { nullable: true })
  user?: User;

  @CreateDateColumn()
  @Field()
  created_at: Date;

  @UpdateDateColumn()
  @Field()
  updated_at: Date;

  @DeleteDateColumn()
  @Field({ nullable: true })
  deleted_at: Date;
}

export default Social_Media;
