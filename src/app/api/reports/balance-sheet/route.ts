import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Transaction from "@/models/Transaction";
import Account from "@/models/Account";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId");
    const asOfDateStr = searchParams.get("date");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Capture everything from inception up to 23:59:59 on the target date
    const asOfDate = asOfDateStr
      ? new Date(`${asOfDateStr}T23:59:59.999Z`)
      : new Date();

    // 1️⃣ Fetch all historic transactions up to the point-in-time date boundary
    const transactions = await Transaction.find({
      userId,
      date: { $lte: asOfDate },
    })
      .populate("journalLines.accountId", "name type")
      .lean();

    // 2️⃣ Initialize storage buckets for balance mapping
    const assetsMap: Record<string, number> = {};
    const liabilitiesMap: Record<string, number> = {};
    const equityMap: Record<string, number> = {};

    // Tracks retained earnings from Income & Expense lines dynamically
    let dynamicRetainedEarnings = 0;

    // 3️⃣ Compute snapshot calculations across the ledger splits
    for (const tx of transactions) {
      for (const line of tx.journalLines) {
        const account = line.accountId as any;
        if (!account) continue;

        const amount = Number(line.amount);

        switch (account.type) {
          case "Asset":
            if (!assetsMap[account.name]) assetsMap[account.name] = 0;
            assetsMap[account.name] += line.type === "Debit" ? amount : -amount;
            break;

          case "Liability":
            if (!liabilitiesMap[account.name]) liabilitiesMap[account.name] = 0;
            liabilitiesMap[account.name] +=
              line.type === "Credit" ? amount : -amount;
            break;

          case "Equity":
            if (!equityMap[account.name]) equityMap[account.name] = 0;
            equityMap[account.name] +=
              line.type === "Credit" ? amount : -amount;
            break;

          case "Income":
            // Net profit items feed directly into Retained Earnings
            dynamicRetainedEarnings +=
              line.type === "Credit" ? amount : -amount;
            break;

          case "Expense":
            dynamicRetainedEarnings -= line.type === "Debit" ? amount : -amount;
            break;
        }
      }
    }

    // 4️⃣ Incorporate generated Retained Earnings into the Equity framework
    if (dynamicRetainedEarnings !== 0) {
      equityMap["Retained Earnings"] =
        (equityMap["Retained Earnings"] || 0) + dynamicRetainedEarnings;
    }

    // Convert mappings to clean structural arrays
    const assets = Object.entries(assetsMap).map(([name, amount]) => ({
      name,
      amount,
    }));
    const liabilities = Object.entries(liabilitiesMap).map(
      ([name, amount]) => ({ name, amount }),
    );
    const equity = Object.entries(equityMap).map(([name, amount]) => ({
      name,
      amount,
    }));

    return NextResponse.json({ assets, liabilities, equity }, { status: 200 });
  } catch (error: any) {
    console.error("Balance Sheet Engine Failure:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
