import mongoose, { Schema, Document, Model } from "mongoose";

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

// 💡 FIX: Define the unique compound index correctly on the schema
AccountSchema.index({ userId: 1, name: 1 }, { unique: true });

// Use existing model or create new one cleanly
const Account: Model<IAccount> =
  mongoose.models.Account || mongoose.model<IAccount>("Account", AccountSchema);

export default Account;