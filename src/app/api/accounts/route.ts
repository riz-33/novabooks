import Account from "@/models/Accounts";
import connectDB from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";


export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const { userId, name, type, balance } = body;

    if (!userId || !name || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const existingAccount = await Account.findOne({
      userId,
      name,
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: "Account name already exists" },
        { status: 400 },
      );
    }

    const newAccount = await Account.create({
      userId,
      name,
      type,
      balance,
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        account: newAccount,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.log(error);

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// src/app/api/accounts/route.ts

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    
    // Fallback strategy: check search parameters, or fallback to parsing the token authorization header
    let userId = searchParams.get("userId");
    
    if (!userId) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        // If you have a jwt verification utility:
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        userId = decoded.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Authentication or User ID is required" }, { status: 400 });
    }

    const accounts = await Account.find({ userId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ accounts }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const accountId = searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 },
      );
    }

    const deletedAccount = await Account.findByIdAndDelete(accountId);

    if (!deletedAccount) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.log(error);

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
