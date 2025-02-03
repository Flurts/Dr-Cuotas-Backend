import AwsS3Service from "@/services/AWS/s3";
import { FileRepository, UserRepository } from "@/databases/postgresql/repos";
import { File_Type } from "@/utils/constants/file_type.enum";
import { PresignedUrlResponse, UpdateProfileCvResponse } from "@/utils/types/user";

export const getCvFile = async (userId: string): Promise<UpdateProfileCvResponse> => {
  try {
    const user = await UserRepository.findOneBy({ id: userId });

    if (!user) {
      return {
        status: false,
        cv: null
      };
    }

    const cv = await FileRepository.findOneBy({
      file_type: File_Type.CURRICULUM_VITAE,
      user: { id: userId }
    });

    if (cv) {
      return {
        status: true,
        cv: cv.file_link
      };
    } else {
      return {
        status: false,
        cv: null
      };
    }
  } catch (error) {
    console.error("Error getting cv file:", error);
    return {
      status: false,
      cv: null
    };
  }
};

export const generatePresignedUrlCv = async (
  fileType: string,
  userId: string
): Promise<PresignedUrlResponse> => {
  try {
    const user = await UserRepository.findOneBy({ id: userId });

    if (!user) {
      return { status: false, key: "", url: "" };
    }

    // const presignedUrl = await AwsS3Service.generatePresignedUrl(userId, fileType, "cv-files");

    return { status: true, key: "presignedUrl.key", url: "presignedUrl.url " };
  } catch (error) {
    console.error("Error generating presigned url for cv:", error);
    return { status: false, key: "", url: "" };
  }
};

export const saveCurriculumFile = async (
  curriculumLocation: string,
  curriculumKey: string,
  fileType: File_Type,
  userId: string
): Promise<boolean> => {
  try {
    const user = await UserRepository.findOne({
      where: { id: userId },
      relations: ["doctor"]
    });

    if (!user?.doctor) {
      return false;
    }

    const existingCv = await FileRepository.findOneBy({
      file_type: fileType,
      user: { id: userId }
    });

    if (existingCv) {
      // await AwsS3Service.deleteFileFromS3(existingCv.file_key);

      await FileRepository.delete(existingCv.id);
      const newFile = await FileRepository.create({
        file_name: curriculumKey,
        file_type: fileType,
        file_link: curriculumLocation,
        file_key: curriculumKey,
        user
      });
      await FileRepository.save(newFile);

      return true;
    }

    const newFile = await FileRepository.create({
      file_name: curriculumKey,
      file_type: fileType,
      file_link: curriculumLocation,
      file_key: curriculumKey,
      user
    });
    await FileRepository.save(newFile);

    return true;
  } catch (error) {
    console.error("Error uploading cv file:", error);
    return false;
  }
};

export const generatePresignedUrlPaymentImage = async (
  fileType: string,
  userId: string
): Promise<PresignedUrlResponse> => {
  try {
    const user = await UserRepository.findOneBy({ id: userId });

    if (!user) {
      return { status: false, key: "", url: "" };
    }

    // const presignedUrl = await AwsS3Service.generatePresignedUrl(userId, fileType, "files");

    return { status: true, key: "presignedUrl.key", url: "presignedUrl.url" };
  } catch (error) {
    console.error("Error generating presigned url for payment image:", error);
    return { status: false, key: "", url: "" };
  }
};

export const savePaymentImageFile = async (
  paymentImageLocation: string,
  paymentImageKey: string,
  userId: string
): Promise<boolean> => {
  try {
    const user = await UserRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      return false;
    }

    const newFile = await FileRepository.create({
      file_name: paymentImageKey,
      file_type: File_Type.PAYMENT_RECEIPT,
      file_link: paymentImageLocation,
      file_key: paymentImageKey,
      user
    });
    await FileRepository.save(newFile);

    return true;
  } catch (error) {
    console.error("Error uploading payment image file:", error);
    return false;
  }
};
