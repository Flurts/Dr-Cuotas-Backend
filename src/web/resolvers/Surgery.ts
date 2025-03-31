import { Context } from "@/utils/constants";
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { In } from "typeorm";
import { createNewSurgerie, generatePresignedUrlImageSurgery } from "@services/surgerie";
import { SurgeryInput } from "@/utils/types/Surgery";
import { Surgery } from "@/databases/postgresql/entities/models";
import {
  SurgeryRepository,
  UserRepository,
  SurgeryDoctorRepository,
  DoctorRepository
} from "@/databases/postgresql/repos";
import { Status } from "@/utils/constants/status.enum";
import { PresignedUrlResponse } from "@/utils/types/user";
import { SurgeryCategories } from "@/utils/constants/surgery.enum";

@Resolver()
class SurgerieResolver {
  @Authorized()
  @Mutation(() => PresignedUrlResponse)
  async generatePresignedUrlSurgeryImage(
    @Arg("file_type") fileType: string,
    @Ctx() ctx: Context
  ): Promise<PresignedUrlResponse> {
    const response = await generatePresignedUrlImageSurgery(fileType, ctx.auth.userId);
    return response;
  }

  @Authorized(["Admin", "Doctor"])
  @Mutation(() => Boolean)
  async createNewSurgerie(@Arg("surgery") surgery: SurgeryInput, @Ctx() ctx: Context) {
    const response = await createNewSurgerie(surgery, ctx);
    return response;
  }

  @Authorized("Admin")
  @Mutation(() => Boolean)
  async updateSurgerie(
    @Arg("surgeryId") surgeryId: string,
    @Arg("status") status: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    try {
      const existingSurgery = await SurgeryRepository.findOne({
        where: { id: surgeryId }
      });

      if (!existingSurgery) {
        throw new Error("Surgery not found");
      }

      await SurgeryRepository.update(surgeryId, { status: status as Status });

      return true;
    } catch (error) {
      console.error("Error updating surgery status:", error);
      throw new Error("Failed to update surgery status");
    }
  }

  @Authorized("Admin")
  @Mutation(() => Boolean)
  async addDoctorToSurgery(
    @Arg("surgeryId") surgeryId: string,
    @Arg("doctorId") doctorId: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    try {
      // Buscar la cirugía
      const surgery = await SurgeryRepository.findOne({ where: { id: surgeryId } });
      if (!surgery) {
        throw new Error("Surgery not found");
      }

      // Buscar el doctor
      const doctor = await DoctorRepository.findOne({ where: { id: doctorId } });
      if (!doctor) {
        throw new Error("Doctor not found");
      }

      // Verificar si ya existe la relación
      const existingRelation = await SurgeryDoctorRepository.findOne({
        where: { surgery: { id: surgeryId }, doctor: { id: doctorId } }
      });

      if (existingRelation) {
        throw new Error("Doctor is already assigned to this surgery");
      }

      // Crear la relación en SurgeryDoctor
      const newSurgeryDoctor = SurgeryDoctorRepository.create({ surgery, doctor });
      await SurgeryDoctorRepository.save(newSurgeryDoctor);

      return true;
    } catch (error) {
      console.error("Error adding doctor to surgery:", error);
      throw new Error("Failed to add doctor to surgery");
    }
  }

  @Authorized()
  @Mutation(() => Boolean)
  async deleteSurgeries(
    @Arg("surgeriesId", () => [String]) surgeriesId: string[],
    @Ctx() ctx: Context
  ) {
    try {
      const user = await UserRepository.findOne({
        where: { id: ctx.auth.userId },
        relations: { doctor: true }
      });

      if (!user?.doctor) {
        throw new Error("User is not a doctor");
      }

      // Buscar las cirugías con sus doctores
      const surgeries = await SurgeryRepository.find({
        where: { id: In(surgeriesId) },
        relations: { doctors: true } // Ahora es una relación muchos a muchos
      });

      if (surgeries.length === 0) {
        throw new Error("Surgeries not found");
      }

      // Verificar si el usuario tiene permiso para eliminarlas
      const unauthorizedSurgeries = surgeries.filter(
        (surgery) => !surgery.doctors.some((doc) => doc.id === user.doctor?.id)
      );

      if (unauthorizedSurgeries.length > 0) {
        throw new Error("You can't delete surgeries that are not yours");
      }

      // Eliminar las relaciones en la tabla intermedia
      await SurgeryDoctorRepository.delete({ surgery: In(surgeriesId) });

      // Soft delete de las cirugías
      await SurgeryRepository.softDelete(surgeriesId);

      return true;
    } catch (error) {
      console.error("Error deleting surgeries:", error);
      return false;
    }
  }

  @Authorized()
  @Query(() => [Surgery])
  async getSurgeriesDoctorById(@Arg("doctorId") doctorId: string, @Ctx() ctx: Context) {
    const surgeries = await SurgeryRepository.find({
      where: { doctors: { id: doctorId } }, // Cambio para reflejar relación muchos a muchos
      relations: ["doctors"]
    });

    return surgeries;
  }

  @Authorized()
  @Query(() => [Surgery])
  async getMySurgeries(@Ctx() ctx: Context) {
    const user = await UserRepository.findOne({
      where: { id: ctx.auth.userId },
      relations: { doctor: true }
    });

    if (!user?.doctor) {
      throw new Error("User is not a doctor");
    }

    const surgeries = await SurgeryDoctorRepository.find({
      where: { doctor: { id: user.doctor.id } },
      relations: ["surgery"]
    });

    return surgeries.map((surgeryDoctor) => surgeryDoctor.surgery);
  }

  @Query(() => Surgery)
  async getSurgerieById(@Arg("id") id: string, @Ctx() ctx: Context) {
    const surgery = await SurgeryRepository.findOne({
      where: { id },
      relations: {
        doctors: true, // Cambio de "doctor" a "doctors" para reflejar la relación muchos a muchos
        file_banner: true,
        files: true
      }
    });

    return surgery;
  }

  @Query(() => [Surgery])
  async getSurgeryStatus(@Arg("status") status: string, @Ctx() ctx: Context) {
    const statusDef: Status = (status as Status) ?? Status.Active;
    const surgeries = await SurgeryRepository.find({
      where: { status: statusDef }
    });

    return surgeries;
  }

  @Query(() => [Surgery])
  async getAllSurgeriesWithValues(
    @Arg("offset", () => Number, { nullable: true, defaultValue: 0 }) offset: number,
    @Arg("limit", () => Number, { nullable: true, defaultValue: 8 }) limit: number,
    @Ctx() ctx: Context
  ) {
    const surgeries = await SurgeryRepository.find({
      where: { status: Status.Active },
      relations: {
        doctors: {
          doctor: {
            user: true // Relación de user dentro de doctor
          }
        }, // Cambio de "doctor" a "doctors" para reflejar la relación muchos a muchos
        file_banner: true
      },
      skip: offset,
      take: limit
    });

    return surgeries;
  }

  @Authorized()
  @Query(() => [Surgery])
  async getSurgeryCategory(@Arg("category") category: SurgeryCategories, @Ctx() ctx: Context) {
    try {
      const surgeries = await SurgeryRepository.find({
        where: { category },
        relations: ["doctor"]
      });

      return surgeries;
    } catch (error) {
      throw new Error("Error fetching surgeries by category");
    }
  }
}

export default SurgerieResolver;
