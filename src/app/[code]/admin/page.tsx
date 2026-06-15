"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { KOREA_MATCHES, KOREA_ROUNDS } from "@/lib/worldcup-data";

export default function AdminPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const gameCode = code.toUpperCase();

  const [champion, setChampion] = useState("");
  const [runnerUp, setRunnerUp] = useState("");
  const [koreaRound, setKoreaRound] = useState("");
  const [goldenBootWinner, setGoldenBootWinner] = useState("");
  const [goldenBallWinner, setGoldenBallWinner] = useState("");
  const [goldenGloveWinner, setGoldenGloveWinner] = useState("");
  const [matchScores, setMatchScores] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/games/${gameCode}/results`)
      .then((r) => r.json())
      .then((result) => {
        if (result && result.id) {
          setChampion(result.champion ?? "");
          setRunnerUp(result.runnerUp ?? "");
          setKoreaRound(result.koreaRound ?? "");
          setGoldenBootWinner(result.goldenBootWinner ?? "");
          setGoldenBallWinner(result.goldenBallWinner ?? "");
          setGoldenGloveWinner(result.goldenGloveWinner ?? "");
          setMatchScores(result.matchScores ?? {});
        }
      })
      .catch(() => {});
  }, [gameCode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    const res = await fetch(`/api/games/${gameCode}/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        champion,
        runnerUp,
        koreaRound,
        goldenBootWinner,
        goldenBallWinner,
        goldenGloveWinner,
        matchScores,
      }),
    });

    if (res.ok) {
      setSaved(true);
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
          <h1 className="text-xl font-bold text-gray-800">실제 결과 입력</h1>
          <p className="text-sm text-gray-500 mt-1 font-mono tracking-widest">
            {gameCode}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            결과를 입력하면 모든 참가자의 점수가 자동 계산됩니다
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Champion / Runner-up */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="font-semibold text-gray-700 mb-3">🏆 실제 우승/준우승</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  우승국
                </label>
                <input
                  value={champion}
                  onChange={(e) => setChampion(e.target.value)}
                  placeholder="예: 아르헨티나"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  준우승국
                </label>
                <input
                  value={runnerUp}
                  onChange={(e) => setRunnerUp(e.target.value)}
                  placeholder="예: 프랑스"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Korea round */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="font-semibold text-gray-700 mb-3">🇰🇷 대한민국 최종순위</h2>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
              {KOREA_ROUNDS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setKoreaRound(koreaRound === r ? "" : r)}
                  className={`py-2 rounded-lg text-sm font-medium border transition ${
                    koreaRound === r
                      ? "bg-red-500 text-white border-red-500"
                      : "border-gray-300 text-gray-600 hover:border-red-400"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Golden awards */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="font-semibold text-gray-700 mb-3">✨ 개인상 수상자</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  골든 부트 (득점왕)
                </label>
                <input
                  value={goldenBootWinner}
                  onChange={(e) => setGoldenBootWinner(e.target.value)}
                  placeholder="예: 음바페"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  골든 볼 (최우수선수)
                </label>
                <input
                  value={goldenBallWinner}
                  onChange={(e) => setGoldenBallWinner(e.target.value)}
                  placeholder="예: 메시"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  골든 글러브 (최우수 골키퍼)
                </label>
                <input
                  value={goldenGloveWinner}
                  onChange={(e) => setGoldenGloveWinner(e.target.value)}
                  placeholder="예: 마르티네스"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Match scores */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="font-semibold text-gray-700 mb-3">⚽ 실제 경기 결과</h2>
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
              ✅ 결과가 저장됐습니다! 점수가 업데이트됩니다.
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 disabled:opacity-50 transition"
          >
            {saving ? "저장 중..." : "결과 저장하기"}
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
