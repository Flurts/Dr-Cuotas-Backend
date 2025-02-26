import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import Doctor from "./Doctor";
import Surgery from "./Surgery";

@ObjectType()
@Entity()
class SurgeryDoctor {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Doctor, (doctor) => doctor.surgeries, { onDelete: "CASCADE" })
  @Field(() => Doctor)
  @JoinColumn()
  doctor: Doctor;

  @ManyToOne(() => Surgery, (surgery) => surgery.doctors, { onDelete: "CASCADE" })
  @Field(() => Surgery)
  @JoinColumn()
  surgery: Surgery;
}

export default SurgeryDoctor;
