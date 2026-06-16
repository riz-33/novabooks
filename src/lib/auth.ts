import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import jwt from "jsonwebtoken";

type AuthenticatedHandler = (
  req: Request,
  context: { userId: string; [key: string]: any },
) => Promise<NextResponse> | NextResponse;

export function withAuth(handler: AuthenticatedHandler) {
  return async (req: Request, routeContext: any) => {
    try {
      await connectDB();

      const { searchParams } = new URL(req.url);
      let userId = searchParams.get("userId");

      if (!userId) {
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return NextResponse.json(
            { error: "Authentication required. Missing token." },
            { status: 401 },
          );
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

        userId = decoded.userId || decoded.id;
      }

      if (!userId) {
        return NextResponse.json(
          { error: "User identity could not be verified." },
          { status: 400 },
        );
      }

      return handler(req, { ...routeContext, userId });
    } catch (error: any) {
      console.error("Centralized Auth Wrapper Error:", error);
      if (error.name === "JsonWebTokenError") {
        return NextResponse.json(
          { error: "Invalid token scheme." },
          { status: 401 },
        );
      }
      if (error.name === "TokenExpiredError") {
        return NextResponse.json(
          { error: "Session expired. Please re-login." },
          { status: 401 },
        );
      }
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  };
}
