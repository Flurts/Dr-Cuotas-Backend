import config from "@/config";
import { generateJwt } from "@/services/JWT/jose";
import { Gender } from "@/utils/constants/gender.enum";
import { Role } from "@/utils/constants/role.enum";
import { SocialMedia, Status } from "@/utils/constants/status.enum";
import phoneOrEmail from "@/utils/phoneOrEmail";
import {
  PresignedUrlResponse,
  UpdateProfileImageResponse,
  UserDataResponseSingInUp
} from "@/utils/types/user";
import bcrypt from "bcrypt";
import AwsS3Service from "@/services/AWS/s3";
import { UserRepository, SocialMediaRepository } from "@/databases/postgresql/repos";
import { verifyGoogleToken } from "@/services/JWT/google_jwt";
import { randomBytes } from "crypto";

export const login = async (
  phoneEmail: string,
  password: string
): Promise<UserDataResponseSingInUp> => {
  const { isEmailAddress } = phoneOrEmail(phoneEmail);

  // Busca el usuario por su dirección de correo electrónico o número de teléfono en la base de datos
  const user = await UserRepository.findOne({
    where: isEmailAddress ? { email: phoneEmail } : { phone_number: phoneEmail },
    relations: ["doctor", "social_media"]
  });

  if (!user) {
    throw new Error("Correo electrónico o contraseña incorrectos");
  }

  // Verifica si la contraseña proporcionada coincide con la contraseña almacenada
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new Error("Contraseña incorrecta");
  }

  // Genera el token JWT
  const jwt = await generateJwt(
    {
      userId: user.id,
      sub: (user.email ?? user.phone_number)!,
      role: user.role
    },
    config.jwt.AT_EXPIRE_HR
  );

  return {
    user,
    token: jwt
  };
};

export const register = async (
  firstName: string,
  lastName: string,
  phoneEmail: string,
  password: string,
  birthDate: string,
  gender: Gender
): Promise<UserDataResponseSingInUp> => {
  try {
    const { isPhoneNumber, isEmailAddress } = phoneOrEmail(phoneEmail);

    // Crea un nuevo usuario
    const newUser = UserRepository.create({
      first_name: firstName,
      last_name: lastName,
      email: isEmailAddress ? phoneEmail : null,
      phone_number: isPhoneNumber ? phoneEmail : null,
      password,
      birth_date: new Date(birthDate),
      gender,
      role: Role.User,
      status: Status.Active,
      last_access: new Date()
    });

    await UserRepository.save(newUser);

    const jwt = await generateJwt(
      {
        userId: newUser.id,
        sub: (newUser.email ?? newUser.phone_number)!,
        role: newUser.role
      },
      config.jwt.AT_EXPIRE_HR
    );

    return {
      user: newUser,
      token: jwt
    };
  } catch (error) {
    throw new Error(`Error registering user: ${error}`);
  }
};

export const handleGoogleSignInUp = async (token: string): Promise<boolean> => {
  try {
    const decodedToken = await verifyGoogleToken(token);

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { email, name, given_name, family_name, picture } = decodedToken;

    // // Verifica si el usuario ya existe
    const existingUser = await UserRepository.findOne({
      where: { email },
      relations: ["doctor", "social_media"]
    });

    if (existingUser) {
      return true;
    } else {
      // Si el usuario no existe, realiza el registro
      const newUser = UserRepository.create({
        first_name: given_name || name.split(" ")[0],
        last_name: family_name || name.split(" ")[1] || "",
        email,
        phone_number: null,
        password: randomBytes(20).toString("hex"),
        profile_picture: picture,
        birth_date: new Date(), // Ajusta según tus necesidades
        gender: Gender.PreferNotToSay, // Ajusta según tus necesidades
        role: Role.User,
        status: Status.Active,
        last_access: new Date()
      });

      await UserRepository.save(newUser);

      return true;
    }
  } catch (error) {
    throw new Error(`Error handling Google sign-in/up: ${error}`);
  }
};

export const loginWithGoogleToken = async (token: string): Promise<UserDataResponseSingInUp> => {
  try {
    const decodedToken = await verifyGoogleToken(token);

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { email } = decodedToken;

    const user = await UserRepository.findOne({
      where: { email },
      relations: ["doctor", "social_media"]
    });

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Genera el token JWT
    const jwt = await generateJwt(
      {
        userId: user.id,
        sub: (user.email ?? user.phone_number)!,
        role: user.role
      },
      config.jwt.AT_EXPIRE_HR
    );

    return {
      user,
      token: jwt
    };
  } catch (error) {
    console.error("Error logging in with Google token:", error);
    throw new Error(`Error logging in with Google token: ${error}`);
  }
};

export const getUserData = async (userId: string): Promise<UserDataResponseSingInUp> => {
  const user = await UserRepository.findOne({
    where: { id: userId },
    relations: ["doctor", "social_media"]
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  // Genera el token JWT
  const jwt = await generateJwt(
    {
      userId: user.id,
      sub: (user.email ?? user.phone_number)!,
      role: user.role
    },
    config.jwt.AT_EXPIRE_HR
  );

  return {
    user,
    token: jwt
  };
};

export const updateProfileImage = async (
  profileImage: string,
  userId: string
): Promise<UpdateProfileImageResponse> => {
  try {
    const user = await UserRepository.findOneBy({ id: userId });

    if (!user) {
      return {
        status: false,
        profile_picture: null
      };
    }

    if (user.profile_picture !== null && user.profile_picture_key !== null) {
      // const changeImage = await AwsS3Service.replaceImageInS3Buffer(
      //   profileImage,
      //   user.id,
      //   "profile-images",
      //   user.profile_picture_key
      // );

      // if (changeImage) {
      //   await UserRepository.update(user.id, {
      //     profile_picture: changeImage.Location,
      //     profile_picture_key: changeImage.Key
      //   });
      // }

      return {
        status: true,
        // profile_picture: changeImage ? changeImage.Location : null
        profile_picture: user.profile_picture
      };
    } else {
      // const uploadImage = await AwsS3Service.uploadImageToS3Buffer(
      //   profileImage,
      //   user.id,
      //   "profile-images"
      // );

      // if (uploadImage) {
      //   await UserRepository.update(user.id, {
      //     profile_picture: uploadImage.Location,
      //     profile_picture_key: uploadImage.Key
      //   });
      // }

      return {
        status: true,
        // profile_picture: uploadImage ? uploadImage.Location : null
        profile_picture: user.profile_picture
      };
    }
  } catch (error) {
    console.error("Error updating user profile image:", error);
    return {
      status: false,
      profile_picture: null
    };
  }
};

export const generatePresignedUrlImage = async (
  fileType: string,
  userId: string
): Promise<PresignedUrlResponse> => {
  try {
    const user = await UserRepository.findOneBy({ id: userId });

    if (!user) {
      return { status: false, key: "", url: "" };
    }

    // const presignedUrl = await AwsS3Service.generatePresignedUrl(
    //   userId,
    //   fileType,
    //   "profile-images"
    // );

    return {
      status: true,
      key: "presignedUrl.key",
      url: "presignedUrl.url"
      // ...presignedUrl
    };
  } catch (error) {
    console.error("Error updating user profile image:", error);
    return { status: false, key: "", url: "" };
  }
};

export const saveImageUser = async (
  profileImageLocation: string,
  profileImageKey: string,
  userId: string
): Promise<boolean> => {
  try {
    const user = await UserRepository.findOneBy({ id: userId });

    if (!user) {
      return false;
    }

    if (user.profile_picture !== null && user.profile_picture_key !== null) {
      // await AwsS3Service.deleteFileFromS3(user.profile_picture_key);

      await UserRepository.update(user.id, {
        profile_picture: profileImageLocation,
        profile_picture_key: profileImageKey
      });

      return true;
    } else {
      await UserRepository.update(user.id, {
        profile_picture: profileImageLocation,
        profile_picture_key: profileImageKey
      });

      return true;
    }
  } catch (error) {
    console.error("Error saving image user:", error);
    return false;
  }
};

export const addNewSocialMedia = async (
  socialMedia: SocialMedia,
  link: string,
  userId: string
): Promise<boolean> => {
  try {
    const user = await UserRepository.findOne({
      where: { id: userId },
      relations: ["social_media"]
    });

    if (!user) {
      return false;
    }

    const newSocialMedia = SocialMediaRepository.create({
      link,
      type: socialMedia,
      status: Status.Active
    });

    user.social_media = [...(user.social_media || []), newSocialMedia];

    await SocialMediaRepository.save(newSocialMedia);
    await UserRepository.save(user);

    return true;
  } catch (error) {
    console.error("Error adding new social media:", error);
    return false;
  }
};
