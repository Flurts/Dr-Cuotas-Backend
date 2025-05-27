import { Resolver, Mutation, Arg, Authorized, Ctx, Query } from "type-graphql";
import {
  PresignedUrlResponse,
  UpdateProfileImageResponse,
  UserDataResponseSingInUp
} from "@/utils/types/user";
import {
  addNewSocialMedia,
  generatePresignedUrlImage,
  getUserData,
  handleGoogleSignInUp,
  login,
  loginWithGoogleToken,
  register,
  saveImageUser,
  updateProfileImage
} from "@services/user";
import { Gender } from "@/utils/constants/gender.enum";
import { Context } from "@/utils/constants";
import { SocialMediaInput } from "@/utils/types/settings";
import { SocialMediaRepository, UserRepository } from "@/databases/postgresql/repos";
import { uploadImageToS3 } from "@/utils/upImagesS3";
import { randomUUID } from "crypto";

// import { File_Type } from "@/utils/constants/file_type.enum";

@Resolver()
class UserResolver {
  @Mutation(() => UserDataResponseSingInUp)
  async login(
    @Arg("phone_email") phoneEmail: string,
    @Arg("password") password: string
  ): Promise<UserDataResponseSingInUp> {
    const response = await login(phoneEmail, password);

    return response;
  }

  //  Sign Up new User
  @Mutation(() => UserDataResponseSingInUp)
  async registerUser(
    @Arg("first_name") firstName: string,
    @Arg("last_name") lastName: string,
    @Arg("phone_email") phoneEmail: string,
    @Arg("password") password: string,
    @Arg("birth_date") birthDate: string,
    @Arg("gender") gender: string
  ): Promise<UserDataResponseSingInUp | null> {
    const response = await register(
      firstName,
      lastName,
      phoneEmail,
      password,
      birthDate,
      gender as Gender
    );
    return response;
  }

  @Mutation(() => Boolean)
  async handleGoogleSignInUp(@Arg("token") token: string) {
    const response = await handleGoogleSignInUp(token);
    return response;
  }

  @Mutation(() => UserDataResponseSingInUp)
  async loginWithGoogleToken(@Arg("token") token: string): Promise<UserDataResponseSingInUp> {
    const response = await loginWithGoogleToken(token);
    return response;
  }

  @Authorized()
  @Query(() => UserDataResponseSingInUp)
  async getUserData(@Ctx() ctx: Context): Promise<UserDataResponseSingInUp> {
    const response = await getUserData(ctx.auth.userId);
    return response;
  }

  @Authorized()
  @Mutation(() => UpdateProfileImageResponse)
  async updateUserProfileImage(
    @Arg("profile_image") profileImage: string,
    @Ctx() ctx: Context
  ): Promise<UpdateProfileImageResponse> {
    try {
      const fileName = `user-${ctx.auth.userId}-${randomUUID()}`;
      const imageUrl = await uploadImageToS3(profileImage, fileName);
      const response = await updateProfileImage(ctx.auth.userId, imageUrl);

      return {
        status: response.success,
        profile_picture: response.profile_picture ?? null
      };
    } catch (error) {
      console.error("Error updating user profile image:", error);
      throw new Error("No se pudo actualizar la imagen de perfil");
    }
  }

  @Authorized()
  @Mutation(() => PresignedUrlResponse)
  async generatePresignedUrlUserImage(
    @Arg("file_type") fileType: string,
    @Ctx() ctx: Context
  ): Promise<PresignedUrlResponse> {
    const response = await generatePresignedUrlImage(fileType, ctx.auth.userId);
    return response;
  }

  @Authorized()
  @Mutation(() => Boolean)
  async saveImageUserS3(
    @Arg("profileImageLocation") profileImageLocation: string,
    @Arg("profileImageKey") profileImageKey: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    const response = await saveImageUser(profileImageLocation, profileImageKey, ctx.auth.userId);
    return response;
  }

  @Authorized()
  @Mutation(() => Boolean)
  async updateProfileSettings(
    @Arg("identification_document") identificationDocument: string,
    @Arg("gender") gender: Gender,
    @Arg("social_media", () => [SocialMediaInput]) socialMedia: SocialMediaInput[],
    @Ctx() ctx: Context
  ): Promise<boolean> {
    try {
      const user = await UserRepository.findOne({
        where: { id: ctx.auth.userId },
        relations: ["social_media"]
      });

      if (!user) {
        return false;
      }

      await UserRepository.update(user.id, {
        identification_document: identificationDocument,
        gender
      });

      user.social_media.forEach(async (socialMediaItem) => {
        const socialMediaInput = socialMedia.find((item) => item.type === socialMediaItem.type);

        if (socialMediaInput) {
          if (socialMediaItem.link !== socialMediaInput.link) {
            await SocialMediaRepository.update(socialMediaItem.id, {
              link: socialMediaInput.link
            });
          }
        }

        return true;
      });

      socialMedia.forEach(async (socialMediaItem) => {
        const socialMediaItemExist = user.social_media.find(
          (item) => item.type === socialMediaItem.type
        );

        if (!socialMediaItemExist) {
          await addNewSocialMedia(socialMediaItem.type, socialMediaItem.link, ctx.auth.userId);
        }

        return true;
      });

      // delete social media
      user.social_media.forEach(async (socialMediaItem) => {
        const socialMediaItemExist = socialMedia.find((item) => item.type === socialMediaItem.type);

        if (!socialMediaItemExist) {
          await SocialMediaRepository.delete(socialMediaItem.id);
        }

        return true;
      });

      return true;
    } catch (error) {
      console.error("Error updating profile settings:", error);
      return false;
    }
  }

  @Authorized()
  @Mutation(() => Boolean)
  async updateAccountSettings(
    @Arg("first_name") firstName: string,
    @Arg("last_name") lastName: string,
    @Arg("email") email: string,
    @Arg("phone") phone: string,
    @Arg("birth_date") birthDate: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    try {
      const user = await UserRepository.findOneBy({ id: ctx.auth.userId });

      if (!user) {
        return false;
      }

      await UserRepository.update(user.id, {
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phone,
        birth_date: new Date(birthDate)
      });

      return true;
    } catch (error) {
      console.error("Error updating account settings:", error);
      return false;
    }
  }
}

export default UserResolver;
