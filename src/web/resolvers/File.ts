import { Context } from "@/utils/constants";
import { File_Type } from "@/utils/constants/file_type.enum";
import { Arg, Authorized, Ctx, Mutation, Resolver } from "type-graphql";
import {
  generatePresignedUrlCv,
  generatePresignedUrlPaymentImage,
  getCvFile,
  saveCurriculumFile,
  savePaymentImageFile
} from "@/web/services/file";
import { PresignedUrlResponse, UpdateProfileCvResponse } from "@/utils/types/user";

@Resolver()
class FileResolver {
  @Authorized()
  @Mutation(() => PresignedUrlResponse)
  async generatePresignedUrlCurriculumDoctor(
    @Arg("file_type") fileType: string,
    @Ctx() ctx: Context
  ): Promise<PresignedUrlResponse> {
    const response = await generatePresignedUrlCv(fileType, ctx.auth.userId);
    return response;
  }

  @Authorized()
  @Mutation(() => Boolean)
  async saveCurriculumVitaeDataBase(
    @Arg("file_type") fileType: File_Type,
    @Arg("curriculumKey") curriculumKey: string,
    @Arg("curriculumLocation") curriculumLocation: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    const response = await saveCurriculumFile(
      curriculumLocation,
      curriculumKey,
      fileType,
      ctx.auth.userId
    );
    return response;
  }

  @Mutation(() => UpdateProfileCvResponse)
  async getCvFile(@Arg("user_id") userId: string): Promise<UpdateProfileCvResponse> {
    const response = await getCvFile(userId);
    return response;
  }

  @Authorized()
  @Mutation(() => PresignedUrlResponse)
  async generatePresignedUrlPaymentReceipt(
    @Arg("file_type") fileType: string,
    @Ctx() ctx: Context
  ): Promise<PresignedUrlResponse> {
    const response = await generatePresignedUrlPaymentImage(fileType, ctx.auth.userId);
    return response;
  }

  @Authorized()
  @Mutation(() => Boolean)
  async savePaymentReceiptDataBase(
    @Arg("paymentKey") paymentKey: string,
    @Arg("paymentLocation") paymentLocation: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    const response = await savePaymentImageFile(paymentLocation, paymentKey, ctx.auth.userId);
    return response;
  }
}

export default FileResolver;
