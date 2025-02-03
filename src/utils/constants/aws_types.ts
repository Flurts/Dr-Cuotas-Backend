export interface EmailDataHtml {
  toAddresses: string[]; // Correos electrónicos de los destinatarios
  subject: string; // Asunto del correo electrónico
  source: string; // Dirección de correo electrónico del remitente
}

export interface EmailData {
  toAddresses: string[]; // Correos electrónicos de los destinatarios
  subject: string; // Asunto del correo electrónico
  message: string; // Cuerpo del mensaje del correo electrónico
  source: string; // Dirección de correo electrónico del remitente
}
