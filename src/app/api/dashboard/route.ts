import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    await connectDB();

    // 1. Get userId from Auth Header or URL Search Params (Alignment with other pages)
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get("userId");

    const authHeader = req.headers.get("authorization");
    if (!userId && authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        // Handling both fallback structures safely (id or userId)
        userId = decoded.userId || decoded.id;
      } catch (err) {
        return NextResponse.json(
          { error: "Invalid or expired session token" },
          { status: 401 },
        );
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication or User ID is required" },
        { status: 400 },
      );
    }

    // Convert string userId to Mongoose ObjectId safely for aggregation pipelines
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // ==========================================
    // 1. COMPUTE TOTAL REVENUE FROM ACCOUNT BALANCES
    // ==========================================
    const incomeAccounts = await Account.find({
      userId: userObjectId,
      type: "Income",
    }).lean();

    const totalRevenue = incomeAccounts.reduce(
      (sum: number, acc: any) => sum + (acc.balance || 0),
      0,
    );

    // ==========================================
    // 2. COMPUTE OUTSTANDING RECEIVABLES
    // ==========================================
    const receivableAccounts = await Account.find({
      userId: userObjectId,
      name: "Accounts Receivable",
    }).lean();

    const outstandingReceivables = receivableAccounts.reduce(
      (sum: number, acc: any) => sum + (acc.balance || 0),
      0,
    );

    // ==========================================
    // 3. GENERATE MONTHLY CASH FLOW VIA AGGREGATION
    // ==========================================
    const transactionsPipeline = await Transaction.aggregate([
      { $match: { userId: userObjectId } },
      { $unwind: "$journalLines" },
      {
        $lookup: {
          from: "accounts", // ensure collection name matches MongoDB collection name
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

    const standardPieData = pieData.length
      ? pieData
      : [
          { name: "Office Rent", value: 0 },
          { name: "Utilities Expense", value: 0 },
        ];

    // ==========================================
    // 4. RECENT TRANSACTIONS AUDIT LOG
    // ==========================================
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

    // Send aligned response back to client state
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
          : [
              {
                name: new Date().toLocaleDateString("en-US", {
                  month: "short",
                }),
                revenue: totalRevenue,
                expense: 0,
              },
            ],
        pieData: standardPieData,
        recentTransactions,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Dashboard Report Pipeline Crash:", error);
    return NextResponse.json(
      { error: "Failed to compile dashboard metrics securely." },
      { status: 500 },
    );
  }
}
