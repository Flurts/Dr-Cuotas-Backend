import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  OneToMany,
  ManyToMany,
  JoinTable
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import bcrypt from "bcrypt";
import { Gender } from "@/utils/constants/gender.enum";
import { Role } from "@/utils/constants/role.enum";
import { Status } from "@/utils/constants/status.enum";
import { Adjudicated, Doctor, File_DB } from ".";
import Social_Media from "./Social_Media";
import Transaction from "./transacctions";

// User entity
@ObjectType()
@Entity()
class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id: string;

  @Column({ type: "varchar", length: 50, unique: true, nullable: true })
  @Field(() => String, { nullable: true }) // Especificar tipo explícitamente
  email: string | null;

  @Column({ type: "varchar", length: 15, unique: true, nullable: true })
  @Field(() => String, { nullable: true }) // Especificar tipo explícitamente
  phone_number: string | null;

  @Column({ type: "varchar", length: 30 })
  @Field(() => String) // Especificar tipo explícitamente
  first_name: string;

  @Column({ type: "varchar", length: 30 })
  @Field(() => String) // Especificar tipo explícitamente
  last_name: string;

  @Column({ type: "timestamp", nullable: true })
  @Field(() => Date, { nullable: true }) // Especificar tipo explícitamente
  birth_date: Date;

  @Column({ type: "varchar", length: 60 }) // Sufficient length to store the encrypted password
  @Field(() => String) // Especificar tipo explícitamente
  password: string;

  @Column({ type: "varchar", nullable: true })
  @Field(() => String, { nullable: true }) // Especificar tipo explícitamente
  identification_document: string;

  @Column({
    type: "enum",
    enum: Gender,
    nullable: false
  })
  @Field(() => Gender, { defaultValue: Gender.PreferNotToSay })
  gender: Gender;

  @Column({ type: "varchar", nullable: true })
  @Field(() => String, { nullable: true }) // Especificar tipo explícitamente
  profile_picture: string;

  @Column({ type: "varchar", nullable: true })
  @Field(() => String, { nullable: true }) // Especificar tipo explícitamente
  profile_picture_key: string;

  @Column({
    type: "enum",
    enum: Role,
    nullable: false
  })
  @Field(() => Role, { defaultValue: Role.User })
  role: Role;

  @Column({
    type: "enum",
    enum: Status,
    nullable: false
  })
  @Field(() => Status, { defaultValue: Status.Active })
  status: Status;

  @Column({ type: "timestamp", nullable: true })
  @Field(() => Date, { nullable: true }) // Especificar tipo explícitamente
  last_access: Date;

  @CreateDateColumn({ type: "timestamp" })
  @Field(() => Date) // Especificar tipo explícitamente
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  @Field(() => Date) // Especificar tipo explícitamente
  updated_at: Date;

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  @Field(() => Date, { nullable: true }) // Especificar tipo explícitamente
  deleted_at: Date;

  @OneToMany(() => Adjudicated, (adjudicated) => adjudicated.user)
  @Field(() => [Adjudicated], { nullable: true })
  adjudicated: Adjudicated[];

  // Relations
  @ManyToMany(() => Social_Media, (socialMedia: Social_Media) => socialMedia.user, {
    nullable: true
  })
  @Field(() => [Social_Media], { nullable: true })
  @JoinTable()
  social_media: Social_Media[];

  @OneToOne(() => Doctor, (doctor) => doctor.user, { nullable: true })
  @Field(() => Doctor, { nullable: true })
  doctor?: Doctor;

  @OneToMany(() => File_DB, (file) => file.user)
  @Field(() => [File_DB], { nullable: true })
  files: File_DB[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  @Field(() => [Transaction], { nullable: true })
  transactions: Transaction[];

  // Method for encrypting the password before inserting it into the database
  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}

export default User;
