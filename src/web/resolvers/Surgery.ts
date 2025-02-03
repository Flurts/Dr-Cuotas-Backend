import { Context } from "@/utils/constants";
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { In } from "typeorm";
import {
  createNewSurgerie,
  generatePresignedUrlImageSurgery,
  updateSurgerie
} from "@services/surgerie";
import { SurgeryInput } from "@/utils/types/Surgery";
import { Surgery } from "@/databases/postgresql/entities/models";
import { SurgeryRepository, UserRepository } from "@/databases/postgresql/repos";
import { Status } from "@/utils/constants/status.enum";
import { PresignedUrlResponse } from "@/utils/types/user";

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

  @Authorized()
  @Mutation(() => Boolean)
  async createNewSurgerie(@Arg("surgery") surgery: SurgeryInput, @Ctx() ctx: Context) {
    const response = await createNewSurgerie(surgery, ctx);
    return response;
  }

  @Authorized()
  @Mutation(() => Boolean)
  async updateSurgerie(@Arg("surgery") surgery: SurgeryInput, @Ctx() ctx: Context) {
    const response = await updateSurgerie(surgery, ctx);
    return response;
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
        relations: {
          doctor: true
        }
      });

      if (!user?.doctor) {
        throw new Error("User is not a doctor");
      }

      const surgeries = await SurgeryRepository.find({
        where: { id: In(surgeriesId) },
        select: {
          id: true,
          doctor: {
            id: true
          }
        },
        relations: {
          doctor: true
        }
      });

      if (!surgeries) {
        throw new Error("Surgeries not found");
      }

      if (surgeries.some((surgery) => surgery.doctor && surgery.doctor.id !== user.doctor?.id)) {
        throw new Error("You can't delete surgeries that are not yours");
      }

      await SurgeryRepository.softDelete(surgeriesId);

      return true;
    } catch (error) {
      return false;
    }
  }

  @Authorized()
  @Query(() => [Surgery])
  async getSurgeriesDoctorById(@Arg("doctorId") doctorId: string, @Ctx() ctx: Context) {
    const surgeries = await SurgeryRepository.find({
      where: { doctor: { id: doctorId } },
      relations: ["doctor"]
    });

    return surgeries;
  }

  @Authorized()
  @Query(() => [Surgery])
  async getMySurgeries(@Ctx() ctx: Context) {
    const surgeries = await SurgeryRepository.find({
      where: { doctor: { user: { id: ctx.auth.userId } } },
      select: {
        doctor: {
          id: true
        }
      },
      relations: ["doctor"]
    });

    return surgeries;
  }

  @Query(() => Surgery)
  async getSurgerieById(@Arg("id") id: string, @Ctx() ctx: Context) {
    const surgery = await SurgeryRepository.findOne({
      where: { id },
      relations: {
        doctor: true,
        file_banner: true,
        files: true
      }
    });

    return surgery;
  }

  @Authorized()
  @Query(() => [Surgery])
  async getSurgeryStatus(@Arg("status") status: string, @Ctx() ctx: Context) {
    const statusDef: Status = (status as Status) ?? Status.Active;
    const surgeries = await SurgeryRepository.find({
      where: { status: statusDef },
      relations: ["doctor"]
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
        doctor: true,
        file_banner: true
      }
    });

    return surgeries;
  }
}

export default SurgerieResolver;
