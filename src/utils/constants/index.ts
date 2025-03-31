export * from "./country.enum";

export interface Context {
  req: Express.Request;
  res: Express.Response;
  lang: string;
  auth: {
    userId: string;
    sub: string;
    role: string;
  };
}

export interface ContextPayload {
  userId: string;
  sub: string;
  role: string;
}
