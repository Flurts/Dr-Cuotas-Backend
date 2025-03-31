import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import Doctor from "./Doctor";
import { EvidenceType } from "@/utils/constants/Evidence.enum";

@ObjectType()
@Entity()
class Evidence {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id: string;

  @Column()
  @Field({ nullable: true })
  image: string;

  @Column()
  @Field({ nullable: true })
  link: string;

  @Column({
    type: "enum",
    enum: EvidenceType,
    default: EvidenceType.MEDIA
  })
  @Field(() => EvidenceType, { nullable: false })
  type: EvidenceType;

  @CreateDateColumn()
  @Field({ nullable: true })
  created_at: Date;

  @UpdateDateColumn()
  @Field({ nullable: true })
  updated_at: Date;

  @DeleteDateColumn()
  @Field({ nullable: true })
  deleted_at: Date;

  @ManyToOne(() => Doctor, (doctor) => doctor.evidences, { onDelete: "CASCADE" })
  @Field(() => Doctor)
  doctor: Doctor;
}

export default Evidence;
