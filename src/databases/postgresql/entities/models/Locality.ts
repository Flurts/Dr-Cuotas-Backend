import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { Adjudicated } from ".";

// Locality entity
@ObjectType()
@Entity()
class Locality {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id: string;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  iso_code: string;

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
  @OneToMany(() => Adjudicated, (adjudicated) => adjudicated.locality)
  @Field(() => [Adjudicated])
  adjudicated: Adjudicated[];
}

export default Locality;
