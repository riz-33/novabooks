import mongoose, { Schema, Document, Model } from "mongoose";

// Define the shape of a User in TypeScript
export interface IAccount extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: "Asset" | "Liability" | "Equity" | "Income" | "Expense";
  balance: number;
  createdAt: Date;
}

const AccountSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["Asset", "Liability", "Equity", "Income", "Expense"],
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  createdAt: { type: Date, default: Date.now },
});

// Use existing model or create new one with the IAccount type
const Account: Model<IAccount> =
  mongoose.models.Account ||
  mongoose.model<IAccount>(
    "Account",
    AccountSchema.index({ userId: 1, name: 1 }, { unique: true }),
  );

export default Account;
