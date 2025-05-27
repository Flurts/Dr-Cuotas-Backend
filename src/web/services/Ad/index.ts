import { AdRepository, EvidenceRepository, UserRepository } from "@/databases/postgresql/repos";
import { EvidenceType } from "@/utils/constants/Evidence.enum";
import { Context } from "@/utils/constants";
import { uploadImageToS3 } from "@/utils/upImagesS3";
import { randomUUID } from "crypto";

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

export const createAd = async (image: string, link: string): Promise<boolean> => {
  try {
    const imageUrl = await handleImageUpload(image, "ad");
    const ad = AdRepository.create({ image: imageUrl, link });
    await AdRepository.save(ad);
    return true;
  } catch (error) {
    console.error("Error creating ad:", error);
    return false;
  }
};

export const getAds = async () => {
  const ads = await AdRepository.find();
  return ads;
};

export const updateAd = async (id: string, image: string, link: string): Promise<boolean> => {
  try {
    const ad = await AdRepository.findOne({ where: { id } });
    if (!ad) return false;

    ad.image = await handleImageUpload(image, `ad_${id}`);
    ad.link = link;

    await AdRepository.save(ad);
    return true;
  } catch (error) {
    console.error("Error updating ad:", error);
    return false;
  }
};

export const deleteAd = async (id: string): Promise<boolean> => {
  const ad = await AdRepository.findOne({ where: { id } });
  if (!ad) {
    return false;
  }
  await AdRepository.delete(id);
  return true;
};

export const createEvidence = async (
  evidenceInput: { image: string; link: string; type: EvidenceType },
  ctx: Context
): Promise<boolean> => {
  const externalId = randomUUID();
  try {
    const user = await UserRepository.findOne({
      where: { id: ctx.auth.userId },
      relations: ["doctor"]
    });
    if (!user?.doctor) throw new Error("User is not a doctor");

    const imageUrl = await handleImageUpload(
      evidenceInput.image,
      `evidence_${user.doctor.id}_${externalId}`
    );

    const newEvidence = EvidenceRepository.create({
      image: imageUrl,
      link: evidenceInput.link,
      type: evidenceInput.type,
      doctor: user.doctor
    });

    await EvidenceRepository.save(newEvidence);
    return true;
  } catch (error) {
    console.error("Error creating evidence:", error);
    return false;
  }
};

export const getEvidences = async () => {
  try {
    const evidences = await EvidenceRepository.find({
      relations: ["doctor"] // Incluir la relación doctor
    });
    return evidences;
  } catch (error) {
    console.error("Error fetching evidences:", error);
    throw new Error("Error fetching evidences");
  }
};

export const getEvidencesByDoctor = async (doctorId: string) => {
  try {
    const evidences = await EvidenceRepository.find({
      where: { doctor: { id: doctorId } },
      relations: ["doctor"] // Incluir la relación doctor
    });
    return evidences;
  } catch (error) {
    console.error(`Error fetching evidences for doctor ${doctorId}:`, error);
    throw new Error("Error fetching evidences for the doctor");
  }
};

export const updateEvidence = async (
  id: string,
  image: string,
  link: string,
  type: EvidenceType
): Promise<boolean> => {
  try {
    const evidence = await EvidenceRepository.findOne({ where: { id } });
    if (!evidence) return false;

    evidence.image = await handleImageUpload(image, `evidence_${id}`);
    evidence.link = link;
    evidence.type = type;

    await EvidenceRepository.save(evidence);
    return true;
  } catch (error) {
    console.error("Error updating evidence:", error);
    return false;
  }
};

export const deleteEvidence = async (id: string): Promise<boolean> => {
  const evidence = await EvidenceRepository.findOne({ where: { id } });
  if (!evidence) {
    return false;
  }
  await EvidenceRepository.delete(id);
  return true;
};
