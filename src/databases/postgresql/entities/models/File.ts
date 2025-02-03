import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeRemove,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { File_Type } from "@/utils/constants/file_type.enum";
import AwsS3Service from "@/services/AWS/s3";
import User from "./User";
import Surgery from "./Surgery";

@ObjectType()
@Entity()
class File_DB {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id: string;

  @Column()
  @Field({ nullable: true })
  file_name: string;

  @Column({
    type: "enum",
    enum: File_Type,
    nullable: false
  })
  @Field(() => File_Type, { defaultValue: File_Type.SURGERY_PHOTOS, nullable: false })
  file_type: File_Type;

  @Column()
  @Field({ nullable: true })
  file_link: string;

  @Column()
  @Field({ nullable: true })
  file_key: string;

  @CreateDateColumn()
  @Field({ nullable: true })
  created_at: Date;

  @UpdateDateColumn()
  @Field({ nullable: true })
  updated_at: Date;

  @DeleteDateColumn()
  @Field({ nullable: true })
  deleted_at: Date;

  @ManyToOne(() => User, (user: User) => user.files, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "user_id" })
  @Field(() => User, { nullable: true })
  user: User;

  @ManyToOne(() => Surgery, (surgery: Surgery) => surgery.files, {
    onDelete: "CASCADE",
    nullable: true
  })
  @JoinColumn({ name: "surgery_id" })
  @Field(() => Surgery, { nullable: true })
  surgery: Surgery;

  @BeforeRemove()
  async beforeRemove() {
    await AwsS3Service.deleteFileFromS3(this.file_key);
  }
}

export default File_DB;
