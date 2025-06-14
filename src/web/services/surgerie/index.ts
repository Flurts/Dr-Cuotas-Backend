import {
  FileRepository,
  SurgeryRepository,
  UserRepository,
  SurgeryDoctorRepository
} from "@/databases/postgresql/repos";
import { Context } from "@/utils/constants";
import { SurgeryInput } from "@/utils/types/Surgery";
import { File_Type } from "@/utils/constants/file_type.enum";
import {
  SurgeryCategories,
  SurgeryTypes,
  SubSurgeryCategories
} from "@/utils/constants/surgery.enum";
import { PresignedUrlResponse } from "@/utils/types/user";
import { File_DB } from "@/databases/postgresql/entities/models";
import { randomUUID } from "crypto";
import { uploadImageToS3 } from "@/utils/upImagesS3";

const isBase64Image = (image: string): boolean => {
  return typeof image === "string" && image.startsWith("data:image/");
};

/**
 * Sube una imagen a S3 si es base64, si no la devuelve tal cual.
 */
const handleImageUpload = async (image: string, prefix: string): Promise<string> => {
  if (isBase64Image(image)) {
    const fileName = `${prefix}_${Date.now()}_${randomUUID()}`;
    const uploadedUrl = await uploadImageToS3(image, fileName);
    if (!uploadedUrl) {
      throw new Error("Failed to upload image to S3");
    }
    return uploadedUrl;
  }
  return image; // Ya es una URL
};

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
    // Buscar el usuario y validar si es doctor
    const user = await UserRepository.findOne({
      where: { id: ctx.auth.userId },
      relations: ["doctor"]
    });

    if (!user?.doctor) {
      throw new Error("User is not a doctor");
    }

    // Crear primero la cirugía (sin file_banner aún)
    const newSurgerie = SurgeryRepository.create({
      name: surgery.name,
      description: surgery.description,
      amount: surgery.amount,
      type: SurgeryTypes[surgery.type as keyof typeof SurgeryTypes],
      category: SurgeryCategories[surgery.category as keyof typeof SurgeryCategories],
      subcategory: SubSurgeryCategories[surgery.subcategory as keyof typeof SubSurgeryCategories],
      status: surgery.status
    });

    await SurgeryRepository.save(newSurgerie); // Obtenemos el ID aquí

    // Subir imagen a S3
    const externalId = randomUUID();
    const uploadedImageUrl = await handleImageUpload(
      surgery.surgeryImage ?? "",
      `surgery_${user.doctor.id}_${externalId}`
    );

    // Crear el archivo con la relación a la cirugía
    const newFile = FileRepository.create({
      file_name: user.doctor.id,
      file_type: File_Type.SURGERY_PHOTOS,
      file_link: uploadedImageUrl,
      file_key: `surgery_${user.doctor.id}_${externalId}`,
      surgery: newSurgerie // Aquí se asocia el archivo con la cirugía
    });
    await FileRepository.save(newFile);

    // Actualizar la cirugía con el banner (relación al archivo)
    newSurgerie.file_banner = newFile;
    await SurgeryRepository.save(newSurgerie);

    // Relacionar la cirugía con el doctor
    const surgeryDoctor = SurgeryDoctorRepository.create({
      doctor: user.doctor,
      surgery: newSurgerie
    });
    await SurgeryDoctorRepository.save(surgeryDoctor);

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
    where: { id: surgery.id },
    relations: ["doctors"]
  });

  if (!deletedSurgerie) {
    return false;
  }

  // Verifica si el doctor tiene relación con la cirugía
  const isDoctorInSurgery = deletedSurgerie.doctors.some((doc) => doc.id === user.doctor!.id);

  if (!isDoctorInSurgery) {
    return false;
  }

  // Elimina la relación en la tabla intermedia
  await SurgeryDoctorRepository.delete({ surgery: { id: surgery.id } });

  // Elimina la cirugía (soft delete)
  await SurgeryRepository.softRemove(deletedSurgerie);

  return true;
};
