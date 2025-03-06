import { AdRepository, EvidenceRepository, UserRepository } from "@/databases/postgresql/repos";
import { EvidenceType } from "@/utils/constants/Evidence.enum";
import { Context } from "@/utils/constants";

export const createAd = async (image: string, link: string): Promise<boolean> => {
  const ad = AdRepository.create({
    image,
    link
  });
  await AdRepository.save(ad);
  return true;
};

export const getAds = async () => {
  const ads = await AdRepository.find();
  return ads;
};

export const updateAd = async (id: string, image: string, link: string): Promise<boolean> => {
  const ad = await AdRepository.findOne({ where: { id } });
  if (!ad) {
    return false;
  }
  ad.image = image;
  ad.link = link;
  await AdRepository.save(ad);
  return true;
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
  try {
    // 🔹 Buscar el usuario autenticado y validar si es doctor
    const user = await UserRepository.findOne({
      where: { id: ctx.auth.userId },
      relations: ["doctor"]
    });

    if (!user?.doctor) {
      throw new Error("User is not a doctor");
    }

    // 🔹 Crear la evidencia asociada al doctor
    const newEvidence = EvidenceRepository.create({
      image: evidenceInput.image,
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
  const evidence = await EvidenceRepository.findOne({ where: { id } });
  if (!evidence) {
    return false;
  }
  evidence.image = image;
  evidence.link = link;
  evidence.type = type;
  await EvidenceRepository.save(evidence);
  return true;
};

export const deleteEvidence = async (id: string): Promise<boolean> => {
  const evidence = await EvidenceRepository.findOne({ where: { id } });
  if (!evidence) {
    return false;
  }
  await EvidenceRepository.delete(id);
  return true;
};
