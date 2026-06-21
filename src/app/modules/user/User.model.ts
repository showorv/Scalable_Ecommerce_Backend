import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "user" | "admin";

export interface IUser extends Document {
  _id:          mongoose.Types.ObjectId;
  name:         string;
  email:        string;
  passwordHash?: string;
  googleId?:    string;
  avatar?:      string;
  role:         UserRole;
  isBlocked:    boolean;
  refreshToken?: string;
  createdAt:    Date;
  updatedAt:    Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name:         { type: String, required: true, trim: true, maxlength: 80 },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false }, // for security not returned in queries thats why false
    googleId:     { type: String, sparse: true }, // sparse means can be null but when have any value it should be unique
    avatar:       { type: String },
    role:         { type: String, enum: ["user", "admin"], default: "user" },
    isBlocked:    { type: Boolean, default: false },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);


userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 }, { sparse: true }); //sparse true because it works when has any value

 
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash") || !this.passwordHash) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidate, this.passwordHash);
};

// for clean api response
userSchema.set("toJSON", {
  
  transform(_doc: any, ret: any) {
    delete ret.passwordHash;
    delete ret.refreshToken;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model<IUser>("User", userSchema);
export default User;