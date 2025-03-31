import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { Adjudicated_Status, Status } from "@/utils/constants/status.enum";
import { Doctor, Locality, Surgery, User } from ".";

@ObjectType()
@Entity()
class Adjudicated {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  quota_price?: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  total_price?: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  quotas_number?: number;

  @Field({ nullable: true })
  totalPaid: number;

  @Field({ nullable: true })
  totalPaidSum: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  quotas_paid?: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  date_surgery?: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  start_date_payment?: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  end_date_payment?: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  comments?: string;

  @Column({
    type: "enum",
    enum: Status,
    nullable: false
  })
  @Field(() => Status, { defaultValue: Status.Active, nullable: true })
  status: Status;

  @Column({
    type: "enum",
    enum: Adjudicated_Status,
    nullable: false
  })
  @Field(() => Adjudicated_Status, { defaultValue: Adjudicated_Status.Active, nullable: true })
  adjudicated_status: Adjudicated_Status;

  @CreateDateColumn()
  @Field({ nullable: true })
  created_at: Date;

  @UpdateDateColumn()
  @Field({ nullable: true })
  updated_at: Date;

  @DeleteDateColumn()
  @Field({ nullable: true })
  deleted_at: Date;

  // Relations

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @Field(() => User, { nullable: true })
  @JoinColumn()
  user?: User;

  @ManyToOne(() => Doctor, (doctor) => doctor.adjudicateds)
  @Field(() => Doctor, { nullable: true })
  @JoinColumn()
  doctor?: Doctor;

  @ManyToOne(() => Locality, { onDelete: "CASCADE" })
  @Field(() => Locality, { nullable: true })
  @JoinColumn()
  locality?: Locality;

  @ManyToOne(() => Surgery, (surgery) => surgery.adjudicateds)
  @Field(() => Surgery, { nullable: true })
  @JoinColumn()
  surgery?: Surgery;
}

export default Adjudicated;
