import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { code, password } = await req.json();
  const id = (code as string).toUpperCase();

  if (!/^[A-Z0-9]{7}$/.test(id)) {
    return NextResponse.json({ error: "코드는 7자리 영숫자여야 합니다" }, { status: 400 });
  }

  const existing = await prisma.game.findUnique({ where: { id } });
  if (existing) {
    return NextResponse.json({ error: "이미 존재하는 코드입니다" }, { status: 409 });
  }

  const passwordHash = password ? await hash(password, 10) : null;
  const game = await prisma.game.create({ data: { id, passwordHash } });
  return NextResponse.json({ id: game.id, hasPassword: !!game.passwordHash }, { status: 201 });
}
