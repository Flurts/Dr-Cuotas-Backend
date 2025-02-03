import AWS from "@/config/awsConfig";
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import { EmailData, EmailDataHtml } from "@/utils/constants/aws_types";

const ses = new AWS.SES({ apiVersion: "2010-12-01" });

const transporter = nodemailer.createTransport({
  SES: { ses, aws: AWS }
});

async function sendEmail(data: EmailData): Promise<void> {
  const params = {
    Destination: { ToAddresses: data.toAddresses },
    Message: {
      Body: { Text: { Data: data.message } },
      Subject: { Data: data.subject }
    },
    Source: data.source
  };

  try {
    await ses.sendEmail(params).promise();
  } catch (error) {
    console.error("Error al enviar el correo electrónico:", error);
    throw error;
  }
}

async function sendEmailWithHTMLFile(
  data: EmailDataHtml,
  htmlFilePath: string,
  replacements: Record<string, string>
): Promise<void> {
  // Leer el contenido del archivo HTML
  let htmlContent = fs.readFileSync(htmlFilePath, { encoding: "utf-8" });

  // Reemplazar los marcadores de posición en el contenido HTML
  Object.keys(replacements).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    htmlContent = htmlContent.replace(regex, replacements[key]);
  });

  // Crear el objeto de parámetros para el envío del correo electrónico
  const params = {
    Destination: { ToAddresses: data.toAddresses },
    Message: {
      Body: { Html: { Data: htmlContent } },
      Subject: { Data: data.subject }
    },
    Source: data.source
  };

  // Crear una nueva instancia de SES y enviar el correo electrónico
  const ses = new AWS.SES({ apiVersion: "2010-12-01" });
  await ses.sendEmail(params).promise();
}

/**
 * Función para enviar un correo electrónico con un archivo adjunto en formato base64.
 * @param data Datos del correo electrónico
 * @param pdfBase64 Contenido del PDF en base64
 * @param fileName Nombre del archivo adjunto
 */
async function sendEmailWithAttachment(data: EmailDataHtml, fileName: string): Promise<void> {
  const mailOptions = {
    from: {
      name: "Backend Team",
      address: data.source
    },
    to: data.toAddresses,
    subject: data.subject,
    text: "Adjunto encontrarás el inventario de productos.",
    html: "<p>Adjunto encontrarás el inventario de productos.</p>",
    attachments: [
      {
        filename: fileName,
        path: path.join(__dirname, `../temp/${fileName}`),
        contentType: "application/pdf"
      }
    ]
  };

  // Enviar el correo electrónico con el archivo adjunto
  await transporter.sendMail(mailOptions);
}

export { sendEmail, sendEmailWithHTMLFile, sendEmailWithAttachment };
