import { Context } from "@/utils/constants";
import { Arg, Authorized, Ctx, Mutation, Query, Resolver, Int } from "type-graphql";
import {
  subscribeSurgerie,
  getAllAdjudicated,
  getAdjudicatedByDoctor,
  getEarningsByDoctor,
  getUserLottery
} from "@services/Adjudicated";
import { AdjudicatedRepository, DoctorRepository } from "@/databases/postgresql/repos";
import { Adjudicated } from "@/databases/postgresql/entities/models";
import { Adjudicated_Status, Status } from "@/utils/constants/status.enum";
import { Between } from "typeorm";
import { addMonths } from "date-fns";

@Resolver()
class AdjudicatedResolver {
  @Authorized()
  @Mutation(() => Adjudicated)
  async subscribeSurgerie(
    @Arg("first_name") firstName: string,
    @Arg("last_name") lastName: string,
    @Arg("document_identification") documentIdentification: string,
    @Arg("quotasNumber", () => Int) quotasNumber: number,
    @Arg("totalPrice") totalPrice: number,
    @Arg("quotaPrice") quotaPrice: number,
    @Arg("email") email: string,
    @Arg("phone") phone: string,
    @Arg("coments", { nullable: true }) coments: string,
    @Arg("surgerieId") surgerieId: string,
    @Arg("doctorId", { nullable: true }) doctorId: string,
    @Ctx() ctx: Context
  ) {
    const response = await subscribeSurgerie(
      firstName,
      lastName,
      documentIdentification,
      email,
      phone,
      quotasNumber,
      totalPrice,
      quotaPrice,
      coments,
      surgerieId,
      ctx,
      doctorId
    );
    return response;
  }

  @Authorized()
  @Mutation(() => Boolean)
  async verifyAdjudicated(@Arg("adjudicatedId") adjudicatedId: string, @Ctx() ctx: Context) {
    const doctor = await DoctorRepository.findOne({
      where: { user: { id: ctx.auth.userId } }
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    const adjudicated = await AdjudicatedRepository.findOne({
      where: { id: adjudicatedId },
      select: ["id", "doctor"],
      relations: ["doctor"]
    });

    if (!adjudicated?.doctor) {
      throw new Error("Adjudicated not found");
    }

    if (adjudicated.doctor.id !== doctor.id) {
      throw new Error("Doctor not authorized to verify this adjudicated");
    }

    await AdjudicatedRepository.update(adjudicatedId, {
      adjudicated_status: Adjudicated_Status.Verified
    });

    return true;
  }

  @Authorized()
  @Mutation(() => Boolean)
  async paymentUpdateAdjudicated(
    @Arg("adjudicatedId") adjudicatedId: string,
    @Arg("quotas_number") quotasNumber: number,
    @Ctx() ctx: Context
  ) {
    const doctor = await DoctorRepository.findOne({
      where: { user: { id: ctx.auth.userId } }
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    const adjudicated = await AdjudicatedRepository.findOne({
      where: { id: adjudicatedId },
      select: ["id"], // No es necesario incluir 'doctor' y 'surgery' aquí porque ya están en relations
      relations: ["doctor", "surgery"] // Agrega la relación con surgery
    });

    if (!adjudicated?.doctor) {
      throw new Error("Adjudicated not found");
    }

    if (adjudicated.doctor.id !== doctor.id) {
      throw new Error("Doctor not authorized to verify this adjudicated");
    }

    const today = new Date();
    const startDatePayment = addMonths(today, 1);
    const endDatePayment = addMonths(startDatePayment, quotasNumber);

    const totalPrice = adjudicated.surgery?.amount ?? 0;
    const quotaPrice = quotasNumber > 0 ? Math.ceil(totalPrice / quotasNumber) : 0;

    await AdjudicatedRepository.update(adjudicatedId, {
      quotas_number: quotasNumber,
      quotas_paid: 0,
      adjudicated_status: Adjudicated_Status.Active,
      total_price: adjudicated.surgery?.amount ?? 0,
      quota_price: quotaPrice,
      start_date_payment: startDatePayment,
      end_date_payment: endDatePayment
    });

    return true;
  }

  @Authorized()
  @Query(() => [Adjudicated])
  async getAllAdjudicated(@Ctx() ctx: Context): Promise<Adjudicated[]> {
    const response = await getAllAdjudicated(ctx);
    console.log(response);
    return response;
  }

  @Authorized()
  @Query(() => [Adjudicated])
  async getMyAdjudicated(@Ctx() ctx: Context): Promise<Adjudicated[]> {
    const adjudicatedList = await AdjudicatedRepository.find({
      where: { user: { id: ctx.auth.userId } },
      relations: {
        surgery: true,
        doctor: {
          user: true
        }
      }
    });

    return adjudicatedList;
  }

  @Authorized()
  @Query(() => [Adjudicated])
  async getAdjudicatedListDoctor(@Ctx() ctx: Context): Promise<Adjudicated[]> {
    const adjudicatedList = await AdjudicatedRepository.find({
      where: { doctor: { user: { id: ctx.auth.userId } } },
      relations: {
        surgery: true,
        doctor: {
          user: true
        },
        user: true
      }
    });

    return adjudicatedList;
  }

  @Authorized()
  @Query(() => [Adjudicated])
  async getAdjudicatedByDoctor(@Ctx() ctx: Context) {
    const response = await getAdjudicatedByDoctor(ctx);
    return response;
  }

  @Authorized()
  @Query(() => [Adjudicated])
  async getEarningsByDoctor(
    @Arg("doctorId") doctorId: string,

    @Ctx() ctx: Context
  ) {
    const response = await getEarningsByDoctor(doctorId, ctx);
    return response;
  }

  @Authorized()
  @Query(() => [Adjudicated])
  async getAdjudicatedByStatus(
    @Arg("status") status: Status,
    @Ctx() ctx: Context
  ): Promise<Adjudicated[]> {
    const adjudicatedList = await AdjudicatedRepository.find({ where: { status } });
    return adjudicatedList;
  }

  @Authorized()
  @Query(() => Adjudicated, { nullable: true })
  async getAdjudicatedById(@Arg("adjudicatedId") adjudicatedId: string, @Ctx() ctx: Context) {
    const adjudicated = await AdjudicatedRepository.findOne({
      where: { id: adjudicatedId },
      relations: {
        doctor: {
          user: true
        },
        surgery: {
          file_banner: true
        },
        user: true
      }
    });

    return adjudicated;
  }

  @Query(() => [Adjudicated])
  async getAdjudicatedByMonthAndYear(
    @Arg("month", () => Number) month: number,
    @Arg("year", () => Number) year: number,
    @Arg("offset", () => Number, { nullable: true, defaultValue: 0 }) offset: number,
    @Arg("limit", () => Number, { nullable: true, defaultValue: 7 }) limit: number,
    @Ctx() ctx: Context
  ): Promise<Adjudicated[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const adjudicatedList = await AdjudicatedRepository.find({
      where: {
        created_at: Between(startDate, endDate)
      },
      relations: {
        user: true,
        surgery: true,
        locality: true
      },
      skip: offset,
      take: limit
    });

    return adjudicatedList;
  }

  @Query(() => [Adjudicated])
  async getUserLottery(@Ctx() ctx: Context): Promise<Adjudicated[]> {
    return await getUserLottery(ctx);
  }
}

export default AdjudicatedResolver;
