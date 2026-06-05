import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Transaction from "@/models/Transaction";
import Account from "@/models/Account";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Set fallback dates if params are omitted (Default: Current Month)
    const startDate = start
      ? new Date(`${start}T00:00:00.000Z`)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const endDate = end ? new Date(`${end}T23:59:59.999Z`) : new Date();

    // 1️⃣ Fetch all transactions for this user within the date scope
    // We populate the nested accountId metadata to inspect the account 'type' and 'name'
    const transactions = await Transaction.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    })
      .populate("journalLines.accountId", "name type")
      .lean();

    // 2️⃣ Initialize aggregators to accumulate totals grouped by account name
    const incomeMap: Record<string, number> = {};
    const expenseMap: Record<string, number> = {};

    // 3️⃣ Core Accounting Loop: Parse dynamic journal splits
    for (const tx of transactions) {
      for (const line of tx.journalLines) {
        const account = line.accountId as any; // Cast populated mongoose document

        if (!account) continue; // Skip if the referenced account was deleted

        const amount = Number(line.amount);

        // Calculate net change based on the normal balance rules of Income / Expenses
        if (account.type === "Income") {
          // Credits increase Income, Debits decrease Income
          if (!incomeMap[account.name]) incomeMap[account.name] = 0;
          if (line.type === "Credit") {
            incomeMap[account.name] += amount;
          } else {
            incomeMap[account.name] -= amount;
          }
        } else if (account.type === "Expense") {
          // Debits increase Expenses, Credits decrease Expenses
          if (!expenseMap[account.name]) expenseMap[account.name] = 0;
          if (line.type === "Debit") {
            expenseMap[account.name] += amount;
          } else {
            expenseMap[account.name] -= amount;
          }
        }
      }
    }

    // 4️⃣ Format maps into structured clean arrays for our frontend map loops
    const income = Object.entries(incomeMap)
      .filter(([_, amount]) => amount !== 0)
      .map(([name, amount]) => ({ name, amount }));

    const expenses = Object.entries(expenseMap)
      .filter(([_, amount]) => amount !== 0)
      .map(([name, amount]) => ({ name, amount }));

    // Calculate absolute totals
    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    return NextResponse.json(
      {
        income,
        expenses,
        netProfit,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Backend P&L Report Generation Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
