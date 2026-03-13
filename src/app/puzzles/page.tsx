"use client";

import Link from "next/link";
import { BrainCircuit, Crosshair, MailWarning, MessageSquareWarning, Shield, Terminal } from "lucide-react";
import AccountScoreBar from "@/components/account-score-bar";

const games = [
    {
        slug: "inbox-triage",
        title: "Inbox Triage",
        icon: <MailWarning size={24} className="text-neon-green" />,
        difficulty: "Medium",
        description: "Classify 10 emails as Phishing, Suspicious, or Safe before the timer runs out. How sharp is your eye?",
        border: "border-neon-green/40",
        badge: "bg-neon-green/10 text-neon-green",
    },
    {
        slug: "chat-scam",
        title: "Chat Scam Simulator",
        icon: <MessageSquareWarning size={24} className="text-cyan-400" />,
        difficulty: "Hard",
        description: "Navigate fake WhatsApp and SMS conversations. Every decision you make changes the outcome.",
        border: "border-cyan-400/40",
        badge: "bg-cyan-400/10 text-cyan-400",
    },
    {
        slug: "spot-red-flags",
        title: "Spot the Red Flags",
        icon: <Crosshair size={24} className="text-yellow-400" />,
        difficulty: "Easy",
        description: "Read fake webpages and phishing emails. Click on every suspicious element before time is up.",
        border: "border-yellow-400/40",
        badge: "bg-yellow-400/10 text-yellow-400",
    },
    {
        slug: "decision-chain",
        title: "Decision Chain",
        icon: <BrainCircuit size={24} className="text-purple-400" />,
        difficulty: "Medium",
        description: "A scam story unfolds step by step. Your choices build your risk score. Can you reach the safe ending?",
        border: "border-purple-400/40",
        badge: "bg-purple-400/10 text-purple-400",
    },
];

const difficultyColor: Record<string, string> = {
    Easy: "text-neon-green",
    Medium: "text-yellow-400",
    Hard: "text-red-400",
};

export default function PuzzlesHub() {
    return (
        <main className="min-h-screen bg-[#0f172a] text-[#e2e8f0] font-mono relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,136,0.04),transparent_60%)] pointer-events-none" />
            <div className="animate-scanline" />

            <nav className="sticky top-0 z-50 border-b border-neon-green/20 bg-[#0f172a]">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-wider group">
                        <Terminal className="text-neon-green group-hover:animate-pulse" />
                        <span>
                            Cyber<span className="text-neon-green">Shield</span> 360
                        </span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/games" className="text-sm text-[#94a3b8] hover:text-neon-green transition-colors">
                            ← Back to Games
                        </Link>
                        <AccountScoreBar />
                    </div>
                </div>
            </nav>

            <div className="mx-auto max-w-5xl px-6 py-16">
                <div className="mb-12 text-center">
                    <div className="mb-2 flex items-center justify-center gap-2 text-xs text-neon-green tracking-widest">
                        <Shield size={14} />
                        <span>PUZZLE_ARENA</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight mb-4">
                        Scam <span className="text-neon-green">Detection</span> Games
                    </h1>
                    <p className="text-[#94a3b8] max-w-lg mx-auto text-sm leading-relaxed">
                        Four game modes. Each one trains a different real-world scam detection skill. Pick one and start playing.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {games.map((g) => (
                        <Link key={g.slug} href={`/puzzles/${g.slug}`} className="group block">
                            <div className={`rounded-xl border ${g.border} bg-[#1e293b]/60 p-6 hover:bg-[#1e293b] transition-colors duration-150`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-[#0f172a]">{g.icon}</div>
                                        <div>
                                            <h2 className="font-bold text-lg tracking-wide">{g.title}</h2>
                                            <span className={`text-xs font-mono ${difficultyColor[g.difficulty]}`}>
                                                DIFFICULTY: {g.difficulty.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded font-mono ${g.badge}`}>PLAY</span>
                                </div>
                                <p className="text-sm text-[#94a3b8] leading-relaxed">{g.description}</p>
                                <div className="mt-4 text-xs text-[#64748b] group-hover:text-neon-green transition-colors tracking-wider">
                                    [ LAUNCH_GAME ] →
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
