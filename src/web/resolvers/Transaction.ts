import { Resolver, Authorized, Ctx, Mutation, Arg, Query } from "type-graphql";
import Transaction, {
  TransactionStatus
} from "@/databases/postgresql/entities/models/transacctions";
import { Context } from "@/utils/constants";
import { createTransaction } from "../services/Transaction";
import { TransacctionsRepository } from "@/databases/postgresql/repos";

@Resolver()
class TransactionResolver {
  @Authorized("User")
  @Mutation(() => Transaction, { nullable: true })
  async createTransaction(
    @Ctx() ctx: Context,
    @Arg("adjudicatedId") adjudicatedId: string,
    @Arg("amount", () => Number, { defaultValue: 0 }) amount: number
  ): Promise<Transaction | null> {
    return await createTransaction(ctx.auth.userId, adjudicatedId, amount);
  }

  @Authorized()
  @Query(() => [Transaction])
  async getTransactionByStatus(@Arg("status") status: TransactionStatus): Promise<Transaction[]> {
    const adjudicatedList = await TransacctionsRepository.find({
      where: { status },
      relations: ["user", "user.adjudicated", "user.adjudicated.surgery"] // 🔹 Asegura que se incluya la relación
    });
    return adjudicatedList;
  }
}

export default TransactionResolver;
