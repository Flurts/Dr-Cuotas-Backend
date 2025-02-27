import { AdRepository } from "@/databases/postgresql/repos";

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
