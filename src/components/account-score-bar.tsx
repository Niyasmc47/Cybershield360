"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, User, ListOrdered } from "lucide-react";
import { clearSession, getTotalScore, getUser } from "@/lib/session";

export default function AccountScoreBar() {
  const [username, setUsername] = useState<string>("Guest");
  const [score, setScore] = useState<number>(0);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const user = getUser();
    setLoggedIn(!!user);
    setUsername(user?.username || "Guest");
    setScore(getTotalScore());

    const onStorage = () => {
      const updatedUser = getUser();
      setLoggedIn(!!updatedUser);
      setUsername(updatedUser?.username || "Guest");
      setScore(getTotalScore());
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("cybershield-session-updated", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cybershield-session-updated", onStorage);
    };
  }, []);

  const handleLogout = () => {
    clearSession();
    setLoggedIn(false);
    setUsername("Guest");
    setScore(0);
  };

  return (
    <div className="flex items-center gap-3 font-mono text-xs">
      <div className="inline-flex items-center gap-2 rounded border border-slate-700 bg-surface px-3 py-1 text-secondary">
        <User size={14} className="text-neon-green" />
        <span>{username}</span>
      </div>
      <div className="inline-flex items-center gap-2 rounded border border-neon-green/40 bg-neon-green/10 px-3 py-1 text-neon-green">
        <Trophy size={14} />
        <span>Score: {score}</span>
      </div>
      <Link
        href="/leaderboard"
        className="inline-flex items-center gap-2 rounded border border-slate-700 bg-surface px-3 py-1 text-secondary hover:border-neon-green/50 hover:text-neon-green transition-colors"
        title="Leaderboard"
      >
        <ListOrdered size={14} />
        <span className="hidden md:inline">Leaderboard</span>
      </Link>
      {loggedIn && (
        <button
          onClick={handleLogout}
          className="rounded border border-slate-700 px-3 py-1 text-secondary hover:text-foreground"
        >
          Logout
        </button>
      )}
    </div>
  );
}