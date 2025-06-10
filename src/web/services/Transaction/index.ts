import {
  TransacctionsRepository,
  AdjudicatedRepository,
  UserRepository
} from "@/databases/postgresql/repos";
import Transaction, {
  TransactionStatus
} from "@/databases/postgresql/entities/models/transacctions";
import { Adjudicated_Status } from "@/utils/constants/status.enum"; // Update import path to match your code

export async function updateTransactionStatus(
  transactionId: string,
  status: string
  // eslint-disable-next-line @typescript-eslint/naming-convention
): Promise<boolean> {
  try {
    console.log("=== INICIO DE ACTUALIZACIÓN ===");
    console.log(`📌 Transaction ID: ${transactionId}`);
    console.log(`📌 Status recibido: ${status}`);

    // 2. Buscar la transacción
    const transaction = await TransacctionsRepository.findOne({
      where: { id: transactionId }
    });

    if (!transaction) {
      throw new Error(`Transacción no encontrada (ID: ${transactionId})`);
    }

    console.log(`✅ Transacción encontrada | AdjudicadosId: ${transaction.AdjudicadosId}`);

    // 3. Procesar solo si hay un AdjudicadosId
    if (transaction.AdjudicadosId) {
      const adjudicated = await AdjudicatedRepository.findOne({
        where: { id: transaction.AdjudicadosId }
      });

      if (!adjudicated) {
        throw new Error(`Adjudicado no encontrado (ID: ${transaction.AdjudicadosId})`);
      }

      console.log(
        `💰 quota_price del adjudicado: ${adjudicated.quota_price} (Tipo: ${typeof adjudicated.quota_price})`
      );

      // 4. Validar quota_price
      if (!adjudicated.quota_price || adjudicated.quota_price <= 0) {
        throw new Error(`quota_price inválido: ${adjudicated.quota_price}`);
      }

      // 5. Calcular cuotas (solo para status = "paid")
      if (status === "paid") {
        if (transaction.amount === undefined) {
          throw new Error("El monto de la transacción (amount) es undefined");
        }
        const cuotasAPagar = Math.floor(transaction.amount / adjudicated.quota_price);
        const cuotasActuales = adjudicated.quotas_paid ?? 0;
        const nuevasCuotas = cuotasActuales + cuotasAPagar;

        console.log("=== CÁLCULO DE CUOTAS ===");
        console.log(`🔢 quota_price: ${adjudicated.quota_price}`);
        console.log(`💵 Monto de la transacción: ${transaction.amount}`);
        console.log(`➗ División: ${transaction.amount / adjudicated.quota_price}`);
        console.log(`🔽 Math.floor(): ${cuotasAPagar}`);
        console.log(`📊 Cuotas actuales: ${cuotasActuales}`);
        console.log(`✨ Nuevo total (cuotas_paid): ${nuevasCuotas}`);

        adjudicated.quotas_paid = nuevasCuotas;
        adjudicated.adjudicated_status = Adjudicated_Status.Active;
      } else {
        adjudicated.adjudicated_status = Adjudicated_Status.Rejected;
      }

      await AdjudicatedRepository.save(adjudicated);
      console.log("✅ Adjudicado actualizado");
    }

    // 6. Actualizar estado de la transacción
    transaction.status = status === "paid" ? TransactionStatus.SUCCESS : TransactionStatus.REJECTED;
    await TransacctionsRepository.save(transaction);
    console.log("✅ Transacción actualizada");

    return true;
  } catch (error) {
    console.error("❌ Error en updateTransactionStatus:", error);
    throw error;
  }
}

export const createTransaction = async (
  userId: string,
  adjudicatedId: string,
  amount: number
): Promise<Transaction | null> => {
  const userRepository = UserRepository; // Assuming you have a UserRepository similar to other repositories
  const transactionRepository = TransacctionsRepository;
  const randomUUID = crypto.randomUUID(); // Generate a random UUID for the transaction ID
  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    return null;
  }

  const transaction = transactionRepository.create({
    user,
    status: TransactionStatus.PENDING,
    AdjudicadosId: adjudicatedId,
    externalId: `${randomUUID}-Transaction`,
    amount
  });

  await transactionRepository.save(transaction);

  return await transactionRepository.findOne({
    where: { id: transaction.id },
    relations: ["user"] // Add any necessary relations
  });
};
