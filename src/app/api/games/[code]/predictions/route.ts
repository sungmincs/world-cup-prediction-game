import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const gameId = code.toUpperCase();
  const body = await req.json();
  const { playerName, champion, runnerUp, koreaRound, goldenPlayer, matchScores } = body;

  if (!playerName) {
    return NextResponse.json({ error: "플레이어 이름이 필요합니다" }, { status: 400 });
  }

  const player = await prisma.player.findUnique({
    where: { gameId_name: { gameId, name: playerName } },
  });

  if (!player) {
    return NextResponse.json({ error: "플레이어를 찾을 수 없습니다" }, { status: 404 });
  }

  const prediction = await prisma.prediction.upsert({
    where: { playerId: player.id },
    create: {
      playerId: player.id,
      champion: champion || null,
      runnerUp: runnerUp || null,
      koreaRound: koreaRound || null,
      goldenPlayer: goldenPlayer || null,
      matchScores: matchScores ?? {},
    },
    update: {
      champion: champion || null,
      runnerUp: runnerUp || null,
      koreaRound: koreaRound || null,
      goldenPlayer: goldenPlayer || null,
      matchScores: matchScores ?? {},
    },
  });

  return NextResponse.json(prediction);
}
