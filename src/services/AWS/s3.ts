import AWS from "aws-sdk";
import config from "@/config";

class AwsS3Service {
  private readonly awsConfig: AWS.Config;
  private readonly s3: AWS.S3;

  constructor() {
    this.awsConfig = new AWS.Config({
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      region: config.aws.region
    });

    this.s3 = new AWS.S3();
  }

  public async uploadImageToS3Buffer(
    file: string,
    fileName: string,
    folderName: string
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    // from base64 to buffer
    const buffer = Buffer.from(file.replace(/^data:image\/\w+;base64,/, ""), "base64");

    const params: AWS.S3.PutObjectRequest = {
      Bucket: config.aws.bucketName,
      Key: `${folderName}/${fileName}_${Date.now()}`, // Aquí especificamos la carpeta en la clave (key)
      Body: buffer, // Utilizamos el buffer del archivo directamente
      ACL: "public-read",
      ContentEncoding: "base64", // required
      ContentType: "image/jpeg" // Usamos el tipo de contenido del archivo para ContentType
    };

    return await this.s3.upload(params).promise();
  }

  public async getFileFromS3(key: string): Promise<AWS.S3.GetObjectOutput> {
    const params: AWS.S3.GetObjectRequest = {
      Bucket: config.aws.bucketName,
      Key: key
    };

    return await this.s3.getObject(params).promise();
  }

  public async deleteFileFromS3(key: string): Promise<AWS.S3.DeleteObjectOutput> {
    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: config.aws.bucketName,
      Key: key
    };

    return await this.s3.deleteObject(params).promise();
  }

  public async replaceImageInS3Buffer(
    file: string,
    fileName: string,
    folderName: string,
    key: string
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    try {
      if (key) await this.deleteFileFromS3(key);
      return await this.uploadImageToS3Buffer(file, fileName, folderName);
    } catch (error) {
      console.error("Error replacing image in S3:", error);
      throw error;
    }
  }

  public async uploadPdfToS3Buffer(
    file: string,
    fileName: string,
    folderName: string
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    // from base64 to buffer
    const buffer = Buffer.from(file.replace(/^data:application\/\w+;base64,/, ""), "base64");

    const params: AWS.S3.PutObjectRequest = {
      Bucket: config.aws.bucketName,
      Key: `${folderName}/${fileName}_${Date.now()}`, // Aquí especificamos la carpeta en la clave (key)
      Body: buffer, // Utilizamos el buffer del archivo directamente
      ACL: "public-read",
      ContentEncoding: "base64", // required
      ContentType: "application/pdf" // Usamos el tipo de contenido del archivo para ContentType
    };

    return await this.s3.upload(params).promise();
  }

  public async replacePdfInS3Buffer(
    file: string,
    fileName: string,
    folderName: string,
    key: string
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    try {
      if (key) await this.deleteFileFromS3(key);
      return await this.uploadPdfToS3Buffer(file, fileName, folderName);
    } catch (error) {
      console.error("Error replacing pdf in S3:", error);
      throw error;
    }
  }

  public async generatePresignedUrl(fileName: string, fileType: string, folderName: string) {
    const params = {
      Bucket: config.aws.bucketName,
      Key: `${folderName}/${fileName}_${Date.now()}`,
      ContentType: fileType,
      Expires: 60 // seconds
    };

    const uploadUrl = await this.s3.getSignedUrlPromise("putObject", params);

    return { key: params.Key, url: uploadUrl };
  }
}

export default new AwsS3Service();
