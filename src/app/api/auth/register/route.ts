import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Account from "@/models/Account";
import { hash } from "bcrypt-ts";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    // 1. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    // 2. Hash password
    const hashedPassword = await hash(password, 12);

    // 3. Create User
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const defaultAccounts = [
      { userId: newUser._id, name: "Cash in Hand", type: "Asset", balance: 0 },
      {
        userId: newUser._id,
        name: "Main Bank Account",
        type: "Asset",
        balance: 0,
      },
      {
        userId: newUser._id,
        name: "Accounts Payable",
        type: "Liability",
        balance: 0,
      },
      {
        userId: newUser._id,
        name: "Owner's Capital",
        type: "Equity",
        balance: 0,
      },
      {
        userId: newUser._id,
        name: "Sales Revenue",
        type: "Income",
        balance: 0,
      },
      { userId: newUser._id, name: "Office Rent", type: "Expense", balance: 0 },
      {
        userId: newUser._id,
        name: "Utilities Expense",
        type: "Expense",
        balance: 0,
      },
    ];

    // Bulk insert standard ledger accounts safely
    await Account.insertMany(defaultAccounts);

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 },
    );
    // Inside your user registration POST route catch block:
  } catch (error) {
    console.error("CRITICAL REGISTRATION FAILURE:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
