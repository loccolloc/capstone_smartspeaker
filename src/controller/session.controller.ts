import { Request, Response } from "express";
import mongoose from "mongoose"; 

import config from "config";
import {
  createSession,
  findSessions,
  updateSession,
} from "../service/session.service";
import { validatePassword } from "../service/user.service";
import { signJwt } from "../utils/jwt.utils";
import UserToken from "../models/userToken";
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const ACCESSTOKENPRIVATEKEY = process.env.ACCESSTOKENPRIVATEKEY;
export async function createUserSessionHandler(req: Request, res: Response) {
    const user = await validatePassword(req.body);
  
    if (!user) {
      return res.status(401).send("Invalid email or password");
    }
    req.email = user.email; 
   
    const userId = (user._id as mongoose.Types.ObjectId).toString();
  
    
    const session = await createSession(userId, req.get("user-agent") || "");
  
  
    const accessToken = signJwt(
      { ...user.toJSON(), session: session._id.toString() },
      // "accessTokenPrivateKey",
      "ACCESSTOKENPRIVATEKEY",

      { expiresIn: process.env.ACCESSTOKENTTL || '15m' } 
    );
  
    // Tạo refresh token
    const refreshToken = signJwt(
      { ...user.toJSON(), session: session._id.toString() },
      // "refreshTokenPrivateKey",
      "REFRESHTOKENPRIVATEKEY",
      // { expiresIn: config.get<string>("refreshTokenTtl") } // 1 day
      { expiresIn: process.env.REFRESHTOKENTTL || '1y' } 
    );
    await new UserToken({ email: user.email, token: refreshToken }).save();
    return res.send({_id: user._id, accessToken, refreshToken });
  }
  
export async function getUserSessionsHandler(req: Request, res: Response) {
  const userId = res.locals.user._id;

  const sessions = await findSessions({ user: userId, valid: true });

  return res.send(sessions);
}

export async function deleteSessionHandler(req: Request, res: Response) {
  const sessionId = res.locals.user.session;

  await updateSession({ _id: sessionId }, { valid: false });
    await UserToken.updateOne(
      { email: res.locals.user.email },
      { revoked: true }
    )
  return res.send({
    accessToken: null,
    refreshToken: null,
  });
}