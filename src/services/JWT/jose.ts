import { ContextPayload } from "@/utils/constants";
import config from "../../config";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import * as jose from "jose";

const keyAlgorithm = "RSA-OAEP-256";
const keyEncoding = "A256GCM";
let privateKey: CryptoKey;
let publicKey: CryptoKey;

// Read file content of private key from APP_KEY
const readPrivateKey = async () => {
  if (!existsSync(`./src/keys/${config.web.appName}.pem`)) {
    const keyPair = await jose.generateKeyPair("RSA-OAEP-512", {
      modulusLength: 4096,
      extractable: true
    });
    // Make a chained promise to write the private key and public key to file
    const keyWritePromises = [
      mkdirSync("./src/keys", { recursive: true }),
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      writeFileSync(
        `./src/keys/${config.web.appName}.pem`,
        await jose.exportPKCS8(keyPair.privateKey)
      ),
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      writeFileSync(
        `./src/keys/${config.web.appName}pub.pem`,
        await jose.exportSPKI(keyPair.publicKey)
      )
    ];
    await Promise.all(keyWritePromises);
  }

  privateKey = await jose.importPKCS8(
    readFileSync(`./src/keys/${config.web.appName}.pem`, "utf-8"),
    keyAlgorithm
  );
  publicKey = await jose.importSPKI(
    readFileSync(`./src/keys/${config.web.appName}pub.pem`, "utf-8"),
    keyAlgorithm
  );
};

void readPrivateKey();

const generateJwt = async (payload: ContextPayload, exp: string) => {
  const jwt = await new jose.EncryptJWT(JSON.parse(JSON.stringify(payload)))
    .setProtectedHeader({ alg: keyAlgorithm, enc: keyEncoding })
    .setIssuedAt()
    .setExpirationTime(exp)
    .setAudience(config.web.appUrl)
    .encrypt(publicKey);

  return jwt;
};

const verifyJwt = async (jwt: string) => {
  try {
    const jwtObject = await jose.jwtDecrypt(jwt, privateKey);

    return jwtObject;
  } catch (_) {
    return false;
  }
};

const hashHmac = async (data: string, secret: string, hashalgorithm = "SHA-512") => {
  const enc = new TextEncoder();
  const key = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    {
      name: "HMAC",
      hash: {
        name: hashalgorithm
      }
    },
    false,
    ["sign", "verify"]
  );
  const signature = await window.crypto.subtle.sign("HMAC", key, enc.encode(data));
  const signatureUint = new Uint8Array(signature);
  return Array.prototype.map.call(signatureUint, (x) => x.toString(16).padStart(2, "0")).join("");
};

export { generateJwt, verifyJwt, hashHmac };
