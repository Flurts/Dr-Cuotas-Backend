import { Doctor } from "@/databases/postgresql/entities/models";
import {
  DoctorRepository,
  FileRepository,
  UserRepository,
  RatingDoctorRepository
} from "@repositories/index";
import { Status } from "@/utils/constants/status.enum";
import { Like } from "typeorm";
import { File_Type } from "@/utils/constants/file_type.enum";
import { DoctorBasicData } from "@/utils/types/Doctor";

export const createNewDoctor = async (
  userId: string,
  country?: string,
  provincia?: string,
  description?: string
): Promise<Doctor | null> => {
  const user = await UserRepository.findOneBy({ id: userId });

  if (!user) {
    return null;
  }

  const newDoctor = await DoctorRepository.create({
    user,
    status: Status.Inactive,
    country,
    provincia,
    description
  });

  await DoctorRepository.save(newDoctor);

  const doctor = await DoctorRepository.findOneBy({ id: newDoctor.id });
  return doctor;
};

export const getDoctorsByName = async (filter: {
  limit: number;
  offset: number;
  name: string; // Nuevo parámetro para el nombre del doctor
}): Promise<Doctor[]> => {
  try {
    const doctors = await DoctorRepository.find({
      where: {
        status: Status.Active,
        user: {
          first_name: Like(`%${filter.name}%`)
        }
      },
      take: filter.limit,
      skip: filter.offset,
      relations: {
        user: {
          social_media: true
        }
      }
    });
    return doctors;
  } catch (error) {
    console.error("Error fetching doctors by name:", error);
    throw error;
  }
};

export const getDoctorById = async (doctorId: string): Promise<DoctorBasicData> => {
  try {
    const doctor = await DoctorRepository.findOne({
      where: { id: doctorId },
      relations: {
        user: {
          social_media: true,
          ratings: true
        },
        surgeries: true
      }
    });

    if (!doctor) {
      return {
        status: false,
        doctor: null,
        curriculum: null
      };
    }

    const curriculum = await FileRepository.findOne({
      where: { user: { id: doctor.user?.id }, file_type: File_Type.CURRICULUM_VITAE }
    });

    return {
      status: true,
      doctor,
      curriculum
    };
  } catch (error) {
    console.error("Error fetching doctor by id:", error);
    throw error;
  }
};

export interface RatingDoctorResponse {
  status: boolean;
  message: string;
  rating?: number;
}

export const ratingDoctor = async (doctorId: string, userId: string): Promise<boolean> => {
  try {
    const existingRating = await RatingDoctorRepository.findOne({
      where: {
        doctorId,
        user: { id: userId }
      },
      relations: {
        user: true
      }
    });

    if (existingRating) {
      // Si ya existe la calificación, se actualiza
      existingRating.rating += 1;
      await RatingDoctorRepository.save(existingRating);
      return true; // Retorna true si la calificación fue actualizada
    }

    const user = await UserRepository.findOneBy({ id: userId });
    if (!user) {
      return false; // Retorna false si el usuario no fue encontrado
    }

    const newRating = RatingDoctorRepository.create({
      doctorId,
      rating: 1,
      user
    });

    await RatingDoctorRepository.save(newRating);
    return true; // Retorna true si la calificación fue creada
  } catch (error) {
    console.error("Error al registrar o actualizar calificación:", error);
    return false; // Retorna false si ocurre un error
  }
};

export const getDoctorFilter = async (filter: {
  limit: number;
  offset: number;
  status: Status;
}): Promise<Doctor[]> => {
  try {
    const doctors = await DoctorRepository.find({
      where: { status: Status.Active },
      take: filter.limit,
      skip: filter.offset,
      relations: {
        user: {
          social_media: true
        }
      }
    });
    return doctors;
  } catch (error) {
    console.error("Error fetching doctors:", error);
    throw error;
  }
};
