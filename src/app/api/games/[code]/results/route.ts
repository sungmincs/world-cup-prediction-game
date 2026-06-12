import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const gameId = code.toUpperCase();

  const result = await prisma.result.findUnique({ where: { gameId } });
  return NextResponse.json(result ?? {});
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const gameId = code.toUpperCase();
  const body = await req.json();

  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) {
    return NextResponse.json({ error: "게임을 찾을 수 없습니다" }, { status: 404 });
  }

  const {
    champion,
    runnerUp,
    koreaRound,
    goldenBootWinner,
    goldenBallWinner,
    goldenGloveWinner,
    matchScores,
  } = body;

  const result = await prisma.result.upsert({
    where: { gameId },
    create: {
      gameId,
      champion: champion || null,
      runnerUp: runnerUp || null,
      koreaRound: koreaRound || null,
      goldenBootWinner: goldenBootWinner || null,
      goldenBallWinner: goldenBallWinner || null,
      goldenGloveWinner: goldenGloveWinner || null,
      matchScores: matchScores ?? {},
    },
    update: {
      champion: champion || null,
      runnerUp: runnerUp || null,
      koreaRound: koreaRound || null,
      goldenBootWinner: goldenBootWinner || null,
      goldenBallWinner: goldenBallWinner || null,
      goldenGloveWinner: goldenGloveWinner || null,
      matchScores: matchScores ?? {},
    },
  });

  return NextResponse.json(result);
}
