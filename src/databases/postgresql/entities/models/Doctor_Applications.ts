import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";

// Locality entity
@ObjectType()
@Entity()
class Doctor_Applications {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id: string;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  email: string;

  @Column()
  @Field()
  phone: string;

  @Column()
  @Field()
  registration_number: string;

  @Column()
  @Field()
  specialty: string;

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

export default Doctor_Applications;
