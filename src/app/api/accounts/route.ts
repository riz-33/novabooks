import { NextResponse } from "next/server";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import connectDB from "@/lib/db";
import mongoose from "mongoose";
import { withAuth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectDB();
    const body = await req.json();
    const { userId, name, type, balance } = body;

    if (!userId || !name || !type) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const existingAccount = await Account.findOne({ userId, name }).session(
      session,
    );
    if (existingAccount) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { error: "Account name already exists" },
        { status: 400 },
      );
    }

    const openingBalance = Number(balance) || 0;

    const [newAccount] = await Account.create(
      [{ userId, name, type, balance: openingBalance }],
      { session },
    );

    if (openingBalance > 0) {
      let equityAccount = await Account.findOne({
        userId,
        type: "Equity",
      }).session(session);

      if (!equityAccount) {
        [equityAccount] = await Account.create(
          [{ userId, name: "Owner's Capital", type: "Equity", balance: 0 }],
          { session },
        );
      }

      const isAssetOrExpense = type === "Asset" || type === "Expense";

      const journalLines = [
        {
          accountId: newAccount._id,
          type: isAssetOrExpense ? ("Debit" as const) : ("Credit" as const),
          amount: openingBalance,
        },
        {
          accountId: equityAccount._id,
          type: isAssetOrExpense ? ("Credit" as const) : ("Debit" as const),
          amount: openingBalance,
        },
      ];

      await Transaction.create(
        [
          {
            description: `Opening Balance for ${name}`,
            date: new Date(),
            userId,
            journalLines,
          },
        ],
        { session },
      );

      equityAccount.balance += openingBalance;
      await equityAccount.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      {
        message: "Account registered and ledger entries balanced successfully",
        account: newAccount,
      },
      { status: 201 },
    );
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error("Account Creation Route Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export const GET = withAuth(async (req: Request, { userId }) => {
  try {
    const accounts = await Account.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ accounts }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
});
