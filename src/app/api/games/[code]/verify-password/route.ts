import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const id = code.toUpperCase();
  const { password } = await req.json();

  const game = await prisma.game.findUnique({ where: { id }, select: { passwordHash: true } });
  if (!game) {
    return NextResponse.json({ error: "게임을 찾을 수 없습니다" }, { status: 404 });
  }

  if (!game.passwordHash) {
    return NextResponse.json({ ok: true });
  }

  const match = await compare(password ?? "", game.passwordHash);
  if (!match) {
    return NextResponse.json({ error: "비밀번호가 틀렸습니다" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
