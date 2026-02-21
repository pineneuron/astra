import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email');
    if (!email) {
      return NextResponse.json({ exists: false }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return NextResponse.json({ exists: !!user });
  } catch (error) {
    console.error('Check email error:', error);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}

