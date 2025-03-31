import { Query, Resolver, Mutation, Arg, Ctx, InputType, Field, Authorized } from "type-graphql";
import { Context } from "@/utils/constants";
import { getUserData } from "@services/user";
import { TransacctionsRepository, AdjudicatedRepository } from "@/databases/postgresql/repos";
import { TransactionStatus } from "@/databases/postgresql/entities/models/transacctions";
import { Adjudicated_Status } from "@/utils/constants/status.enum";

// Create an InputType for the Payment interface
@InputType()
class PaymentInput {
  @Field()
  description!: string;

  @Field()
  first_due_date!: string;

  @Field()
  first_total!: number;

  @Field({ nullable: true })
  payer_name!: string;

  @Field({ nullable: true })
  external_reference?: string;

  @Field({ nullable: true })
  second_due_date?: string;

  @Field({ nullable: true })
  second_total?: number;

  @Field({ nullable: true })
  adjudicadosId?: string;

  @Field({ nullable: true })
  payer_email?: string;

  @Field({ nullable: true })
  back_url_success?: string;

  @Field({ nullable: true })
  back_url_pending?: string;

  @Field({ nullable: true })
  back_url_rejected?: string;
}

@Resolver()
export default class Pagos360Resolver {
  @Query(() => String)
  ping() {
    return "pong";
  }

  @Authorized("User")
  @Mutation(() => String)
  async createPaymentRequest(
    @Arg("data") data: PaymentInput,
    @Ctx() ctx: Context
  ): Promise<string> {
    if (!ctx.auth?.userId) {
      throw new Error("Usuario no autenticado");
    }

    const userData = await getUserData(ctx.auth.userId);
    const transactionRepository = TransacctionsRepository;
    const formatDate = (date: string) => {
      return date.split("-").reverse().join("-");
    };

    const externalId = crypto.randomUUID();

    const newTransaction = transactionRepository.create({
      id: externalId,
      user: { id: ctx.auth.userId },
      externalId,
      status: TransactionStatus.PENDING,
      AdjudicadosId: data.adjudicadosId
    });

    await transactionRepository.save(newTransaction);

    try {
      const requestData: any = {
        payment_request: {
          ...data,
          first_due_date: formatDate(data.first_due_date),
          second_due_date: data.second_due_date ? formatDate(data.second_due_date) : null,
          external_reference: externalId,
          payer_name: userData.user.first_name ?? "Desconocido",
          payer_email: userData.user.email ?? "sin-correo@example.com"
        }
      };

      // 🚀 Asegurar que "adjudicadosId" nunca se envíe
      delete requestData.payment_request.adjudicadosId;

      console.log("Body enviado a Pagos360:", JSON.stringify(requestData, null, 2));

      const response = await fetch(process.env.PAGOS360_API!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PAGOS360_API_KEY}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(result.checkout_url);

      return result.checkout_url;
    } catch (error) {
      console.error("Error al crear la solicitud de pago:", error);
      throw new Error("No se pudo crear la solicitud de pago");
    }
  }

  @Authorized("Admin")
  @Mutation(() => Boolean)
  async updateTransactionStatus(
    @Arg("id") id: string,
    @Arg("status") status: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    if (!ctx.auth?.userId) {
      throw new Error("Usuario no autenticado");
    }

    const transactionRepository = TransacctionsRepository;
    const adjudicatedRepository = AdjudicatedRepository;

    const transaction = await transactionRepository.findOne({ where: { id } });
    if (!transaction) {
      throw new Error("Transacción no encontrada");
    }

    if (transaction.AdjudicadosId) {
      let adjudicated = await adjudicatedRepository.findOne({
        where: { id: transaction.AdjudicadosId }
      });

      if (!adjudicated) {
        adjudicated = adjudicatedRepository.create();
        adjudicated.id = transaction.AdjudicadosId;
        adjudicated.quotas_paid = status === "paid" ? 1 : 0;
        adjudicated.adjudicated_status =
          status === "paid" ? Adjudicated_Status.Active : Adjudicated_Status.Rejected;
      } else {
        adjudicated.quotas_paid = status === "paid" ? (adjudicated.quotas_paid ?? 0) + 1 : 0;
        adjudicated.adjudicated_status =
          status === "paid" ? Adjudicated_Status.Active : Adjudicated_Status.Rejected;
      }

      await adjudicatedRepository.save(adjudicated);

      const adjudicatedUser = await adjudicatedRepository.findOne({
        where: { id: transaction.AdjudicadosId }
      });
      if (adjudicatedUser?.user) {
        const userId = adjudicatedUser.user;
        const userAdjudicateds = await adjudicatedRepository.find({
          where: { user: userId },
          order: { created_at: "ASC" }
        });

        const oldAdjudicated = userAdjudicateds.find(
          (ad) => !ad.quotas_paid || ad.quotas_paid === 0
        );
        if (oldAdjudicated) {
          await adjudicatedRepository.remove(oldAdjudicated);
        }
      }
    }

    if (status === "paid") {
      transaction.status = TransactionStatus.SUCCESS;
    } else if (status === "rejected") {
      transaction.status = TransactionStatus.REJECTED;
    }

    await transactionRepository.save(transaction);
    return true;
  }
}
