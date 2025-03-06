import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  OneToOne,
  OneToMany,
  BeforeSoftRemove
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { Status } from "@/utils/constants/status.enum";
import { File_DB, Adjudicated } from ".";
import {
  SurgeryCategories,
  SurgeryTypes,
  SubSurgeryCategories
} from "@/utils/constants/surgery.enum";
import SurgeryDoctor from "./SurgeryDoctor";

@ObjectType()
@Entity()
class Surgery {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id: string;

  @Column()
  @Field()
  name: string;

  @Column({ type: "text", nullable: true })
  @Field({ nullable: true })
  description: string;

  @Column({ default: 0 })
  @Field()
  rating: number;

  @Column({ type: "float", nullable: false })
  @Field({ nullable: false })
  amount: number;

  @Column({
    type: "enum",
    enum: SurgeryTypes,
    nullable: false
  })
  @Field(() => SurgeryTypes)
  type: SurgeryTypes;

  @Column({
    type: "enum",
    enum: SurgeryCategories,
    nullable: false
  })
  @Field(() => SurgeryCategories)
  category: SurgeryCategories;

  @Field(() => SubSurgeryCategories, { nullable: true })
  @Column({
    type: "enum",
    enum: SubSurgeryCategories,
    nullable: true,
    default: SubSurgeryCategories.Liposuction
  })
  subcategory: SubSurgeryCategories;

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

  // Relaciones
  @OneToOne(() => File_DB, { onDelete: "CASCADE" })
  @Field(() => File_DB, { nullable: true })
  @JoinColumn()
  file_banner: File_DB;

  @OneToMany(() => File_DB, (file) => file.surgery, { nullable: true })
  @Field(() => [File_DB], { nullable: true })
  files: File_DB[];

  @OneToMany(() => SurgeryDoctor, (surgeryDoctor) => surgeryDoctor.surgery, { nullable: true })
  @Field(() => [SurgeryDoctor], { nullable: true })
  doctors: SurgeryDoctor[];

  @OneToMany(() => Adjudicated, (adjudicated) => adjudicated.surgery, { nullable: true })
  @Field(() => [Adjudicated], { nullable: true })
  adjudicateds: Adjudicated[];

  @BeforeSoftRemove()
  async beforeRemove() {
    this.status = Status.Inactive;
  }
}

export default Surgery;
