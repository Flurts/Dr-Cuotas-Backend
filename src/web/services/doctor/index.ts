import { Doctor } from "@/databases/postgresql/entities/models";
import { DoctorRepository, FileRepository, UserRepository } from "@repositories/index";
import { Status } from "@/utils/constants/status.enum";
import { Like } from "typeorm";
import { File_Type } from "@/utils/constants/file_type.enum";
import { DoctorBasicData } from "@/utils/types/Doctor";

export const createNewDoctor = async (userId: string): Promise<Doctor | null> => {
  const user = await UserRepository.findOneBy({ id: userId });

  if (!user) {
    return null;
  }

  const newDoctor = await DoctorRepository.create({
    user,
    status: Status.Active
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
          social_media: true
        }
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

export const getDoctorFilter = async (filter: {
  limit: number;
  offset: number;
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
