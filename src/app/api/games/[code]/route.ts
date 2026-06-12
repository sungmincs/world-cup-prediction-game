import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateScore, totalScore } from "@/lib/scoring";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const id = code.toUpperCase();

  const game = await prisma.game.findUnique({
    where: { id },
    include: {
      players: {
        include: { prediction: true },
        orderBy: { name: "asc" },
      },
      result: true,
    },
  });

  if (!game) {
    return NextResponse.json({ error: "게임을 찾을 수 없습니다" }, { status: 404 });
  }

  const playersWithScore = game.players.map((player) => {
    let score: number | null = null;
    let breakdown = null;
    if (player.prediction && game.result) {
      breakdown = calculateScore(player.prediction, game.result);
      score = totalScore(breakdown);
    }
    return { ...player, score, breakdown };
  });

  // Sort by score desc if results exist, otherwise alphabetical
  if (game.result) {
    playersWithScore.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...gameData } = game;
  return NextResponse.json({ ...gameData, players: playersWithScore, hasPassword: !!passwordHash });
}
