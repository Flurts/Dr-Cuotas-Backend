import { TransacctionsRepository, AdjudicatedRepository } from "@/databases/postgresql/repos";
import { TransactionStatus } from "@/databases/postgresql/entities/models/transacctions";
import { Adjudicated_Status } from "@/utils/constants/status.enum"; // Update import path to match your code

export async function updateTransactionStatus(id: string, status: string): Promise<boolean> {
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
      // Create a new entity with the required fields
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

    // Rest of your code remains the same
    const adjudicatedUser = await adjudicatedRepository.findOne({
      where: { id: transaction.AdjudicadosId }
    });
    if (adjudicatedUser?.user) {
      const userId = adjudicatedUser.user;

      const userAdjudicateds = await adjudicatedRepository.find({
        where: { user: userId },
        order: { created_at: "ASC" }
      });

      const oldAdjudicated = userAdjudicateds.find((ad) => !ad.quotas_paid || ad.quotas_paid === 0);
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
