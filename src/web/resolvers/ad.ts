import {
  createAd,
  updateAd,
  deleteAd,
  getAds,
  createEvidence,
  getEvidences,
  getEvidencesByDoctor,
  updateEvidence,
  deleteEvidence
} from "@/web/services/Ad";
import { Arg, Ctx, Mutation, Query, Resolver, Authorized } from "type-graphql";
import AD from "@/databases/postgresql/entities/models/ad";
import { Evidence } from "@/databases/postgresql/entities/models";
import { EvidenceType } from "@/utils/constants/Evidence.enum";
import { Context } from "@/utils/constants";

@Resolver(AD)
export class AdResolver {
  @Authorized("Admin")
  @Mutation(() => Boolean)
  async createAdMutation(@Arg("image") image: string, @Arg("link") link: string): Promise<boolean> {
    return await createAd(image, link);
  }

  @Authorized("Admin")
  @Mutation(() => Boolean)
  async updateAdMutation(
    @Arg("id") id: string,
    @Arg("image") image: string,
    @Arg("link") link: string
  ): Promise<boolean> {
    return await updateAd(id, image, link);
  }

  @Authorized("Admin")
  @Mutation(() => Boolean)
  async deleteAdMutation(@Arg("id") id: string): Promise<boolean> {
    return await deleteAd(id);
  }

  @Query(() => [AD])
  async getAdsQuery(): Promise<AD[]> {
    return await getAds();
  }
}
@Resolver(Evidence)
class EvidenceResolver {
  @Authorized()
  @Query(() => [Evidence])
  async evidences(): Promise<Evidence[]> {
    return await getEvidences();
  }

  @Query(() => [Evidence])
  async evidencesByDoctor(@Arg("doctorId") doctorId: string): Promise<Evidence[]> {
    return await getEvidencesByDoctor(doctorId);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async createEvidence(
    @Arg("image") image: string,
    @Arg("link") link: string,
    @Arg("type", () => EvidenceType) type: EvidenceType,
    @Ctx() ctx: Context // Agregamos el contexto para obtener el doctor
  ): Promise<boolean> {
    return await createEvidence({ image, link, type }, ctx);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async updateEvidence(
    @Arg("id") id: string,
    @Arg("image") image: string,
    @Arg("link") link: string,
    @Arg("type", () => EvidenceType) type: EvidenceType
  ): Promise<boolean> {
    return await updateEvidence(id, image, link, type);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async deleteEvidence(@Arg("id") id: string): Promise<boolean> {
    return await deleteEvidence(id);
  }
}

export default EvidenceResolver;
