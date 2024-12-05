import mongoose from "mongoose";
import bcrypt from "bcrypt";


export interface UserInput {
  email: string;
  name: string;
  password: string;
}

const saltWorkFactor = process.env.SALTWORKFACTOR
  ? parseInt(process.env.SALTWORKFACTOR, 10)
  : 10;

export interface UserDocument extends mongoose.Document, UserInput {
  createdAt: Date;
  updatedAt: Date;
  devices: string[];
  otp?: string;          
  otpExpired?: Date;    
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    devices: { type: [String], default: [] },
    otp: { type: String },           
    otpExpired: { type: Date },    
  },
  {
    timestamps: true,  
  }
);

userSchema.pre("save", async function (next) {
  const user = this as UserDocument;

  if (!user.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(saltWorkFactor);
  user.password = await bcrypt.hash(user.password, salt);

  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const user = this as UserDocument;
  return bcrypt.compare(candidatePassword, user.password).catch(() => false);
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
