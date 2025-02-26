import { createAd, updateAd, deleteAd, getAds } from "@/web/services/Ad";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import AD from "@/databases/postgresql/entities/models/ad";

@Resolver(AD)
export class AdResolver {
  @Mutation(() => Boolean)
  async createAdMutation(@Arg("image") image: string, @Arg("link") link: string): Promise<boolean> {
    return await createAd(image, link);
  }

  @Mutation(() => Boolean)
  async updateAdMutation(
    @Arg("id") id: string,
    @Arg("image") image: string,
    @Arg("link") link: string
  ): Promise<boolean> {
    return await updateAd(id, image, link);
  }

  @Mutation(() => Boolean)
  async deleteAdMutation(@Arg("id") id: string): Promise<boolean> {
    return await deleteAd(id);
  }

  @Query(() => [AD])
  async getAdsQuery(): Promise<AD[]> {
    return await getAds();
  }
}
