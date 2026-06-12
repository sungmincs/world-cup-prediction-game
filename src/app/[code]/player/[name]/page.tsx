"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KOREA_MATCHES, KOREA_ROUNDS, WC2026_TEAMS } from "@/lib/worldcup-data";

interface Prediction {
  champion?: string;
  runnerUp?: string;
  koreaRound?: string;
  goldenPlayer?: string;
  matchScores?: Record<string, string>;
}

export default function PlayerPage({
  params,
}: {
  params: Promise<{ code: string; name: string }>;
}) {
  const { code, name } = use(params);
  const gameCode = code.toUpperCase();
  const playerName = decodeURIComponent(name);
  const router = useRouter();

  const [champion, setChampion] = useState("");
  const [runnerUp, setRunnerUp] = useState("");
  const [koreaRound, setKoreaRound] = useState("");
  const [goldenPlayer, setGoldenPlayer] = useState("");
  const [matchScores, setMatchScores] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [championSuggestions, setChampionSuggestions] = useState<string[]>([]);
  const [runnerUpSuggestions, setRunnerUpSuggestions] = useState<string[]>([]);

  useEffect(() => {
    // Load existing prediction
    fetch(`/api/games/${gameCode}`)
      .then((r) => r.json())
      .then((game) => {
        const player = game.players?.find(
          (p: { name: string; prediction: Prediction | null }) => p.name === playerName
        );
        if (player?.prediction) {
          const p = player.prediction as Prediction;
          setChampion(p.champion ?? "");
          setRunnerUp(p.runnerUp ?? "");
          setKoreaRound(p.koreaRound ?? "");
          setGoldenPlayer(p.goldenPlayer ?? "");
          setMatchScores((p.matchScores as Record<string, string>) ?? {});
        }
      })
      .catch(() => {});
  }, [gameCode, playerName]);

  function filterTeams(query: string) {
    if (!query) return [];
    return WC2026_TEAMS.filter((t) => t.includes(query)).slice(0, 5);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch(`/api/games/${gameCode}/predictions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerName,
        champion,
        runnerUp,
        koreaRound,
        goldenPlayer,
        matchScores,
      }),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => {
        router.push(`/${gameCode}`);
      }, 1200);
    } else {
      const data = await res.json();
      setError(data.error ?? "저장에 실패했습니다");
    }

    setSaving(false);
  }

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-800">
            {playerName}의 예측
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-mono tracking-widest">
            {gameCode}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Champion / Runner-up */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="font-semibold text-gray-700 mb-3">
              🏆 우승/준우승 국가 예측
            </h2>
            <div className="space-y-1 text-xs text-gray-400 mb-3">
              <p>우승 정확히: 10점 | 준우승 정확히: 7점 | 순서 불일치: 각 3점</p>
            </div>

            <div className="relative mb-3">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                우승 국가
              </label>
              <input
                value={champion}
                onChange={(e) => {
                  setChampion(e.target.value);
                  setChampionSuggestions(filterTeams(e.target.value));
                }}
                onBlur={() => setTimeout(() => setChampionSuggestions([]), 150)}
                placeholder="예: 브라질"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {championSuggestions.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-200 rounded-lg w-full mt-1 shadow-md">
                  {championSuggestions.map((t) => (
                    <li
                      key={t}
                      onMouseDown={() => {
                        setChampion(t);
                        setChampionSuggestions([]);
                      }}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-900"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                준우승 국가
              </label>
              <input
                value={runnerUp}
                onChange={(e) => {
                  setRunnerUp(e.target.value);
                  setRunnerUpSuggestions(filterTeams(e.target.value));
                }}
                onBlur={() => setTimeout(() => setRunnerUpSuggestions([]), 150)}
                placeholder="예: 프랑스"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {runnerUpSuggestions.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-200 rounded-lg w-full mt-1 shadow-md">
                  {runnerUpSuggestions.map((t) => (
                    <li
                      key={t}
                      onMouseDown={() => {
                        setRunnerUp(t);
                        setRunnerUpSuggestions([]);
                      }}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-900"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Korea round */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="font-semibold text-gray-700 mb-1">
              🇰🇷 대한민국 최종순위 예측
            </h2>
            <p className="text-xs text-gray-400 mb-3">정확히 맞추면 5점</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
              {KOREA_ROUNDS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setKoreaRound(r)}
                  className={`py-2 rounded-lg text-sm font-medium border transition ${
                    koreaRound === r
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 text-gray-600 hover:border-blue-400"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Golden player */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="font-semibold text-gray-700 mb-1">
              ✨ 골든 플레이어 예측
            </h2>
            <p className="text-xs text-gray-400 mb-3">
              골든부트/골든볼/골든글러브 중 하나라도 수상하면 7점
            </p>
            <input
              value={goldenPlayer}
              onChange={(e) => setGoldenPlayer(e.target.value)}
              placeholder="예: 손흥민, 음바페"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Match scores */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="font-semibold text-gray-700 mb-1">
              ⚽ 대한민국 경기 점수 예측
            </h2>
            <p className="text-xs text-gray-400 mb-3">
              승무패 맞추면 3점, 정확한 점수 맞추면 추가 3점
            </p>
            <div className="space-y-3">
              {KOREA_MATCHES.map((match) => (
                <div key={match.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{match.label}</p>
                    <p className="text-xs text-gray-400">{match.date}</p>
                  </div>
                  <input
                    value={matchScores[match.id] ?? ""}
                    onChange={(e) =>
                      setMatchScores((prev) => ({
                        ...prev,
                        [match.id]: e.target.value,
                      }))
                    }
                    placeholder="2:1"
                    className="w-20 border border-gray-300 rounded-lg px-2 py-2 text-center font-mono text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {saved && (
            <p className="text-green-600 text-sm text-center font-medium">
              ✅ 저장됐습니다! 게임으로 이동합니다...
            </p>
          )}

          <button
            type="submit"
            disabled={saving || saved}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {saving ? "저장 중..." : "예측 저장하기"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href={`/${gameCode}`}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            ← 게임으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
