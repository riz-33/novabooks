import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { compare } from "bcrypt-ts";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const email = body.email.toLowerCase().trim();
    const password = body.password;

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 },
      );
    }

    // 2. Check password
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 },
      );
    }

    // 3. Create JWT Token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" },
    );

    // 4. Send response
    return NextResponse.json(
      {
        message: "Login successful",
        token,
        user: { id: user._id, name: user.name, email: user.email },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
