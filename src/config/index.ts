import dotenv from "dotenv";

dotenv.config();

const config = {
  databases: {
    postgresql: {
      host: process.env.DATABASE_HOST ?? "localhost",
      port: parseInt(process.env.DATABASE_PORT ?? "5432", 10),
      username: process.env.DATABASE_USERNAME ?? "backend",
      password: process.env.DATABASE_PASSWORD ?? "backend",
      database: process.env.DATABASE_NAME ?? "backend"
    }
  },
  web: {
    port: parseInt(process.env.WEB_SERVER_PORT!, 10),
    cookieSecret: process.env.COOKIE_SECRET,
    allowedHosts: ["localhost"],
    appName: process.env.APP_NAME ?? "Backend",
    appUrl: process.env.APP_URL ?? "http://localhost"
  },
  env: {
    isProduction: process.env.NODE_ENV === "production"
  },
  jwt: {
    AT_EXPIRE_HR: process.env.JWT_AT_EXPIRE_HR ?? "1 day",
    RT_EXPIRE_HR: process.env.JWT_RT_EXPIRE_HR ?? "1 day",
    AT_EXPIRE_TS: parseInt(process.env.JWT_AT_EXPIRE_TS ?? "30000", 10),
    RT_EXPIRE_TS: parseInt(process.env.JWT_RT_EXPIRE_TS ?? "86400000", 10)
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    region: process.env.AWS_REGION ?? "",
    ses: {
      apiVersion: process.env.AWS_SES_API_VERSION ?? "2010-12-01"
    },
    bucketName: process.env.AWS_BUCKET_NAME ?? "",
    awsEmail: process.env.AWS_EMAIL_FROM ?? ""
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
  }
};

export default config;
