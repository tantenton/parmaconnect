import { NextRequest, NextResponse } from "next/server";
import { register } from "@/lib/auth/auth-service";

const DEMO_COMMUNITY_ID = "seed-community-parma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, kata sandi, dan nama diperlukan" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Kata sandi minimal 8 karakter" },
        { status: 400 },
      );
    }

    const result = await register(email, password, name, DEMO_COMMUNITY_ID);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json(
      { success: true, userId: result.userId },
      { status: 201 },
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
