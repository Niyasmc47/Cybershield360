"use client";

import React from "react";
import Link from "next/link";
import { Terminal, Lightbulb, Gamepad2, BrainCircuit, Users, KeyRound } from "lucide-react";
import AccountScoreBar from "@/components/account-score-bar";

export default function GamesHub() {
    return (
        <main className="min-h-screen bg-background text-foreground pb-20 font-sans relative overflow-hidden">
            {/* Global Scanline Effect */}
            <div className="animate-scanline" />

            {/* Navbar */}
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

            {/* Header Section */}
            <section className="relative px-6 pt-20 pb-12 text-center">
                <div className="pointer-events-none absolute top-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-neon-green/5 blur-[120px]" />

                <div className="relative z-10 mx-auto max-w-3xl">
                    <div className="mb-6 flex justify-center text-neon-green">
                        <Gamepad2 size={48} />
                    </div>
                    <h1 className="mb-4 font-mono text-4xl font-bold tracking-tighter sm:text-5xl text-foreground">
                        Cyber Training <span className="text-neon-green">Hub</span>
                    </h1>
                    <p className="text-lg text-secondary mb-8 font-mono">
                        <span className="text-neon-green opacity-50">{">"} </span>
                        Select an interactive module to test your digital perimeter defense skills.
                    </p>
                </div>
            </section>

            {/* Games Selection Grid */}
            <section className="px-6 relative z-10 max-w-5xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 font-mono">

                    {/* Multiplayer Card */}
                    <Link
                        href="/multiplayer"
                        className="group relative flex flex-col p-8 rounded-lg border border-neon-green/50 bg-[#1a2e22]/90 md:col-span-2 hover:border-neon-green hover:bg-[#1d3326] transition-colors duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-neon-green opacity-100 translate-x-1 -translate-y-1"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-neon-green opacity-100 -translate-x-1 translate-y-1"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(13,242,89,0.08),transparent_70%)]" />

                        

                        <div className="inline-flex h-16 w-16 mb-6 items-center justify-center rounded-lg border border-neon-green/20 bg-neon-green/10 text-neon-green group-hover:animate-pulse">
                            <Users size={32} />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-neon-green transition-colors">1v1 Multiplayer</h2>
                        <p className="text-sm border-l-2 border-neon-green/30 pl-3 leading-relaxed text-slate-400 flex-1 max-w-3xl">
                            Real-time head-to-head match. Create a room code, challenge another player instantly, answer 10 questions simultaneously, and climb the shared score system faster.
                        </p>

                        <div className="mt-8 flex items-center justify-between font-bold text-xs uppercase tracking-widest text-slate-500 group-hover:text-neon-green transition-colors">
                            <span>Status: Featured</span>
                            <span>[ INIT_1V1 ]</span>
                        </div>
                    </Link>

                    {/* Quiz Card */}
                    <Link
                        href="/iq-test"
                        className="group relative flex flex-col p-8 rounded-lg border border-slate-700 bg-surface/80 hover:border-cyan-500/50 hover:bg-[#1e293b]/90 transition-colors duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 -translate-y-1"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 translate-y-1"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.05),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="inline-flex h-16 w-16 mb-6 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 group-hover:animate-pulse">
                            <BrainCircuit size={32} />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">Cyber IQ Test</h2>
                        <p className="text-sm border-l-2 border-cyan-500/30 pl-3 leading-relaxed text-slate-400 flex-1">
                            A high-speed 10-question evaluation assessing your theoretical knowledge across modern threat vectors including Phishing, Malware, Data Backup, and Network Intrusion.
                        </p>

                        <div className="mt-8 flex items-center justify-between font-bold text-xs uppercase tracking-widest text-slate-500 group-hover:text-cyan-400 transition-colors">
                            <span>Status: Online</span>
                            <span>[ INIT_QUIZ ]</span>
                        </div>
                    </Link>

                    {/* Password Challenge Card */}
                    <Link
                        href="/password-challenge"
                        className="group relative flex flex-col p-8 rounded-lg border border-purple-500/30 bg-surface/80 hover:border-purple-400/50 hover:bg-[#2a1a2e]/90 transition-colors duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-400 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 -translate-y-1"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-400 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 translate-y-1"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.05),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="inline-flex h-16 w-16 mb-6 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-400 group-hover:animate-pulse">
                            <KeyRound size={32} />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">Password Challenge</h2>
                        <p className="text-sm border-l-2 border-purple-500/30 pl-3 leading-relaxed text-slate-400 flex-1">
                            Craft passwords that meet increasingly complex rules. Match length limits, character positions, and patterns across 8 escalating rounds against the clock.
                        </p>

                        <div className="mt-8 flex items-center justify-between font-bold text-xs uppercase tracking-widest text-slate-500 group-hover:text-purple-400 transition-colors">
                            <span>8 Rounds</span>
                            <span>[ CRAFT_PWD ]</span>
                        </div>
                    </Link>

                    {/* Puzzle Card */}
                    <Link
                        href="/puzzles"
                        className="group relative flex flex-col p-8 rounded-lg border border-orange-500/30 bg-surface/80 hover:border-orange-400/50 hover:bg-[#2e241a]/90 transition-colors duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-orange-400 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 -translate-y-1"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-orange-400 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 translate-y-1"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(234,88,12,0.05),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="inline-flex h-16 w-16 mb-6 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/10 text-orange-400 group-hover:animate-pulse">
                            <Lightbulb size={32} />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">Scam Detection Games</h2>
                        <p className="text-sm border-l-2 border-orange-500/30 pl-3 leading-relaxed text-slate-400 flex-1">
                            4 game modes: Inbox Triage, Chat Scam Simulator, Spot the Red Flags, and Decision Chain. Train your scam detection skills across every format.
                        </p>

                        <div className="mt-8 flex items-center justify-between font-bold text-xs uppercase tracking-widest text-slate-500 group-hover:text-orange-400 transition-colors">
                            <span>4 Games Ready</span>
                            <span>[ PLAY_NOW ]</span>
                        </div>
                    </Link>

                </div>
            </section>
        </main>
    );
}
