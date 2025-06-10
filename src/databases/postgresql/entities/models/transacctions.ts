import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne
} from "typeorm";
import { ObjectType, Field, ID, registerEnumType } from "type-graphql";
import User from "./User";

export enum TransactionStatus {
  SUCCESS = "success",
  PENDING = "pending",
  REJECTED = "rejected"
}

registerEnumType(TransactionStatus, {
  name: "TransactionStatus"
});

@ObjectType()
@Entity()
class Transaction {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.transactions, { nullable: false })
  user: User;

  @Field(() => String)
  @Column({ type: "varchar", length: 255, unique: true })
  externalId: string;

  @Field(() => Number, { nullable: true }) // <- GraphQL nullable
  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true, // <- PostgreSQL nullable
    default: 0 // Valor por defecto para registros existentes
  })
  amount?: number;

  @Field(() => String, { nullable: true })
  @Column({ type: "varchar", length: 255, nullable: true }) // Debe incluir `nullable: true`
  AdjudicadosId?: string | null;

  @Field(() => TransactionStatus)
  @Column({ type: "enum", enum: TransactionStatus })
  status: TransactionStatus;

  @CreateDateColumn()
  @Field(() => Date)
  created_at: Date;

  @UpdateDateColumn()
  @Field(() => Date)
  updated_at: Date;
}

export default Transaction;
