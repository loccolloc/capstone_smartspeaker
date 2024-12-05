import jwt from "jsonwebtoken";
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
export function signJwt(
    object: Object,
    // keyName: "accessTokenPrivateKey" | "refreshTokenPrivateKey",
    keyName: "ACCESSTOKENPRIVATEKEY" | "REFRESHTOKENPRIVATEKEY",
    options?: jwt.SignOptions
  ) {
    
    // const signingKey = config.get<string>(keyName);
    const signingKey = process.env[keyName as keyof NodeJS.ProcessEnv];
    if (!signingKey) {
      throw new Error(`Key not found in environment variables: ${keyName}`);
    }
  
    return jwt.sign(object, signingKey, {
      ...(options && options),
      algorithm: "RS256", 
    });
  }
  export function verifyJwt(
    token: string,
    // keyName: "accessTokenPublicKey" | "refreshTokenPublicKey"
     keyName: "ACCESSTOKENPUBLICKEY" | "REFRESHTOKENPUBLICKEY"
  ) {
   
    // const publicKey = config.get<string>(keyName);
    const publicKey = process.env[keyName as keyof NodeJS.ProcessEnv];
    if (!publicKey) {
      throw new Error(`Key not found in environment variables: ${keyName}`);
    }
    try {
      const decoded = jwt.verify(token, publicKey);
      return {
        valid: true,
        expired: false,
        decoded,
      };
    } catch (e: any) {
      console.error(e);
      return {
        valid: false,
        expired: e.message === "jwt expired",
        decoded: null,
      };
    }
  }