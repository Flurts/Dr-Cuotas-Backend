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
import { Payment_Status } from "@/utils/constants/status.enum";
import Payment_Method from "./Payment_Method";

// Payment entity
@ObjectType()
@Entity()
class Payment {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id: string;

  @ManyToMany(() => Payment_Method)
  @Field(() => Payment_Method)
  payment_method: Payment_Method;

  @Column({
    type: "enum",
    enum: Payment_Status,
    nullable: false
  })
  @Field(() => Payment_Status, { defaultValue: Payment_Status.Pending })
  status: Payment_Status;

  @Column()
  @Field()
  total: number;

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

export default Payment;
