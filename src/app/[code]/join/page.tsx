"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Player {
  id: string;
  name: string;
}

export default function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const gameCode = code.toUpperCase();
  const router = useRouter();

  const [players, setPlayers] = useState<Player[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/games/${gameCode}/players`)
      .then((r) => r.json())
      .then(setPlayers)
      .catch(() => {});
  }, [gameCode]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch(`/api/games/${gameCode}/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });

    if (res.ok) {
      router.push(`/${gameCode}/player/${encodeURIComponent(newName.trim())}`);
    } else {
      const data = await res.json();
      setError(data.error ?? "오류가 발생했습니다");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-800">게임 참가</h1>
          <p className="text-sm text-gray-500 mt-1">
            코드:{" "}
            <span className="font-mono font-bold tracking-widest">{gameCode}</span>
          </p>
        </div>

        {/* New player */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <h2 className="font-semibold text-gray-700 mb-3">새로 참가</h2>
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="이름 입력"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !newName.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? "..." : "참가"}
            </button>
          </form>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Existing players */}
        {players.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-700">기존 참가자로 입장</h2>
            </div>
            <ul className="divide-y divide-gray-100">
              {players.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/${gameCode}/player/${encodeURIComponent(p.name)}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
                  >
                    <span className="font-medium text-gray-800">{p.name}</span>
                    <span className="text-gray-300 text-sm">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

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
