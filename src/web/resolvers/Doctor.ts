import { Arg, Authorized, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import {
  createNewDoctor,
  getDoctorById,
  getDoctorFilter,
  getDoctorsByName
} from "@services/doctor";
import { Context } from "@/utils/constants";
import { Doctor } from "@/databases/postgresql/entities/models";
import { DoctorRepository, UserRepository } from "@/databases/postgresql/repos";
import { Status } from "@/utils/constants/status.enum";
import { DoctorBasicData } from "@/utils/types/Doctor";
import { DoctorApplicationsRepository } from "@/databases/postgresql/repos/Doctor_Applications";
import { Role } from "@/utils/constants/role.enum";

@Resolver()
class DoctorResolver {
  @Authorized()
  @Mutation(() => Doctor)
  async createNewDoctor(
    @Ctx() ctx: Context,
    @Arg("country", { nullable: true }) country?: string,
    @Arg("province", { nullable: true }) province?: string
  ) {
    const response = await createNewDoctor(ctx.auth.userId, country, province);
    return response;
  }

  @Mutation(() => Boolean)
  async createNewApplicantDoctor(
    @Arg("name") name: string,
    @Arg("email") email: string,
    @Arg("phone") phone: string,
    @Arg("registration_number") registrationNumber: string,
    @Arg("specialty") specialty: string
  ) {
    try {
      const newApplication = DoctorApplicationsRepository.create({
        name,
        email,
        phone,
        registration_number: registrationNumber,
        specialty
      });

      await DoctorApplicationsRepository.save(newApplication);

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  @Mutation(() => Doctor)
  async updateInfoDoctor(
    @Arg("status") status: Status,
    @Arg("description", { nullable: true }) description: string,
    @Arg("doctorId") doctorId: string,
    @Ctx() ctx: Context
  ): Promise<Doctor> {
    try {
      const doctor = await DoctorRepository.findOne({
        where: { id: doctorId },
        relations: { user: true }
      });

      if (!doctor) {
        throw new Error("Doctor not found");
      }

      // Actualizar la información del doctor
      await DoctorRepository.update(doctorId, { status, description });

      // Actualizar el rol del usuario asociado al doctor
      if (doctor.user) {
        await UserRepository.update(doctor.user.id, { role: Role.Doctor }); // Corrección aquí
      }

      // Obtener la información actualizada del doctor
      const updatedDoctor = await DoctorRepository.findOne({
        where: { id: doctorId },
        relations: { curriculum: true, user: true },
        select: ["id", "profession", "description", "status", "updated_at"]
      });

      if (!updatedDoctor) {
        throw new Error("Error retrieving updated doctor");
      }

      return updatedDoctor;
    } catch (error) {
      console.error("Error updating doctor info:", error);
      throw new Error("Failed to update doctor info");
    }
  }

  @Query(() => DoctorBasicData)
  async getDoctor(@Arg("doctorId") doctorId: string) {
    const response = await getDoctorById(doctorId);
    return response;
  }

  @Query(() => [Doctor])
  async getDoctorFilter(
    @Arg("limit", () => Int, { nullable: true }) limit: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number
  ) {
    const response = await getDoctorFilter({
      limit: limit ?? 6,
      offset: offset ?? 0,
      status: Status.Active
    });
    return response;
  }

  @Query(() => [Doctor])
  async getDoctorByStatus(
    @Arg("status") status: Status,
    @Arg("limit", () => Int, { nullable: true }) limit: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number
  ) {
    const response = await DoctorRepository.find({
      where: { status },
      take: limit ?? 6,
      skip: offset ?? 0,
      relations: ["user", "surgeries"] // Agregando las relaciones
    });
    return response;
  }

  @Query(() => [Doctor])
  async getDoctorsByName(
    @Arg("limit", () => Int, { nullable: true }) limit: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("name") name: string
  ) {
    const response = await getDoctorsByName({ limit: limit ?? 6, offset: offset ?? 0, name });
    return response;
  }
}

export default DoctorResolver;
