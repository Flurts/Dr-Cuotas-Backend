import { Query, Resolver, Mutation, Arg, Ctx, InputType, Field, Authorized } from "type-graphql";
import { Context } from "@/utils/constants";
import { getUserData } from "@services/user";
import { TransacctionsRepository } from "@/databases/postgresql/repos";
import { TransactionStatus } from "@/databases/postgresql/entities/models/transacctions";

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

  @Authorized()
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

  @Authorized()
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
    const transaction = await transactionRepository.findOne({ where: { id } });

    if (!transaction) {
      throw new Error("Transacción no encontrada");
    }

    if (status === "paid") {
      transaction.status = TransactionStatus.SUCCESS;
      await transactionRepository.save(transaction);
      return true;
    }

    return false;
  }
}
