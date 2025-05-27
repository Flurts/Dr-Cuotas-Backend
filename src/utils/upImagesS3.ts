import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import config from "@/config";

const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey
  }
});

const AWS_BUCKET = config.aws.bucketName;

export const uploadImageToS3 = async (
  imageBase64: string,
  fileName: string,
  folder: string = "evidence"
): Promise<string> => {
  try {
    let imageType: string;
    let base64Data: string;

    // Verificar si ya tiene el formato data:image
    const dataUrlMatches = imageBase64.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);

    if (dataUrlMatches) {
      // Formato completo: data:image/jpeg;base64,/9j/4AAQ...
      imageType = dataUrlMatches[1];
      base64Data = dataUrlMatches[2];
    } else {
      // Solo el string base64: /9j/4AAQSkZJRgABAQEAYABgAAD...
      // Limpiar cualquier whitespace o salto de línea
      const cleanBase64 = imageBase64.replace(/\s/g, "");

      // Detectar tipo de imagen por los primeros bytes
      if (cleanBase64.startsWith("/9j/")) {
        imageType = "jpeg";
      } else if (cleanBase64.startsWith("iVBORw0KGgo")) {
        imageType = "png";
      } else if (cleanBase64.startsWith("R0lGODlh")) {
        imageType = "gif";
      } else if (cleanBase64.startsWith("UklGR")) {
        imageType = "webp";
      } else {
        // Por defecto asumir jpeg
        imageType = "jpeg";
      }
      base64Data = cleanBase64;
    }

    const imageBuffer = Buffer.from(base64Data, "base64");
    const uniqueFileName = `${folder}/${fileName}.${imageType}`;

    const command = new PutObjectCommand({
      Bucket: AWS_BUCKET,
      Key: uniqueFileName,
      Body: imageBuffer,
      ContentType: `image/${imageType}`,
      CacheControl: "max-age=31536000"
      // ACL: 'public-read' // Descomenta si necesitas acceso público
    });

    await s3Client.send(command);

    return `https://${AWS_BUCKET}.s3.${config.aws.region}.amazonaws.com/${uniqueFileName}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload image to S3");
  }
};
