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

    // 1. Structural Header Guard
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error(
        "Backend Auth Error: Missing or malformed Authorization header.",
      );
      return NextResponse.json(
        { error: "Missing authorization token structure" },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];

    // 2. JWT Verification Try/Catch Guard
    let userSession: any;
    try {
      if (!process.env.JWT_SECRET) {
        console.error(
          "CRITICAL: JWT_SECRET environment variable is completely missing.",
        );
        return NextResponse.json(
          { error: "Server Configuration Error" },
          { status: 500 },
        );
      }

      userSession = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError: any) {
      console.error(
        "Backend Auth Error: JWT verification crashed ->",
        jwtError.message,
      );
      return NextResponse.json(
        { error: "Session expired or invalid token structure." },
        { status: 401 },
      );
    }

    // 3. Payload Key Assertions Guard
    if (
      !userSession ||
      typeof userSession === "string" ||
      !userSession.companyId
    ) {
      console.error(
        "Backend Auth Error: Token verified but 'companyId' key is missing from payload structure.",
      );
      return NextResponse.json(
        { error: "Unauthorized access profile configuration" },
        { status: 401 },
      );
    }

    // Convert string parameter to valid MongoDB ObjectId
    const companyId = new mongoose.Types.ObjectId(
      userSession.companyId as string,
    );

    // --- REVENUE AGGREGATIONS CONTINUE BELOW ---
    const revenueAggregate = await Transaction.aggregate([
      { $match: { companyId: companyId, accountType: "Revenue" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // ... Rest of your aggregation pipelines and final code response block

    const receivablesAggregate = await Transaction.aggregate([
      {
        $match: {
          companyId: companyId,
          accountType: "Receivable",
          status: "Unpaid",
        },
      }, // Used casted ID
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // 3. Fetch Monthly Cash Flow Data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyFlow = await Transaction.aggregate([
      {
        $match: {
          companyId: companyId, // Used casted ID
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

    // Seed structure cleanly
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
      { $match: { companyId: companyId, type: "expense" } }, // Used casted ID
      { $group: { _id: "$category", value: { $sum: "$amount" } } },
      { $project: { name: "$_id", value: 1, _id: 0 } },
      { $limit: 3 },
    ]);

    // 5. Stream the Most Recent Transactions Log
    const rawTransactions = await Transaction.find({ companyId: companyId }) // Used casted ID
      .sort({ date: -1 })
      .limit(3)
      .lean();

    const recentTransactions = rawTransactions.map((tx: any) => ({
      id: tx._id.toString(),
      type: tx.type,
      title: tx.description || "Ledger Transaction",
      meta: `${tx.reference || "No Ref"} • ${tx.status || "Completed"}`,
      amount: `${tx.type === "revenue" ? "+" : "-"}Rs. ${tx.amount.toLocaleString()}`,
      isPositive: tx.type === "revenue",
    }));

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
