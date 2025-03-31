import {
  AdjudicatedRepository,
  SurgeryRepository,
  UserRepository,
  DoctorRepository
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
  quotasNumber: number,
  totalPrice: number,
  quotaprice: number,
  coments: string,
  surgerieId: string,
  ctx: Context,
  doctorId?: string // Added optional doctorId parameter
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

  // Find the surgery with its doctor relationships
  const subscribedSurgerie = await SurgeryRepository.findOne({
    where: { id: surgerieId, status: Status.Active },
    relations: ["doctors", "doctors.doctor"]
  });

  if (!subscribedSurgerie) throw new Error("La cirugía no existe o no está activa.");

  // Handle doctor assignment logic
  let selectedDoctor = null;
  if (doctorId) {
    // If doctorId is provided, try to find that doctor
    selectedDoctor = await DoctorRepository.findOne({
      where: { id: doctorId, status: Status.Active }
    });

    if (!selectedDoctor) {
      throw new Error("El doctor seleccionado no existe o no está activo");
    }
  } else {
    // Use default doctor from surgery if no doctorId provided
    const surgeryDoctor = subscribedSurgerie.doctors[0] || null;
    selectedDoctor = surgeryDoctor?.doctor || null;
  }

  const commentsTrimmed = typeof coments === "string" ? coments.trim() : "";

  // Create new adjudication
  const newAdjudicated = AdjudicatedRepository.create({
    comments: commentsTrimmed,
    status: Status.Active,
    adjudicated_status: Adjudicated_Status.Validating,
    user,
    quotas_number: quotasNumber,
    total_price: totalPrice,
    quota_price: quotaprice,
    surgery: subscribedSurgerie,
    ...(selectedDoctor && { doctor: selectedDoctor })
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

export const getAdjudicatedByDoctor = async (ctx: Context): Promise<Adjudicated[]> => {
  try {
    const user = await UserRepository.findOne({
      where: { id: ctx.auth.userId },
      relations: ["doctor"], // Asegurar que obtenemos la relación con Doctor
      select: ["id"]
    });

    if (!user?.doctor) {
      throw new Error("User does not have an associated doctor");
    }

    const doctor = await DoctorRepository.findOne({
      where: { id: user.doctor.id } // Accedemos correctamente al doctor
    });

    if (!doctor) {
      throw new Error("Doctor not found for the given userId");
    }

    // Obtener la lista de adjudicados usando el doctorId encontrado
    const adjudicatedList = await AdjudicatedRepository.find({
      where: {
        doctor: { id: doctor.id }
      },
      relations: ["user", "surgery", "doctor"]
    });

    return adjudicatedList;
  } catch (error) {
    console.error("Error fetching adjudicated by doctor:", error);
    return [];
  }
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
