import { get } from "lodash";
import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt.utils";
import { reIssueAccessToken } from "../service/session.service";
import path from 'path';

import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = get(req, "headers.authorization", "").replace(/^Bearer\s/, "").trim();

  let refreshToken = get(req, "headers.x-refresh");

  if (Array.isArray(refreshToken)) {
    refreshToken = refreshToken[0]; 
  }

  if (typeof refreshToken !== "string") {
    refreshToken = ""; 
  }

  if (!accessToken) {
    return next(); 
  }
  
  // const { decoded, expired } = verifyJwt(accessToken, "accessTokenPublicKey");
  const { decoded, expired } = verifyJwt(accessToken, "ACCESSTOKENPUBLICKEY");

  if (decoded) {
    res.locals.user = decoded;
    return next();
  }

  if (expired && refreshToken) {
    const newAccessToken = await reIssueAccessToken({ refreshToken });

    if (newAccessToken) {
      res.setHeader("x-access-token", newAccessToken);
      
      // const result = verifyJwt(newAccessToken as string, "accessTokenPublicKey");
      const result = verifyJwt(newAccessToken as string, "ACCESSTOKENPUBLICKEY");

      if (result.decoded) {
        res.locals.user = result.decoded;
      }
    }
  }

  return next();
};

export default deserializeUser;
