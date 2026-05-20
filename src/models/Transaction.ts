import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJournalLine {
  accountId: mongoose.Types.ObjectId;
  type: "Debit" | "Credit";
  amount: number;
}

export interface ITransaction extends Document {
  description: string;
  date: Date;
  userId: mongoose.Types.ObjectId;
  journalLines: IJournalLine[];
  createdAt: Date;
}

const JournalLineSchema = new Schema<IJournalLine>({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  type: {
    type: String,
    enum: ["Debit", "Credit"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, "Amount must be greater than zero"],
  },
});

const TransactionSchema = new Schema<ITransaction>(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    journalLines: {
      type: [JournalLineSchema],
      validate: {
        validator: function (lines: IJournalLine[]) {
          const totalDebit = lines
            .filter((l) => l.type === "Debit")
            .reduce((sum, l) => sum + l.amount, 0);

          const totalCredit = lines
            .filter((l) => l.type === "Credit")
            .reduce((sum, l) => sum + l.amount, 0);

          // Use toFixed to eliminate JavaScript floating-point imprecision bugs
          return totalDebit.toFixed(2) === totalCredit.toFixed(2);
        },
        message: "Total Debit must equal Total Credit",
      },
    },
  },
  { timestamps: true },
);

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
