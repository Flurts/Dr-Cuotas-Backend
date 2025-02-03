import config from "@/config";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const client = jwksClient({
  jwksUri: "https://www.googleapis.com/oauth2/v3/certs"
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
    } else if (!key) {
      callback(new Error("Signing key not found"));
    } else {
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    }
  });
}

export const verifyGoogleToken = async (token: string): Promise<any> => {
  return await new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        audience: config.google.clientId,
        issuer: ["accounts.google.com", "https://accounts.google.com"],
        algorithms: ["RS256"]
      },
      (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      }
    );
  });
};
