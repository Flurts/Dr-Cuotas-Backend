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

@ObjectType()
@Entity()
class AD {
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
export default AD;
