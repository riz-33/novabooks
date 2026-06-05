import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import connectDB from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get("userId");

    if (!userId) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        userId = decoded.id;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication or User ID is required" },
        { status: 400 },
      );
    }

    const accounts = await Account.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ accounts }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 },
      );
    }

    const deletedAccount = await Account.findByIdAndDelete(accountId);
    if (!deletedAccount) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
