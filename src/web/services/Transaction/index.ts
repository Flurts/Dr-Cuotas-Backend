import { TransacctionsRepository, AdjudicatedRepository } from "@/databases/postgresql/repos";
import { TransactionStatus } from "@/databases/postgresql/entities/models/transacctions";

export async function updateTransactionStatus(id: string, status: string): Promise<boolean> {
  const transactionRepository = TransacctionsRepository;
  const adjudicatedRepository = AdjudicatedRepository;

  const transaction = await transactionRepository.findOne({ where: { id } });
  if (!transaction) {
    throw new Error("Transacción no encontrada");
  }

  if (status === "paid") {
    transaction.status = TransactionStatus.SUCCESS;
    await transactionRepository.save(transaction);

    if (transaction.AdjudicadosId) {
      let adjudicated = await adjudicatedRepository.findOne({
        where: { id: transaction.AdjudicadosId }
      });

      if (!adjudicated) {
        // Si no existe, creamos un nuevo adjudicado con quotas_paid = 1
        adjudicated = adjudicatedRepository.create({
          id: transaction.AdjudicadosId,
          quotas_paid: 1
        });
      } else {
        // Si ya existe, incrementamos quotas_paid
        adjudicated.quotas_paid! += 1;
      }

      await adjudicatedRepository.save(adjudicated);
    }

    return true;
  }

  if (status === "rejected") {
    transaction.status = TransactionStatus.REJECTED;
    await transactionRepository.save(transaction);
    return true;
  }

  return false;
}
