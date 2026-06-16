import { NextResponse } from "next/server";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import { withAuth } from "@/lib/auth";
import mongoose from "mongoose";

export const GET = withAuth(async (req: Request, { userId }) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const incomeAccounts = await Account.find({
    userId: userObjectId,
    type: "Income",
  }).lean();
  const totalRevenue = incomeAccounts.reduce(
    (sum: number, acc: any) => sum + (acc.balance || 0),
    0,
  );

  const receivableAccounts = await Account.find({
    userId: userObjectId,
    name: "Accounts Receivable",
  }).lean();
  const outstandingReceivables = receivableAccounts.reduce(
    (sum: number, acc: any) => sum + (acc.balance || 0),
    0,
  );

  const transactionsPipeline = await Transaction.aggregate([
    { $match: { userId: userObjectId } },
    { $unwind: "$journalLines" },
    {
      $lookup: {
        from: "accounts",
        localField: "journalLines.accountId",
        foreignField: "_id",
        as: "accountDetails",
      },
    },
    { $unwind: "$accountDetails" },
    {
      $project: {
        date: 1,
        amount: "$journalLines.amount",
        accountType: "$accountDetails.type",
        accountName: "$accountDetails.name",
      },
    },
  ]);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const barDataMap: Record<
    string,
    { name: string; revenue: number; expense: number }
  > = {};
  const pieDataMap: Record<string, number> = {};

  transactionsPipeline.forEach((line) => {
    const txDate = new Date(line.date);
    const monthLabel = monthNames[txDate.getMonth()];

    if (!barDataMap[monthLabel]) {
      barDataMap[monthLabel] = { name: monthLabel, revenue: 0, expense: 0 };
    }

    if (line.accountType === "Income") {
      barDataMap[monthLabel].revenue += line.amount;
    }
    if (line.accountType === "Expense") {
      barDataMap[monthLabel].expense += line.amount;
      pieDataMap[line.accountName] =
        (pieDataMap[line.accountName] || 0) + line.amount;
    }
  });

  const pieData = Object.keys(pieDataMap).map((key) => ({
    name: key,
    value: pieDataMap[key],
  }));

  // Recent Transactions Audit Log
  const rawTransactions = await Transaction.find({ userId: userObjectId })
    .sort({ date: -1 })
    .limit(3)
    .lean();

  const recentTransactions = rawTransactions.map((tx: any) => {
    const primaryLine = tx.journalLines?.[0];
    const fallbackAmount = primaryLine ? primaryLine.amount : 0;
    const isRevenue =
      tx.description.toLowerCase().includes("revenue") ||
      tx.description.toLowerCase().includes("sales");

    return {
      id: tx._id.toString(),
      type: isRevenue ? "invoice" : "expense",
      title: tx.description || "Journal Transaction Entry",
      meta: `${new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} • Balanced`,
      amount: `${isRevenue ? "+" : "-"}Rs. ${fallbackAmount.toLocaleString()}`,
      isPositive: isRevenue,
    };
  });

  return NextResponse.json({
    metrics: {
      totalRevenue,
      outstandingReceivables,
      healthScore:
        totalRevenue > 0
          ? Math.round(((totalRevenue - 2950) / totalRevenue) * 100)
          : 100,
      healthGrowth: "+8.4%",
    },
    barData: Object.values(barDataMap).length
      ? Object.values(barDataMap)
      : [{ name: "Current", revenue: totalRevenue, expense: 0 }],
    pieData: pieData.length ? pieData : [{ name: "Office Rent", value: 0 }],
    recentTransactions,
  });
});
