import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { calculateScore, totalScore } from "@/lib/scoring";
import { KOREA_MATCHES } from "@/lib/worldcup-data";

async function getGame(id: string) {
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
  return game;
}

type CellStatus = "correct" | "wrong" | "partial" | "empty" | "pending";

function cellClass(status: CellStatus) {
  switch (status) {
    case "correct":
      return "bg-green-100 text-green-800 font-semibold";
    case "partial":
      return "bg-yellow-100 text-yellow-800 font-semibold";
    case "wrong":
      return "bg-red-50 text-red-600";
    case "empty":
      return "text-gray-300";
    default:
      return "text-gray-700";
  }
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const gameCode = code.toUpperCase();
  const game = await getGame(gameCode);

  if (!game) notFound();

  const hasResults = !!game.result;
  const result = game.result;

  const playersWithScore = game.players.map((player) => {
    let score: number | null = null;
    let breakdown = null;
    if (player.prediction && result) {
      breakdown = calculateScore(player.prediction, result);
      score = totalScore(breakdown);
    }
    return { ...player, score, breakdown };
  });

  if (hasResults) {
    playersWithScore.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }

  // Build prediction table rows
  const playedMatches = KOREA_MATCHES.filter((m) => {
    if (!hasResults) return m.stage === "group";
    const actualScores = (result?.matchScores ?? {}) as Record<string, string>;
    return actualScores[m.id] || m.stage === "group";
  });

  type Row = { label: string; getValue: (p: (typeof playersWithScore)[0]) => string; getStatus: (val: string, p: (typeof playersWithScore)[0]) => CellStatus };

  function championStatus(val: string): CellStatus {
    if (!result?.champion) return "pending";
    if (!val) return "empty";
    if (val === result.champion) return "correct";
    if (val === result.runnerUp) return "partial";
    return "wrong";
  }

  function runnerUpStatus(val: string): CellStatus {
    if (!result?.runnerUp) return "pending";
    if (!val) return "empty";
    if (val === result.runnerUp) return "correct";
    if (val === result.champion) return "partial";
    return "wrong";
  }

  function koreaRoundStatus(val: string): CellStatus {
    if (!result?.koreaRound) return "pending";
    if (!val) return "empty";
    return val === result.koreaRound ? "correct" : "wrong";
  }

  function goldenStatus(val: string): CellStatus {
    if (!result?.goldenBootWinner && !result?.goldenBallWinner && !result?.goldenGloveWinner) return "pending";
    if (!val) return "empty";
    const winners = [result?.goldenBootWinner, result?.goldenBallWinner, result?.goldenGloveWinner].filter(Boolean);
    return winners.includes(val) ? "correct" : "wrong";
  }

  function matchStatus(matchId: string, val: string): CellStatus {
    const actualScores = (result?.matchScores ?? {}) as Record<string, string>;
    const actual = actualScores[matchId];
    if (!actual) return "pending";
    if (!val) return "empty";
    if (val === actual) return "correct";
    const getResult = (s: string) => {
      const [h, a] = s.split(":").map(Number);
      return h > a ? "W" : h === a ? "D" : "L";
    };
    if (getResult(val) === getResult(actual)) return "partial";
    return "wrong";
  }

  const rows: Row[] = [
    {
      label: "🏆 우승국",
      getValue: (p) => p.prediction?.champion ?? "",
      getStatus: (val) => championStatus(val),
    },
    {
      label: "🥈 준우승국",
      getValue: (p) => p.prediction?.runnerUp ?? "",
      getStatus: (val) => runnerUpStatus(val),
    },
    {
      label: "🇰🇷 한국 최종순위",
      getValue: (p) => p.prediction?.koreaRound ?? "",
      getStatus: (val) => koreaRoundStatus(val),
    },
    {
      label: "✨ 골든 플레이어",
      getValue: (p) => p.prediction?.goldenPlayer ?? "",
      getStatus: (val) => goldenStatus(val),
    },
    ...playedMatches.map((m) => ({
      label: m.label,
      getValue: (p: (typeof playersWithScore)[0]) =>
        ((p.prediction?.matchScores ?? {}) as Record<string, string>)[m.id] ?? "",
      getStatus: (val: string) => matchStatus(m.id, val),
    })),
  ];

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-3xl mb-1">⚽</div>
          <h1 className="text-xl font-bold text-gray-800">2026 월드컵 예측 게임</h1>
          <div className="mt-2 inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1">
            <span className="text-xs text-gray-500">게임 코드</span>
            <span className="font-mono font-bold text-gray-800 tracking-widest">
              {gameCode}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mb-6">
          <Link
            href={`/${gameCode}/join`}
            className="flex-1 bg-blue-600 text-white text-center font-semibold py-3 rounded-xl hover:bg-blue-700 transition"
          >
            참가하기
          </Link>
          <Link
            href={`/${gameCode}/admin`}
            className="flex-1 bg-gray-700 text-white text-center font-semibold py-3 rounded-xl hover:bg-gray-800 transition"
          >
            결과 입력
          </Link>
        </div>

        {/* Leaderboard / player list */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">
              {hasResults ? "🏆 순위표" : "👥 참가자 목록"}
            </h2>
            <span className="text-sm text-gray-400">{game.players.length}명</span>
          </div>

          {playersWithScore.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-400">
              <p>아직 참가자가 없습니다</p>
              <p className="text-sm mt-1">위 버튼을 눌러 참가하세요!</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {playersWithScore.map((player, idx) => (
                <li key={player.id}>
                  <Link
                    href={`/${gameCode}/player/${encodeURIComponent(player.name)}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                  >
                    {hasResults && (
                      <span className="text-lg w-6 text-center">
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : <span className="text-sm text-gray-400">{idx + 1}</span>}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800">{player.name}</p>
                      {!player.prediction && (
                        <p className="text-xs text-orange-400">예측 없음</p>
                      )}
                    </div>
                    {hasResults ? (
                      <div className="text-right">
                        <span className="text-lg font-bold text-blue-600">{player.score ?? 0}점</span>
                        {player.breakdown && (
                          <p className="text-xs text-gray-400">
                            {[
                              player.breakdown.champion && `우승 ${player.breakdown.champion}`,
                              player.breakdown.runnerUp && `준우승 ${player.breakdown.runnerUp}`,
                              player.breakdown.koreaRound && `순위 ${player.breakdown.koreaRound}`,
                              player.breakdown.golden && `골든 ${player.breakdown.golden}`,
                              player.breakdown.matches && `경기 ${player.breakdown.matches}`,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-300 text-sm">→</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Prediction dashboard */}
        {playersWithScore.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-700">📋 예측 현황</h2>
              {hasResults && (
                <p className="text-xs text-gray-400 mt-0.5">
                  🟢 정확 · 🟡 순서/결과 불일치 · 🔴 오답
                </p>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="sticky left-0 z-10 bg-gray-50 text-left px-3 py-2 text-xs font-semibold text-gray-500 whitespace-nowrap min-w-[130px]">
                      항목
                    </th>
                    {playersWithScore.map((p) => (
                      <th
                        key={p.id}
                        className="px-3 py-2 text-center text-xs font-semibold text-gray-700 whitespace-nowrap min-w-[80px]"
                      >
                        {p.name}
                        {hasResults && (
                          <div className="text-blue-600 font-bold">{p.score ?? 0}점</div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                    >
                      <td className="sticky left-0 z-10 px-3 py-2 text-xs font-medium text-gray-500 whitespace-nowrap border-r border-gray-100 bg-inherit">
                        {row.label}
                      </td>
                      {playersWithScore.map((player) => {
                        const val = row.getValue(player);
                        const status = hasResults ? row.getStatus(val, player) : (val ? "pending" : "empty");
                        return (
                          <td
                            key={player.id}
                            className={`px-3 py-2 text-center text-xs whitespace-nowrap ${cellClass(status)}`}
                          >
                            {val || <span className="text-gray-300">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Scoring guide */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">점수 기준</h3>
          <div className="space-y-1 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>우승국 정확히 맞춤</span>
              <span className="font-bold text-gray-700">20점</span>
            </div>
            <div className="flex justify-between">
              <span>준우승국 정확히 맞춤</span>
              <span className="font-bold text-gray-700">10점</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                우승/준우승 국가 순서 불일치
                <span className="relative group cursor-default">
                  <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gray-300 text-gray-600 text-[9px] font-bold leading-none">?</span>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 hidden group-hover:block z-20 pointer-events-none shadow-lg">
                    예: 브라질 우승·프랑스 준우승일 때<br />
                    우승란에 프랑스, 준우승란에 다른 나라 → 5점<br />
                    우승란에 프랑스, 준우승란에 브라질 → 5+5=10점
                  </span>
                </span>
              </span>
              <span className="font-bold text-gray-700">각 5점</span>
            </div>
            <div className="flex justify-between">
              <span>대한민국 최종순위 정확히 맞춤</span>
              <span className="font-bold text-gray-700">5점</span>
            </div>
            <div className="flex justify-between">
              <span>골든 플레이어 수상자 맞춤 (3개 중 1개)</span>
              <span className="font-bold text-gray-700">7점</span>
            </div>
            <div className="flex justify-between">
              <span>경기 승무패 맞춤</span>
              <span className="font-bold text-gray-700">3점</span>
            </div>
            <div className="flex justify-between">
              <span>경기 정확한 점수 맞춤</span>
              <span className="font-bold text-gray-700">+3점</span>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
            ← 홈으로
          </Link>
        </div>
      </div>
    </main>
  );
}
