import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: "Added to waitlist" });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
