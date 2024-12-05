import { Request, Response } from "express";
import { omit } from "lodash";
import { CreateUserInput } from "../schema/user.schema";
import { createUser } from "../service/user.service";
import logger from "../utils/logger";
import { StatusCodes } from 'http-status-codes';
import UserModel from '../models/user.model'
import { ObjectId } from 'mongodb'; 

export async function createUserHandler(
  req: Request<{}, {}, CreateUserInput["body"]>,
  res: Response
) {
  try {
    const user = await createUser(req.body);
    return res.send(user);
    
  } catch (e: any) {
    logger.error(e);
    return res.status(409).send(e.message);
  }
}

export const getUserInfo = async (req: Request, res: Response) => {
  try {
    const userID = req.params.userID;
    if (!ObjectId.isValid(userID)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid userID format!" });
    }
    
    const user = await UserModel.findOne({ _id: new ObjectId(userID) }); 
    if (!user) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Don't have user!" });

    return res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userID = req.params.userID;
    const { name, email } = req.body;

    if (!ObjectId.isValid(userID)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid userID format!" });
    }

    if (!name && !email) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Name or email must be provided to update!" });
    }

    const user = await UserModel.findOne({ _id: new ObjectId(userID) });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found!" });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    return res.status(StatusCodes.OK).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
  }
};