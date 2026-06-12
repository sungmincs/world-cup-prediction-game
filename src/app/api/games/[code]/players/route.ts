import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const gameId = code.toUpperCase();

  const players = await prisma.player.findMany({
    where: { gameId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(players);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const gameId = code.toUpperCase();
  const { name } = await req.json();

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "이름을 입력해주세요" }, { status: 400 });
  }

  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) {
    return NextResponse.json({ error: "게임을 찾을 수 없습니다" }, { status: 404 });
  }

  try {
    const player = await prisma.player.create({
      data: { gameId, name: name.trim() },
    });
    return NextResponse.json(player, { status: 201 });
  } catch {
    return NextResponse.json({ error: "이미 사용 중인 이름입니다" }, { status: 409 });
  }
}
