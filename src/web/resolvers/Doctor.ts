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

@Resolver()
class DoctorResolver {
  @Authorized()
  @Mutation(() => Doctor)
  async createNewDoctor(@Ctx() ctx: Context) {
    const response = await createNewDoctor(ctx.auth.userId);
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

  @Authorized()
  @Mutation(() => Doctor)
  async updateInfoDoctor(
    @Arg("profession") profession: string,
    @Arg("status") status: Status,
    @Arg("description", { nullable: true }) description: string,
    @Ctx() ctx: Context
  ) {
    try {
      const user = await UserRepository.findOne({
        where: { id: ctx.auth.userId },
        relations: {
          doctor: true
        }
      });

      if (!user?.doctor) {
        throw new Error("User not found");
      }

      await DoctorRepository.update(user.doctor.id, {
        profession,
        status,
        description
      });

      const response = await DoctorRepository.findOne({
        where: { id: user.doctor.id },
        relations: {
          curriculum: true
        },
        select: {
          profession: true,
          description: true,
          curriculum: {
            id: true,
            file_link: true
          },
          status: true,
          updated_at: true
        }
      });
      return response;
    } catch (error) {
      return error;
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
    const response = await getDoctorFilter({ limit: limit ?? 6, offset: offset ?? 0 });
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
