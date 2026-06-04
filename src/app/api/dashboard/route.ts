import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Transaction from "@/models/Transaction";
import jwt from "jsonwebtoken";
import { headers } from "next/headers";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectDB();

    const headerList = await headers();
    const authHeader = headerList.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing authorization token structure" },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];

    let userSession: any;
    try {
      userSession = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (jwtError: any) {
      console.error("JWT verification crashed ->", jwtError.message);
      return NextResponse.json(
        { error: "Session expired or invalid token structure." },
        { status: 401 },
      );
    }

    // 👈 FIXED: Match the payload structure from your login sign method
    if (
      !userSession ||
      typeof userSession === "string" ||
      !userSession.userId
    ) {
      console.error(
        "Backend Auth Error: 'userId' key is missing from payload.",
      );
      return NextResponse.json(
        { error: "Unauthorized access profile configuration" },
        { status: 401 },
      );
    }

    // 👈 UPDATED: Convert the matched userId string parameter to a valid Mongoose ObjectId
    const userId = new mongoose.Types.ObjectId(userSession.userId as string);

    // 2. Fetch Aggregated Metrics from Database matching the user's ID field
    const revenueAggregate = await Transaction.aggregate([
      { $match: { userId: userId, accountType: "Revenue" } }, // 👈 Updated query match criteria
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const receivablesAggregate = await Transaction.aggregate([
      {
        $match: { userId: userId, accountType: "Receivable", status: "Unpaid" },
      }, // 👈 Updated query match criteria
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // 3. Fetch Monthly Cash Flow Data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyFlow = await Transaction.aggregate([
      {
        $match: {
          userId: userId, // 👈 Updated query match criteria
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" },
            type: "$type",
          },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
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

    monthlyFlow.forEach((item) => {
      const label = `${monthNames[item._id.month - 1]}`;
      if (!barDataMap[label]) {
        barDataMap[label] = { name: label, revenue: 0, expense: 0 };
      }
      if (item._id.type === "revenue")
        barDataMap[label].revenue += item.totalAmount;
      if (item._id.type === "expense")
        barDataMap[label].expense += item.totalAmount;
    });

    // 4. Fetch Expense Categories Distribution
    const categoryDistribution = await Transaction.aggregate([
      { $match: { userId: userId, type: "expense" } }, // 👈 Updated query match criteria
      { $group: { _id: "$category", value: { $sum: "$amount" } } },
      { $project: { name: "$_id", value: 1, _id: 0 } },
      { $limit: 3 },
    ]);

    // 5. Stream the Most Recent Transactions Log
    const rawTransactions = await Transaction.find({ userId: userId })
      .sort({ date: -1 })
      .limit(3)
      .lean();

    const recentTransactions = rawTransactions.map((tx: any) => {
      // Safe Fallback: Extract the number if it exists, otherwise default to 0
      const transactionAmount = typeof tx.amount === "number" ? tx.amount : 0;

      return {
        id: tx._id.toString(),
        type: tx.type || "expense",
        title: tx.description || "Ledger Transaction",
        meta: `${tx.reference || "No Ref"} • ${tx.status || "Completed"}`,
        // 👈 FIXED: We call .toLocaleString() on the safe fallback variable
        amount: `${tx.type === "revenue" ? "+" : "-"}Rs. ${transactionAmount.toLocaleString()}`,
        isPositive: tx.type === "revenue",
      };
    });

    return NextResponse.json(
      {
        metrics: {
          totalRevenue: revenueAggregate[0]?.total || 0,
          outstandingReceivables: receivablesAggregate[0]?.total || 0,
          healthScore: 94.2,
          healthGrowth: "+12%",
        },
        barData: Object.values(barDataMap),
        pieData: categoryDistribution.length
          ? categoryDistribution
          : [
              { name: "Operations", value: 0 },
              { name: "Salaries", value: 0 },
              { name: "Marketing", value: 0 },
            ],
        recentTransactions,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Database Aggregation Failure:", error);
    return NextResponse.json(
      { error: "Error parsing live ledger streams from the database cluster" },
      { status: 500 },
    );
  }
}
