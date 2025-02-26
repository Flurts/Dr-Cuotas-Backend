import {
  AdjudicatedRepository,
  SurgeryRepository,
  UserRepository
} from "@/databases/postgresql/repos";
import { Context } from "@/utils/constants";
import { Adjudicated_Status, Status } from "@/utils/constants/status.enum";
import { Adjudicated } from "@/databases/postgresql/entities/models";
import { MoreThanOrEqual } from "typeorm";

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
    relations: { adjudicated: true },
    select: {
      adjudicated: {
        id: true,
        status: true,
        adjudicated_status: true
      },
      id: true
    }
  });

  if (!user) return false;

  if (
    user.adjudicated.some(
      (adjudicated) =>
        adjudicated.surgery?.id === surgerieId &&
        (adjudicated.status === Status.Active ||
          adjudicated.adjudicated_status === Adjudicated_Status.Validating ||
          adjudicated.adjudicated_status === Adjudicated_Status.Active ||
          adjudicated.adjudicated_status === Adjudicated_Status.Blocked)
    )
  ) {
    return false;
  }

  const subscribedSurgerie = await SurgeryRepository.findOne({
    where: { id: surgerieId, status: Status.Active },
    relations: ["doctors"]
  });

  if (!subscribedSurgerie) return false;

  const assignedDoctor =
    subscribedSurgerie.doctors.length > 0 ? subscribedSurgerie.doctors[0] : undefined;

  const newAdjudicated = AdjudicatedRepository.create({
    comments: coments,
    status: Status.Active,
    adjudicated_status: Adjudicated_Status.Validating,
    user,
    surgery: subscribedSurgerie,
    ...(assignedDoctor && { doctor: assignedDoctor }) // Solo asigna si existe un doctor
  });

  await AdjudicatedRepository.save(newAdjudicated);

  return true;
};

export const getAllAdjudicated = async (ctx: Context): Promise<Adjudicated[]> => {
  const adjudicatedList = await AdjudicatedRepository.find({
    relations: {
      user: true,
      surgery: true,
      doctor: true
    }
  });
  return adjudicatedList;
};

const calculateTotalPaid = (adjudicated: Adjudicated): number => {
  if (adjudicated.total_price !== null && adjudicated.quotas_number !== null) {
    const quotaPrice = adjudicated.total_price! / adjudicated.quotas_number!;
    return quotaPrice * (adjudicated.quotas_paid ?? 0);
  }
  return 0;
};

export const getAdjudicatedByDoctor = async (
  doctorId: string,
  status: Adjudicated_Status,
  ctx: Context
): Promise<Adjudicated[]> => {
  const adjudicatedList = await AdjudicatedRepository.find({
    where: {
      doctor: { id: doctorId },
      adjudicated_status: status
    },
    relations: {
      user: true,
      surgery: true,
      doctor: true
    }
  });

  const totalPaidSum = adjudicatedList
    .map((adjudicated) => calculateTotalPaid(adjudicated))
    .reduce((sum, current) => sum + current, 0);

  const roundedTotalPaidSum = Math.round(totalPaidSum * 100) / 100; // Redondeo a dos decimales

  const updatedList = adjudicatedList.map((adjudicated) => {
    const totalPaid = Math.round(calculateTotalPaid(adjudicated) * 100) / 100; // Redondeo a dos decimales
    return { ...adjudicated, totalPaid, totalPaidSum: roundedTotalPaidSum };
  });

  return updatedList;
};

export const getEarningsByDoctor = async (
  doctorId: string,
  ctx: Context
): Promise<Adjudicated[]> => {
  const adjudicatedList = await AdjudicatedRepository.find({
    where: { doctor: { id: doctorId } },
    relations: { user: true, surgery: true, doctor: true }
  });

  const totalPaidSum = adjudicatedList
    .map((adjudicated) => calculateTotalPaid(adjudicated))
    .reduce((sum, current) => sum + current, 0);

  const roundedTotalPaidSum = Math.round(totalPaidSum * 100) / 100; // Redondeo a dos decimales

  // Create a single Adjudicated object with roundedTotalPaidSum
  return [
    {
      ...adjudicatedList[0], // Spread first item to maintain Adjudicated type
      totalPaidSum: roundedTotalPaidSum
    }
  ];
};

export const getUserLottery = async (ctx: Context): Promise<Adjudicated[]> => {
  const adjudicatedList = await AdjudicatedRepository.find({
    where: {
      quotas_paid: MoreThanOrEqual(4)
    },
    relations: {
      user: true,
      surgery: true,
      doctor: {
        user: true
      }
    }
  });

  if (adjudicatedList.length === 0) return [];

  // Select random item
  const randomIndex = Math.floor(Math.random() * adjudicatedList.length);
  return [adjudicatedList[randomIndex]];
};

export const getEarnings = async (ctx: Context): Promise<number> => {
  const adjudicatedList = await AdjudicatedRepository.find({
    relations: {
      user: true,
      surgery: true,
      doctor: true
    }
  });

  const totalPaidSum = adjudicatedList
    .map((adjudicated) => calculateTotalPaid(adjudicated))
    .reduce((sum, current) => sum + current, 0);

  return Math.round(totalPaidSum * 100) / 100;
};
