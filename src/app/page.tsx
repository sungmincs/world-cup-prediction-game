"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "enter" | "create" | "password";

export default function HomePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<Mode>("enter");
  const [createPassword, setCreatePassword] = useState("");
  const [entryPassword, setEntryPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function normalizedCode() {
    return code.toUpperCase().trim();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = normalizedCode();
    if (!/^[A-Z0-9]{7}$/.test(normalized)) {
      setError("7자리 영숫자 코드를 입력해주세요 (예: ABC1234)");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch(`/api/games/${normalized}`);

    if (res.ok) {
      const game = await res.json();
      if (game.hasPassword) {
        setMode("password");
        setLoading(false);
        return;
      }
      router.push(`/${normalized}`);
      return;
    }

    if (res.status === 404) {
      setMode("create");
      setLoading(false);
      return;
    }

    setError("오류가 발생했습니다. 다시 시도해주세요.");
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const normalized = normalizedCode();
    setLoading(true);
    setError("");

    const createRes = await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: normalized, password: createPassword || undefined }),
    });

    if (createRes.ok) {
      router.push(`/${normalized}`);
      return;
    }

    const data = await createRes.json();
    setError(data.error ?? "게임 생성에 실패했습니다");
    setLoading(false);
  }

  async function handlePasswordEntry(e: React.FormEvent) {
    e.preventDefault();
    const normalized = normalizedCode();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/games/${normalized}/verify-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: entryPassword }),
    });

    if (res.ok) {
      router.push(`/${normalized}`);
      return;
    }

    const data = await res.json();
    setError(data.error ?? "비밀번호가 틀렸습니다");
    setLoading(false);
  }

  function handleBack() {
    setMode("enter");
    setError("");
    setCreatePassword("");
    setEntryPassword("");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-600 to-blue-700 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
        <div className="text-5xl mb-2">⚽</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          2026 월드컵 예측 게임
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          친구들과 함께 예측하고 점수를 겨뤄보세요!
        </p>

        {mode === "enter" && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="게임 코드 입력 (예: ABC1234)"
              maxLength={7}
              className="border border-gray-300 rounded-lg px-4 py-3 text-center text-lg font-mono tracking-wide uppercase text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading || code.length < 7}
              className="bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "확인 중..." : "입장하기"}
            </button>
          </form>
        )}

        {mode === "create" && (
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600 text-left">
              <p className="font-semibold text-gray-800 mb-1">
                새 게임 만들기: <span className="font-mono tracking-widest">{normalizedCode()}</span>
              </p>
              <p className="text-xs text-gray-400">이 코드로 새 게임을 만들겠습니다.</p>
            </div>
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                비밀번호 설정 <span className="text-gray-400 font-normal">(선택사항)</span>
              </label>
              <input
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="비밀번호 없이 만들려면 비워두세요"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                비밀번호를 설정하면 입장 시 확인합니다
              </p>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? "생성 중..." : "게임 만들기"}
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              ← 돌아가기
            </button>
          </form>
        )}

        {mode === "password" && (
          <form onSubmit={handlePasswordEntry} className="flex flex-col gap-3">
            <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600 text-left">
              <p className="font-semibold text-gray-800 mb-1">
                게임 코드: <span className="font-mono tracking-widest">{normalizedCode()}</span>
              </p>
              <p className="text-xs text-gray-400">이 게임은 비밀번호로 보호되어 있습니다.</p>
            </div>
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                value={entryPassword}
                onChange={(e) => setEntryPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading || entryPassword.length === 0}
              className="bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? "확인 중..." : "입장하기"}
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              ← 돌아가기
            </button>
          </form>
        )}

        {mode === "enter" && (
          <p className="mt-4 text-xs text-gray-400">
            코드가 없으면 새 코드를 입력해 게임을 만들 수 있어요
          </p>
        )}
      </div>
    </main>
  );
}
