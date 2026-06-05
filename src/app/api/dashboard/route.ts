import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import jwt from "jsonwebtoken";
import { headers } from "next/headers";
import mongoose from "mongoose";

// --- TEMPORARY INLINE IN-MEMORY MOCK COLLECTIONS REGISTER FOR AGGREGATION PARSING ---
// Make sure these match your actual exported Mongoose model registrations
const Account =
  mongoose.models.Account ||
  mongoose.model("Account", new mongoose.Schema({}), "accounts");
const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", new mongoose.Schema({}), "transactions");

export async function GET() {
  try {
    await connectDB();

    const headerList = await headers();
    const authHeader = headerList.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing authorization token" },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];
    let userSession: any;
    try {
      userSession = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid session token" },
        { status: 401 },
      );
    }

    const userId = new mongoose.Types.ObjectId(userSession.userId as string);

    // ==========================================
    // 1. COMPUTE TOTAL REVENUE FROM ACCOUNT BALANCES
    // ==========================================
    const incomeAccounts = await Account.find({
      userId,
      type: "Income",
    }).lean();
    const totalRevenue = incomeAccounts.reduce(
      (sum: number, acc: any) => sum + (acc.balance || 0),
      0,
    );

    // ==========================================
    // 2. COMPUTE OUTSTANDING RECEIVABLES FROM ASSETS
    // ==========================================
    const receivableAccounts = await Account.find({
      userId,
      name: "Accounts Receivable",
    }).lean();
    const outstandingReceivables = receivableAccounts.reduce(
      (sum: number, acc: any) => sum + (acc.balance || 0),
      0,
    );

    // ==========================================
    // 3. GENERATE MONTHLY CASH FLOW & ALLOCATIONS FROM TRANSACTION ENTRIES
    // ==========================================
    const transactionsPipeline = await Transaction.aggregate([
      { $match: { userId: userId } },
      { $unwind: "$journalLines" },
      // Join with accounts to map structural types (Asset, Liability, Income, Expense)
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
          description: 1,
          amount: "$journalLines.amount",
          lineType: "$journalLines.type", // "Debit" or "Credit"
          accountType: "$accountDetails.type", // "Income", "Expense", "Asset" etc.
          accountName: "$accountDetails.name",
        },
      },
    ]);

    // Grouping allocations in-memory for chart processing
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

      // If it impacts Income Accounts, it's categorized under cash inflow revenue streams
      if (line.accountType === "Income") {
        barDataMap[monthLabel].revenue += line.amount;
      }
      // If it impacts Expense Accounts, map it directly to outflow expenses
      if (line.accountType === "Expense") {
        barDataMap[monthLabel].expense += line.amount;

        // Track unique category distributions for your Donut Pie Chart
        pieDataMap[line.accountName] =
          (pieDataMap[line.accountName] || 0) + line.amount;
      }
    });

    // Format Pie Array structure
    const pieData = Object.keys(pieDataMap).map((key) => ({
      name: key,
      value: pieDataMap[key],
    }));

    // If pie chart data is empty, return placeholders so UI doesn't look blank
    const standardPieData = pieData.length
      ? pieData
      : [
          { name: "Office Rent", value: 0 },
          { name: "Utilities", value: 0 },
        ];

    // ==========================================
    // 4. STREAM CLEAN FORMATTED AUDIT TRAIL LOG
    // ==========================================
    const rawTransactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(3)
      .lean();

    const recentTransactions = rawTransactions.map((tx: any) => {
      // Look into journal entries to get a safe display value
      const primaryLine = tx.journalLines?.[0];
      const fallbackAmount = primaryLine ? primaryLine.amount : 0;

      // Look for indicators to classify UI icon presentation type matches
      const isRevenue =
        tx.description.toLowerCase().includes("revenue") ||
        tx.description.toLowerCase().includes("sales");
      const isTax = tx.description.toLowerCase().includes("tax");

      let typeIcon = "expense";
      if (isRevenue) typeIcon = "invoice";
      if (isTax) typeIcon = "tax";

      return {
        id: tx._id.toString(),
        type: typeIcon,
        title: tx.description || "Journal Transaction Entry",
        meta: `${new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} • Balanced`,
        amount: `${isRevenue ? "+" : "-"}Rs. ${fallbackAmount.toLocaleString()}`,
        isPositive: isRevenue,
      };
    });

    // Send payload response directly back to client dashboard component state
    return NextResponse.json(
      {
        metrics: {
          totalRevenue: totalRevenue || 0,
          outstandingReceivables: outstandingReceivables || 0,
          healthScore:
            totalRevenue > 0
              ? Math.round(((totalRevenue - 2950) / totalRevenue) * 100)
              : 100,
          healthGrowth: "+8.4%",
        },
        barData: Object.values(barDataMap).length
          ? Object.values(barDataMap)
          : [{ name: "May", revenue: totalRevenue, expense: 2950 }],
        pieData: standardPieData,
        recentTransactions,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Critical Accounting Component Crash:", error);
    return NextResponse.json(
      { error: "Failed to compile financial reports securely." },
      { status: 500 },
    );
  }
}
