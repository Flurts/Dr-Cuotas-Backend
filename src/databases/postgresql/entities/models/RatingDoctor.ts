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

import User from "@/databases/postgresql/entities/models/User";

@ObjectType()
@Entity()
@Index(["user", "doctorId"], { unique: true }) // Esto asegura que un usuario no califique al mismo doctor más de una vez
class RatingDoctor {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id: string;

  @ManyToOne(() => User, (user: User) => user.ratings, { onDelete: "CASCADE" })
  @Field(() => User)
  user: User;

  @Column()
  @Field({ nullable: true })
  doctorId: string;

  @Column()
  @Field({ nullable: true })
  rating: number;

  @CreateDateColumn()
  @Field({ nullable: true })
  created_at: Date;

  @UpdateDateColumn()
  @Field({ nullable: true })
  updated_at: Date;

  @DeleteDateColumn()
  @Field({ nullable: true })
  deleted_at: Date;
}
export default RatingDoctor;
