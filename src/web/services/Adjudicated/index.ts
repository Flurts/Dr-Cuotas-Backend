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
): Promise<Adjudicated> => {
  // Validate user exists and get adjudicated relations
  const user = await UserRepository.findOne({
    where: { id: ctx.auth.userId },
    relations: ["adjudicated", "adjudicated.surgery"],
    select: ["id"]
  });

  if (!user) throw new Error("Usuario no encontrado");

  // Check if user already has an active adjudication for this surgery
  const isAdjudicatedActive =
    user.adjudicated?.some(
      (adjudicated) =>
        adjudicated.surgery?.id === surgerieId &&
        (adjudicated.status === Status.Active ||
          [
            Adjudicated_Status.Validating,
            Adjudicated_Status.Active,
            Adjudicated_Status.Blocked
          ].includes(adjudicated.adjudicated_status))
    ) || false;

  if (isAdjudicatedActive)
    throw new Error("El usuario ya tiene una adjudicación activa para esta cirugía");

  // Find the surgery with its doctor relationships
  const subscribedSurgerie = await SurgeryRepository.findOne({
    where: { id: surgerieId, status: Status.Active },
    relations: ["doctors", "doctors.doctor"]
  });

  if (!subscribedSurgerie) throw new Error("La cirugía no existe o no está activa.");

  // Get doctor from the SurgeryDoctor relationship
  const surgeryDoctor = subscribedSurgerie.doctors[0] || null;
  const assignedDoctor = surgeryDoctor?.doctor || null;

  const commentsTrimmed = typeof coments === "string" ? coments.trim() : "";

  // Create new adjudication
  const newAdjudicated = AdjudicatedRepository.create({
    comments: commentsTrimmed,
    status: Status.Active,
    adjudicated_status: Adjudicated_Status.Validating,
    user,
    surgery: subscribedSurgerie,
    ...(assignedDoctor && { doctor: assignedDoctor })
  });

  // Guardar el objeto
  await AdjudicatedRepository.save(newAdjudicated);

  // Cargar el registro completo y manejar el caso null
  const savedAdjudicated = await AdjudicatedRepository.findOne({
    where: { id: newAdjudicated.id },
    relations: ["user", "surgery", "doctor"]
  });

  if (!savedAdjudicated) {
    throw new Error("Error al recuperar la adjudicación guardada");
  }

  return savedAdjudicated;
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
