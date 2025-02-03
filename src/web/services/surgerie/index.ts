import { FileRepository, SurgeryRepository, UserRepository } from "@/databases/postgresql/repos";
import { Context } from "@/utils/constants";
import { Status } from "@/utils/constants/status.enum";
import AwsS3Service from "@/services/AWS/s3";
import { SurgeryInput } from "@/utils/types/Surgery";
import { File_Type } from "@/utils/constants/file_type.enum";
import { SurgeryCategories, SurgeryTypes } from "@/utils/constants/surgery.enum";
import { PresignedUrlResponse } from "@/utils/types/user";
import { File_DB } from "@/databases/postgresql/entities/models";

export const generatePresignedUrlImageSurgery = async (
  fileType: string,
  userId: string
): Promise<PresignedUrlResponse> => {
  try {
    const user = await UserRepository.findOneBy({ id: userId });

    if (!user) {
      return { status: false, key: "", url: "" };
    }

    // const presignedUrl = await AwsS3Service.generatePresignedUrl(userId, fileType, "files");

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

export const createNewSurgerie = async (surgery: SurgeryInput, ctx: Context): Promise<boolean> => {
  try {
    const user = await UserRepository.findOne({
      where: { id: ctx.auth.userId },
      relations: ["doctor"]
    });

    if (!user?.doctor?.id) {
      throw new Error("User is not a doctor");
    }

    const newFile = FileRepository.create({
      file_name: user.doctor.id,
      file_type: File_Type.SURGERY_PHOTOS,
      file_link: surgery.surgeryImageLocation,
      file_key: surgery.surgeryImageKey
    });
    await FileRepository.save(newFile);

    const newSurgerie = await SurgeryRepository.create({
      name: surgery.name,
      description: surgery.description,
      amount: surgery.amount,
      type: SurgeryTypes[surgery.type as unknown as keyof typeof SurgeryTypes],
      category: SurgeryCategories[surgery.category as string as keyof typeof SurgeryCategories],
      status: surgery.status,
      doctor: user.doctor,
      file_banner: newFile
    });
    await SurgeryRepository.save(newSurgerie);

    return true;
  } catch (error) {
    console.error("Error creating new surgerie:", error);
    return false;
  }
};

export const updateSurgerie = async (surgery: SurgeryInput, ctx: Context): Promise<boolean> => {
  try {
    const user = await UserRepository.findOne({
      where: { id: ctx.auth.userId },
      relations: ["doctor"]
    });

    if (!user?.doctor?.id) {
      throw new Error("User is not a doctor");
    }

    const updatedSurgerie = await SurgeryRepository.findOne({
      where: { id: surgery.id },
      relations: {
        file_banner: true
      }
    });

    if (!updatedSurgerie) {
      throw new Error("Surgerie not found");
    }

    let newFile: File_DB | undefined;

    if (surgery.surgeryImageKey && surgery.surgeryImageLocation) {
      await FileRepository.delete(updatedSurgerie.file_banner.id);

      newFile = FileRepository.create({
        file_name: user.doctor.id,
        file_type: File_Type.SURGERY_PHOTOS,
        file_link: surgery.surgeryImageLocation,
        file_key: surgery.surgeryImageKey
      });
      await FileRepository.save(newFile);
    }

    await SurgeryRepository.update(updatedSurgerie.id, {
      ...surgery,
      file_banner: newFile ?? updatedSurgerie.file_banner
    });

    return true;
  } catch (error) {
    throw new Error("Error updating surgerie");
  }
};

export const deleteSurgerie = async (surgery: SurgeryInput, ctx: Context): Promise<boolean> => {
  const user = await UserRepository.findOne({
    where: { id: ctx.auth.userId },
    relations: ["doctor"]
  });

  if (!user?.doctor?.id) {
    return false;
  }

  const deletedSurgerie = await SurgeryRepository.findOne({
    where: { id: surgery.id, doctor: user.doctor }
  });

  if (!deletedSurgerie) {
    return false;
  }

  await SurgeryRepository.update(deletedSurgerie.id, { status: Status.Inactive });
  await SurgeryRepository.softDelete(deletedSurgerie.id);

  return true;
};
