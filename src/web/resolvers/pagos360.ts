import { Query, Resolver, Mutation, Arg, Ctx, InputType, Field, Authorized } from "type-graphql";
import { Context } from "@/utils/constants";
import { getUserData } from "@services/user";
import { TransacctionsRepository, AdjudicatedRepository } from "@/databases/postgresql/repos";
import { TransactionStatus } from "@/databases/postgresql/entities/models/transacctions";
import { Adjudicated_Status } from "@/utils/constants/status.enum";
import { randomUUID } from "crypto";

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
  amount?: number;

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
    const externalId = randomUUID();
    const transactionRepository = TransacctionsRepository;
    const formatDate = (date: string) => {
      return date.split("-").reverse().join("-");
    };

    const newTransaction = transactionRepository.create({
      id: externalId,
      user: { id: ctx.auth.userId },
      externalId,
      status: TransactionStatus.PENDING,
      AdjudicadosId: data.adjudicadosId,
      amount: data.amount
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
      delete requestData.payment_request.amount;

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

    // 1. Buscar la transacción
    const transaction = await transactionRepository.findOne({ where: { id } });
    if (!transaction) {
      throw new Error("Transacción no encontrada");
    }

    // 2. Procesar solo si hay un AdjudicadosId
    if (transaction.AdjudicadosId) {
      const adjudicated = await adjudicatedRepository.findOne({
        where: { id: transaction.AdjudicadosId }
      });

      // Si no existe el adjudicado, lanzar error (igual que el service)
      if (!adjudicated) {
        throw new Error(`Adjudicado no encontrado (ID: ${transaction.AdjudicadosId})`);
      }

      // 3. Validar quota_price (igual que el service)
      if (!adjudicated.quota_price || adjudicated.quota_price <= 0) {
        throw new Error(`quota_price inválido: ${adjudicated.quota_price}`);
      }

      // 4. Procesar según el status
      if (status === "paid") {
        // Validar amount
        if (transaction.amount === undefined) {
          throw new Error("El monto de la transacción (amount) es undefined");
        }

        // Calcular cuotas basado en amount / quota_price (igual que el service)
        const cuotasAPagar = Math.floor(transaction.amount / adjudicated.quota_price);
        const cuotasActuales = adjudicated.quotas_paid ?? 0;
        const nuevasCuotas = cuotasActuales + cuotasAPagar;

        adjudicated.quotas_paid = nuevasCuotas;
        adjudicated.adjudicated_status = Adjudicated_Status.Active;
      } else {
        adjudicated.adjudicated_status = Adjudicated_Status.Rejected;
      }

      await adjudicatedRepository.save(adjudicated);
    }

    // 5. Actualizar estado de la transacción
    if (status === "paid") {
      transaction.status = TransactionStatus.SUCCESS;
    } else if (status === "rejected") {
      transaction.status = TransactionStatus.REJECTED;
    }

    await transactionRepository.save(transaction);
    return true;
  }
}
