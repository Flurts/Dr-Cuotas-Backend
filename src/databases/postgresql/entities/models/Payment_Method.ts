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
import { Status } from "@/utils/constants/status.enum";
import { Payment } from ".";

// Payment entity
@ObjectType()
@Entity()
class Payment_Method {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id: string;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  icon_image: string;

  @Column()
  @Field()
  icon_image_key: string;

  @Column()
  @Field()
  type: string;

  @Column({
    type: "enum",
    enum: Status,
    nullable: false
  })
  @Field(() => Status, { defaultValue: Status.Active })
  status: Status;

  @CreateDateColumn()
  @Field()
  created_at: Date;

  @UpdateDateColumn()
  @Field()
  updated_at: Date;

  @DeleteDateColumn()
  @Field({ nullable: true })
  deleted_at: Date;

  // Relations

  @ManyToMany(() => Payment)
  @Field(() => Payment)
  payment: Payment;
}

export default Payment_Method;
