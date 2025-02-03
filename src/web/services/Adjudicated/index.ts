import {
  AdjudicatedRepository,
  SurgeryRepository,
  UserRepository
} from "@/databases/postgresql/repos";
import { Context } from "@/utils/constants";
import { Adjudicated_Status, Status } from "@/utils/constants/status.enum";

export const subscribeSurgerie = async (
  firstName: string,
  lastName: string,
  documentIdentification: string,
  email: string,
  phone: string,
  coments: string,
  surgerieId: string,
  ctx: Context
): Promise<boolean> => {
  const user = await UserRepository.findOne({
    where: { id: ctx.auth.userId },
    relations: {
      adjudicated: true
    },
    select: {
      adjudicated: {
        id: true
      },
      id: true
    }
  });

  if (!user) {
    return false;
  }

  if (
    user.adjudicated.length > 0 &&
    user.adjudicated.some(
      (adjudicated) =>
        (adjudicated.id === surgerieId && adjudicated.status === Status.Active) ||
        adjudicated.adjudicated_status === Adjudicated_Status.Validating ||
        adjudicated.adjudicated_status === Adjudicated_Status.Active ||
        adjudicated.adjudicated_status === Adjudicated_Status.Blocked
    )
  ) {
    return false;
  }

  const subscribedSurgerie = await SurgeryRepository.findOne({
    where: { id: surgerieId, status: Status.Active },
    relations: {
      doctor: true
    }
  });

  if (!subscribedSurgerie) {
    return false;
  }

  const newAdjudicated = await AdjudicatedRepository.create({
    comments: coments,
    status: Status.Active,
    adjudicated_status: Adjudicated_Status.Validating,
    user,
    doctor: subscribedSurgerie.doctor,
    surgery: subscribedSurgerie
  });

  await AdjudicatedRepository.save(newAdjudicated);

  return true;
};
