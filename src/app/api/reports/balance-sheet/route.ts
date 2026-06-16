import { NextResponse } from "next/server";
import Transaction from "@/models/Transaction";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req: Request, { userId }) => {
  try {
    const { searchParams } = new URL(req.url);

    const asOfDateStr = searchParams.get("date");

    const asOfDate = asOfDateStr
      ? new Date(`${asOfDateStr}T23:59:59.999Z`)
      : new Date();

    const transactions = await Transaction.find({
      userId,
      date: { $lte: asOfDate },
    })
      .populate("journalLines.accountId", "name type")
      .lean();

    const assetsMap: Record<string, number> = {};
    const liabilitiesMap: Record<string, number> = {};
    const equityMap: Record<string, number> = {};

    let dynamicRetainedEarnings = 0;

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
            dynamicRetainedEarnings +=
              line.type === "Credit" ? amount : -amount;
            break;

          case "Expense":
            dynamicRetainedEarnings -= line.type === "Debit" ? amount : -amount;
            break;
        }
      }
    }

    if (dynamicRetainedEarnings !== 0) {
      equityMap["Retained Earnings"] =
        (equityMap["Retained Earnings"] || 0) + dynamicRetainedEarnings;
    }

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
});
