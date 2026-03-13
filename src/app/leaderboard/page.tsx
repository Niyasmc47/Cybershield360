"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Terminal, Medal, Trophy, Crown } from "lucide-react";
import AccountScoreBar from "@/components/account-score-bar";
import { getBackendUrl } from "@/lib/backend-url";

interface LeaderboardEntry {
    username: string;
    total_score: number;
}

export default function LeaderboardPage() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const backendUrl = getBackendUrl();
        const isNgrok = backendUrl.includes("ngrok-free.app") || backendUrl.includes("ngrok.app");

        fetch(`${backendUrl}/api/leaderboard/global`, {
            headers: isNgrok ? { "ngrok-skip-browser-warning": "1" } : {},
        })
            .then((res) => res.json())
            .then((data) => setEntries(data))
            .catch(() => setEntries([]))
            .finally(() => setLoading(false));
    }, []);

    const rankIcon = (rank: number) => {
        if (rank === 1) return <Crown size={20} className="text-yellow-400" />;
        if (rank === 2) return <Medal size={20} className="text-slate-300" />;
        if (rank === 3) return <Medal size={20} className="text-amber-600" />;
        return <span className="text-sm font-bold text-[#64748b] w-5 text-center">{rank}</span>;
    };

    const rankBorder = (rank: number) => {
        if (rank === 1) return "border-yellow-400/50 bg-yellow-400/5";
        if (rank === 2) return "border-slate-400/30 bg-slate-400/5";
        if (rank === 3) return "border-amber-600/30 bg-amber-600/5";
        return "border-slate-700 bg-surface/50";
    };

    return (
        <main className="min-h-screen bg-background text-foreground pb-20 font-sans relative overflow-hidden">
            <div className="animate-scanline" />

            <nav className="sticky top-0 z-50 border-b border-neon-green/20 bg-[#050505]/95">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center gap-3 text-xl font-bold font-mono tracking-wider group">
                        <Terminal className="text-neon-green group-hover:animate-pulse" />
                        <span>
                            Cyber<span className="text-neon-green">Shield</span> 360
                        </span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <AccountScoreBar />
                        <Link
                            href="/"
                            className="text-sm font-mono font-medium text-secondary transition hover:text-neon-green hover:underline decoration-neon-green/50 underline-offset-4"
                        >
                            {"<-"} Back to Home
                        </Link>
                    </div>
                </div>
            </nav>

            <section className="relative px-6 pt-20 pb-12 text-center">
                <div className="pointer-events-none absolute top-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-yellow-400/5 blur-[120px]" />

                <div className="relative z-10 mx-auto max-w-3xl">
                    <div className="mb-6 flex justify-center text-yellow-400">
                        <Trophy size={48} />
                    </div>
                    <h1 className="mb-4 font-mono text-4xl font-bold tracking-tighter sm:text-5xl text-foreground">
                        Leader<span className="text-yellow-400">board</span>
                    </h1>
                    <p className="text-lg text-secondary mb-8 font-mono">
                        <span className="text-yellow-400 opacity-50">{">"} </span>
                        Top 15 operatives ranked by total score across all training modules.
                    </p>
                </div>
            </section>

            <section className="px-6 relative z-10 max-w-2xl mx-auto">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent mb-4" />
                        <div className="text-sm text-secondary font-mono">Loading rankings...</div>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="text-center py-20 font-mono">
                        <Medal size={48} className="text-[#64748b] mx-auto mb-4" />
                        <div className="text-secondary text-sm">No ranked players yet. Be the first!</div>
                    </div>
                ) : (
                    <div className="space-y-3 font-mono">
                        {entries.map((entry, i) => {
                            const rank = i + 1;
                            return (
                                <div
                                    key={i}
                                    className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${rankBorder(rank)}`}
                                >
                                    <div className="flex items-center justify-center w-8 shrink-0">
                                        {rankIcon(rank)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-sm font-bold truncate ${rank <= 3 ? "text-foreground" : "text-secondary"}`}>
                                            {entry.username}
                                        </div>
                                    </div>
                                    <div className={`text-sm font-bold tabular-nums ${rank === 1 ? "text-yellow-400" : "text-neon-green"}`}>
                                        {entry.total_score.toLocaleString()} pts
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}
