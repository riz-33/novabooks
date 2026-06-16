import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Transaction from "@/models/Transaction";
import Account from "@/models/Account";
import { withAuth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { description, date, journalLines, userId } = body;

    if (!description || !journalLines || journalLines.length === 0 || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 1️⃣ Create and save transaction (triggers Mongoose double-entry balance validation)
    const transaction = new Transaction({
      description,
      date: date || new Date(),
      journalLines,
      userId,
    });

    await transaction.save();

    // 2️⃣ Update corresponding accounting balances
    for (const line of journalLines) {
      const account = await Account.findById(line.accountId);
      if (!account) {
        return NextResponse.json(
          { error: `Account ${line.accountId} not found` },
          { status: 404 },
        );
      }

      const amount = Number(line.amount);

      if (line.type === "Debit") {
        if (account.type === "Asset" || account.type === "Expense") {
          account.balance += amount;
        } else {
          account.balance -= amount;
        }
      } else if (line.type === "Credit") {
        if (account.type === "Asset" || account.type === "Expense") {
          account.balance -= amount;
        } else {
          account.balance += amount;
        }
      }

      await account.save();
    }

    return NextResponse.json(
      { message: "Transaction completed successfully", transaction },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Transaction Error:", error);
    return NextResponse.json(
      { error: error.message || "Server Error" },
      { status: 500 },
    );
  }
}

export const GET = withAuth(async (req: Request, { userId }) => {
  try {
    const transactions = await Transaction.find({ userId })
      .populate("journalLines.accountId", "name type")
      .sort({ date: -1 })
      .lean();

    return NextResponse.json({ transactions }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
});
