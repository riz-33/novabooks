import { NextResponse } from "next/server";
import Transaction from "@/models/Transaction";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req: Request, { userId }) => {
  try {
    const { searchParams } = new URL(req.url);

    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const startDate = start
      ? new Date(`${start}T00:00:00.000Z`)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const endDate = end ? new Date(`${end}T23:59:59.999Z`) : new Date();

    const transactions = await Transaction.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    })
      .populate("journalLines.accountId", "name type")
      .lean();

    const incomeMap: Record<string, number> = {};
    const expenseMap: Record<string, number> = {};

    for (const tx of transactions) {
      for (const line of tx.journalLines) {
        const account = line.accountId as any;

        if (!account) continue; // Skip if the referenced account was deleted

        const amount = Number(line.amount);

        if (account.type === "Income") {
          if (!incomeMap[account.name]) incomeMap[account.name] = 0;
          if (line.type === "Credit") {
            incomeMap[account.name] += amount;
          } else {
            incomeMap[account.name] -= amount;
          }
        } else if (account.type === "Expense") {
          if (!expenseMap[account.name]) expenseMap[account.name] = 0;
          if (line.type === "Debit") {
            expenseMap[account.name] += amount;
          } else {
            expenseMap[account.name] -= amount;
          }
        }
      }
    }

    const income = Object.entries(incomeMap)
      .filter(([_, amount]) => amount !== 0)
      .map(([name, amount]) => ({ name, amount }));

    const expenses = Object.entries(expenseMap)
      .filter(([_, amount]) => amount !== 0)
      .map(([name, amount]) => ({ name, amount }));

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
});
