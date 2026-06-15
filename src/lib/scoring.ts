import type { Prediction, Result } from "@/generated/prisma/client";

export interface PlayerScore {
  playerId: string;
  playerName: string;
  total: number;
  breakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  champion: number;
  runnerUp: number;
  koreaRound: number;
  golden: number;
  matches: number;
}

function getMatchResult(score: string): "win" | "draw" | "loss" | null {
  const parts = score.split(":");
  if (parts.length !== 2) return null;
  const home = parseInt(parts[0]);
  const away = parseInt(parts[1]);
  if (isNaN(home) || isNaN(away)) return null;
  if (home > away) return "win";
  if (home === away) return "draw";
  return "loss";
}

export function calculateScore(
  prediction: Prediction,
  result: Result
): ScoreBreakdown {
  let champion = 0;
  let runnerUp = 0;
  let koreaRound = 0;
  let golden = 0;
  let matches = 0;

  // Champion/Runner-up scoring
  if (prediction.champion && result.champion && result.runnerUp) {
    if (prediction.champion === result.champion) {
      champion = 20;
    } else if (prediction.champion === result.runnerUp) {
      champion = 5;
    }
  }

  if (prediction.runnerUp && result.champion && result.runnerUp) {
    if (prediction.runnerUp === result.runnerUp) {
      runnerUp = 10;
    } else if (prediction.runnerUp === result.champion) {
      runnerUp = 5;
    }
  }

  // Korea final round
  if (prediction.koreaRound && result.koreaRound) {
    if (prediction.koreaRound === result.koreaRound) {
      koreaRound = 5;
    }
  }

  // Golden Boot/Ball/Glove
  if (prediction.goldenPlayer) {
    const goldenWinners = [
      result.goldenBootWinner,
      result.goldenBallWinner,
      result.goldenGloveWinner,
    ].filter(Boolean);
    if (goldenWinners.includes(prediction.goldenPlayer)) {
      golden = 7;
    }
  }

  // Match scores
  const predictedScores = (prediction.matchScores as Record<string, string>) ?? {};
  const actualScores = (result.matchScores as Record<string, string>) ?? {};

  for (const [matchId, predictedScore] of Object.entries(predictedScores)) {
    if (!predictedScore) continue;
    const actualScore = actualScores[matchId];
    if (!actualScore) continue;

    const predictedResult = getMatchResult(predictedScore);
    const actualResult = getMatchResult(actualScore);

    if (predictedResult && actualResult) {
      if (predictedResult === actualResult) {
        matches += 3;
        if (predictedScore === actualScore) {
          matches += 3;
        }
      }
    }
  }

  return { champion, runnerUp, koreaRound, golden, matches };
}

export function totalScore(breakdown: ScoreBreakdown): number {
  return (
    breakdown.champion +
    breakdown.runnerUp +
    breakdown.koreaRound +
    breakdown.golden +
    breakdown.matches
  );
}
