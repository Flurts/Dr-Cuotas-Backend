import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { Status } from "@/utils/constants/status.enum";
import { User, Adjudicated, File_DB } from ".";
import SurgeryDoctor from "./SurgeryDoctor";

// Doctor entity
@ObjectType()
@Entity()
class Doctor {
  @Field(() => ID, { nullable: true })
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id: string;

  @OneToOne(() => User, (user) => user.doctor, { onDelete: "CASCADE" })
  @Field(() => User, { nullable: true })
  @JoinColumn()
  user?: User;

  @Column({ nullable: true })
  @Field({ nullable: true })
  profession: string;

  @Column({ type: "text", nullable: true })
  @Field({ nullable: true })
  description: string;

  @OneToOne(() => File_DB, { nullable: true, onDelete: "CASCADE" })
  @Field(() => File_DB, { nullable: true })
  @JoinColumn()
  curriculum?: File_DB;

  @Column({
    type: "enum",
    enum: Status,
    nullable: false
  })
  @Field(() => Status, { defaultValue: Status.Active })
  status: Status;

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

  @OneToMany(() => Adjudicated, (adjudicated) => adjudicated.doctor)
  @Field(() => [Adjudicated])
  adjudicateds: Adjudicated[];

  @OneToMany(() => SurgeryDoctor, (surgeryDoctor) => surgeryDoctor.doctor, { nullable: true })
  @Field(() => [SurgeryDoctor], { nullable: true })
  surgeries: SurgeryDoctor[];
}

export default Doctor;
