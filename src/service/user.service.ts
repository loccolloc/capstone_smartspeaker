import { FilterQuery } from "mongoose";
import { omit } from "lodash";
import UserModel, { UserDocument, UserInput } from "../models/user.model";

export async function createUser(input: UserInput) {
  try {
    const user = await UserModel.create(input);

    return omit(user.toJSON(), "password");
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function validatePassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<UserDocument | null> {
    const user = await UserModel.findOne({ email });
  
    if (!user) {
      return null;
    }
  
    const isValid = await user.comparePassword(password);
  
    if (!isValid) return null;
  
    return user; 
  }

export async function findUser(query: FilterQuery<UserDocument>) {
  return UserModel.findOne(query).lean();
}