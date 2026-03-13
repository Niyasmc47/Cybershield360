"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    Terminal,
    KeyRound,
    Lock,
    ShieldCheck,
    Trophy,
    Timer,
    CheckCircle2,
    XCircle,
    Zap,
    RefreshCw,
} from "lucide-react";
import AccountScoreBar from "@/components/account-score-bar";
import { addTotalScore, getUser, syncScoreToDb } from "@/lib/session";

// --- Types ---
type GameState = "intro" | "playing" | "result";

interface Rule {
    label: string;
    check: (pw: string) => boolean;
}

interface Round {
    id: number;
    difficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
    rules: Rule[];
}

// --- Rounds ---
const ROUNDS: Round[] = [
    {
        id: 1,
        difficulty: "EASY",
        rules: [
            { label: "Must be exactly 8 characters long", check: (pw) => pw.length === 8 },
            { label: "Must contain at least one uppercase letter", check: (pw) => /[A-Z]/.test(pw) },
            { label: "Must contain at least one digit", check: (pw) => /\d/.test(pw) },
        ],
    },
    {
        id: 2,
        difficulty: "EASY",
        rules: [
            { label: "Must be at least 10 characters long", check: (pw) => pw.length >= 10 },
            { label: "Must start with a lowercase letter", check: (pw) => /^[a-z]/.test(pw) },
            { label: "Must end with a special character (!@#$%^&*)", check: (pw) => /[!@#$%^&*]$/.test(pw) },
        ],
    },
    {
        id: 3,
        difficulty: "MEDIUM",
        rules: [
            { label: "Must be exactly 12 characters long", check: (pw) => pw.length === 12 },
            { label: "Must contain at least 2 digits", check: (pw) => (pw.match(/\d/g) || []).length >= 2 },
            { label: "Must not contain the letter 'e' (case-insensitive)", check: (pw) => !/[eE]/.test(pw) },
        ],
    },
    {
        id: 4,
        difficulty: "MEDIUM",
        rules: [
            { label: "Must be between 10-14 characters long", check: (pw) => pw.length >= 10 && pw.length <= 14 },
            { label: "Position 3 must be an uppercase letter", check: (pw) => pw.length >= 3 && /[A-Z]/.test(pw[2]) },
            { label: "Must contain at least one special character", check: (pw) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw) },
            { label: "Must not contain spaces", check: (pw) => !/\s/.test(pw) },
        ],
    },
    {
        id: 5,
        difficulty: "HARD",
        rules: [
            { label: "Must be exactly 15 characters long", check: (pw) => pw.length === 15 },
            { label: "Must contain at least 3 uppercase letters", check: (pw) => (pw.match(/[A-Z]/g) || []).length >= 3 },
            { label: "Must contain at least 2 special characters", check: (pw) => (pw.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/g) || []).length >= 2 },
            { label: "First character must be a digit", check: (pw) => /^\d/.test(pw) },
        ],
    },
    {
        id: 6,
        difficulty: "HARD",
        rules: [
            { label: "Must be between 12-16 characters long", check: (pw) => pw.length >= 12 && pw.length <= 16 },
            {
                label: "First 6 chars must alternate letter-digit (e.g., a1b2c3)",
                check: (pw) => {
                    if (pw.length < 6) return false;
                    for (let i = 0; i < 6; i++) {
                        if (i % 2 === 0 && !/[a-zA-Z]/.test(pw[i])) return false;
                        if (i % 2 === 1 && !/\d/.test(pw[i])) return false;
                    }
                    return true;
                },
            },
            { label: "Must end with two uppercase letters", check: (pw) => pw.length >= 2 && /[A-Z]{2}$/.test(pw) },
        ],
    },
    {
        id: 7,
        difficulty: "EXPERT",
        rules: [
            { label: "Must be exactly 16 characters long", check: (pw) => pw.length === 16 },
            { label: "Must contain at least one lowercase letter", check: (pw) => /[a-z]/.test(pw) },
            { label: "Must contain at least one uppercase letter", check: (pw) => /[A-Z]/.test(pw) },
            { label: "Must contain at least one digit", check: (pw) => /\d/.test(pw) },
            { label: "Must contain at least one special character", check: (pw) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw) },
            {
                label: "No two consecutive characters can be the same",
                check: (pw) => {
                    for (let i = 1; i < pw.length; i++) {
                        if (pw[i] === pw[i - 1]) return false;
                    }
                    return true;
                },
            },
            { label: 'Must contain the substring "Cy" somewhere', check: (pw) => pw.includes("Cy") },
        ],
    },
    {
        id: 8,
        difficulty: "EXPERT",
        rules: [
            { label: "Must be between 14-18 characters long", check: (pw) => pw.length >= 14 && pw.length <= 18 },
            { label: "Must start and end with the same character", check: (pw) => pw.length >= 2 && pw[0] === pw[pw.length - 1] },
            { label: "Must contain at least 4 digits", check: (pw) => (pw.match(/\d/g) || []).length >= 4 },
            {
                label: "Must contain exactly 2 special characters",
                check: (pw) => (pw.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/g) || []).length === 2,
            },
            {
                label: "No character can appear more than 3 times",
                check: (pw) => {
                    const freq: Record<string, number> = {};
                    for (const c of pw) {
                        freq[c] = (freq[c] || 0) + 1;
                        if (freq[c] > 3) return false;
                    }
                    return true;
                },
            },
        ],
    },
];

const TIME_PER_ROUND = 30;
const POINTS_PER_ROUND = 15;

const DIFFICULTY_COLORS: Record<string, string> = {
    EASY: "text-green-400",
    MEDIUM: "text-yellow-400",
    HARD: "text-orange-400",
    EXPERT: "text-red-400",
};

export default function PasswordChallenge() {
    const [gameState, setGameState] = useState<GameState>("intro");
    const [currentRound, setCurrentRound] = useState(0);
    const [password, setPassword] = useState("");
    const [timeLeft, setTimeLeft] = useState(TIME_PER_ROUND);
    const [score, setScore] = useState(0);
    const [roundsCompleted, setRoundsCompleted] = useState(0);
    const [scoreRecorded, setScoreRecorded] = useState(false);

    // Timer
    useEffect(() => {
        if (gameState !== "playing") return;

        if (timeLeft <= 0) {
            advanceRound(false);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, gameState]);

    const advanceRound = useCallback(
        (passed: boolean) => {
            if (passed) {
                const bonus = Math.floor(timeLeft / 3);
                setScore((prev) => prev + POINTS_PER_ROUND + bonus);
                setRoundsCompleted((prev) => prev + 1);
            }

            const next = currentRound + 1;
            if (next < ROUNDS.length) {
                setCurrentRound(next);
                setPassword("");
                setTimeLeft(TIME_PER_ROUND);
            } else {
                setGameState("result");
            }
        },
        [currentRound, timeLeft]
    );

    const handleStart = () => {
        setGameState("playing");
        setCurrentRound(0);
        setPassword("");
        setScore(0);
        setRoundsCompleted(0);
        setTimeLeft(TIME_PER_ROUND);
        setScoreRecorded(false);
    };

    const handleRestart = () => {
        setGameState("intro");
        setScoreRecorded(false);
    };

    // Score sync
    useEffect(() => {
        if (gameState === "result" && !scoreRecorded) {
            addTotalScore(score);
            syncScoreToDb();
            setScoreRecorded(true);
        }
    }, [gameState, score, scoreRecorded]);

    const round = ROUNDS[currentRound];
    const allPassed = round ? round.rules.every((r) => r.check(password)) : false;

    // --- Navbar (shared across all states) ---
    const navbar = (
        <>
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
        </>
    );

    // --- Intro ---
    if (gameState === "intro") {
        return (
            <main className="min-h-screen bg-background text-foreground font-mono relative overflow-hidden">
                {navbar}

                <section className="relative px-6 pt-20 pb-12 text-center">
                    <div className="pointer-events-none absolute top-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-neon-green/5 blur-[120px]" />

                    <div className="relative z-10 mx-auto max-w-2xl">
                        <div className="mb-6 flex justify-center text-neon-green">
                            <KeyRound size={48} className="animate-pulse" />
                        </div>
                        <h1 className="mb-4 text-4xl font-bold tracking-tighter sm:text-5xl text-foreground">
                            Password <span className="text-neon-green">Forge</span>
                        </h1>
                        <p className="text-lg text-secondary mb-8">
                            <span className="text-neon-green opacity-50">{">"} </span>
                            Initializing credential crafting protocol...
                        </p>
                    </div>
                </section>

                <section className="mx-auto max-w-2xl px-6 pb-20">
                    <div className="border border-neon-green/20 bg-surface rounded-lg p-8 shadow-[0_0_30px_rgba(13,242,89,0.05)] relative">
                        {/* Corner accents */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-neon-green/50" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-neon-green/50" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-neon-green/50" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-neon-green/50" />

                        <div className="flex items-center gap-3 mb-6">
                            <Lock className="text-neon-green" size={20} />
                            <h2 className="text-lg font-bold text-neon-green tracking-wider">MISSION BRIEFING</h2>
                        </div>

                        <div className="space-y-4 text-sm text-secondary mb-8">
                            <p>
                                Welcome to the <span className="text-neon-green">Password Forge</span> — an advanced credential crafting simulation.
                                Your mission: construct passwords that satisfy increasingly complex security constraints.
                            </p>
                            <div className="border border-neon-green/10 bg-background rounded p-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Zap size={14} className="text-yellow-400" />
                                    <span><span className="text-foreground font-bold">8 rounds</span> of escalating difficulty</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Timer size={14} className="text-orange-400" />
                                    <span><span className="text-foreground font-bold">30 seconds</span> per round — craft fast or fail</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-green-400" />
                                    <span>Rules validate <span className="text-foreground font-bold">in real-time</span> as you type</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Trophy size={14} className="text-neon-green" />
                                    <span><span className="text-foreground font-bold">+15 points</span> per round + time bonus</span>
                                </div>
                            </div>
                            <p className="text-xs text-secondary/70">
                                Difficulty progresses from <span className="text-green-400">EASY</span> →{" "}
                                <span className="text-yellow-400">MEDIUM</span> →{" "}
                                <span className="text-orange-400">HARD</span> →{" "}
                                <span className="text-red-400">EXPERT</span>. Only the strongest passwords survive.
                            </p>
                        </div>

                        <button
                            onClick={handleStart}
                            className="w-full bg-neon-green/10 hover:bg-neon-green/20 border border-neon-green/40 hover:border-neon-green/60 text-neon-green font-bold py-3 rounded transition-all shadow-[0_0_15px_rgba(13,242,89,0.1)] hover:shadow-[0_0_25px_rgba(13,242,89,0.2)] flex items-center justify-center gap-2"
                        >
                            <ShieldCheck size={18} />
                            [ INITIATE_PROTOCOL ]
                        </button>
                    </div>
                </section>
            </main>
        );
    }

    // --- Result ---
    if (gameState === "result") {
        return (
            <main className="min-h-screen bg-background text-foreground font-mono relative overflow-hidden">
                {navbar}

                <section className="flex flex-1 items-center justify-center px-6 pt-20 pb-20">
                    <div className="mx-auto max-w-md w-full border border-neon-green/30 bg-surface p-8 rounded-lg shadow-[0_0_30px_rgba(13,242,89,0.1)] relative text-center">
                        {/* Corner accents */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-neon-green/50" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-neon-green/50" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-neon-green/50" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-neon-green/50" />

                        <div className="mb-4 flex justify-center">
                            <Trophy size={48} className="text-neon-green animate-pulse" />
                        </div>

                        <h2 className="text-neon-green text-sm tracking-widest mb-2">PROTOCOL COMPLETE</h2>
                        <h1 className="text-3xl font-bold text-foreground mb-6">FORGE RESULTS</h1>

                        <div className="py-6 border-y border-neon-green/10 mb-6 space-y-4">
                            <div>
                                <p className="text-xs text-secondary tracking-wider mb-1">ROUNDS COMPLETED</p>
                                <p className="text-4xl font-black text-neon-green">
                                    {roundsCompleted} <span className="text-xl text-secondary">/ {ROUNDS.length}</span>
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-secondary tracking-wider mb-1">TOTAL SCORE EARNED</p>
                                <p className="text-4xl font-black text-neon-green drop-shadow-[0_0_10px_rgba(13,242,89,0.4)]">
                                    {score}
                                </p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-xs text-secondary mb-1">FORGE RATING:</p>
                            <p className="text-lg font-bold tracking-widest text-cyan-400">
                                {roundsCompleted === 8
                                    ? "MASTER CRYPTOGRAPHER"
                                    : roundsCompleted >= 6
                                    ? "SENIOR KEY SMITH"
                                    : roundsCompleted >= 4
                                    ? "APPRENTICE FORGER"
                                    : "NOVICE CRAFTER"}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleRestart}
                                className="w-full border border-neon-green/40 hover:bg-neon-green/10 text-neon-green font-bold py-3 rounded transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={16} /> RESTART_PROTOCOL
                            </button>
                            <Link
                                href="/"
                                className="w-full bg-surface hover:bg-surface/80 text-foreground font-bold py-3 rounded transition-colors block text-center border border-neon-green/20"
                            >
                                RETURN TO DASHBOARD
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    // --- Playing ---
    return (
        <main className="min-h-screen bg-background text-foreground font-mono relative overflow-hidden flex flex-col">
            {navbar}

            <div className="flex-1 flex flex-col items-center px-6 pt-10 pb-20">
                {/* Round header */}
                <div className="w-full max-w-2xl mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <KeyRound className="text-neon-green" size={20} />
                            <h2 className="text-lg font-bold text-foreground tracking-wider">
                                ROUND {round.id} <span className="text-sm text-secondary">/ {ROUNDS.length}</span>
                            </h2>
                        </div>
                        <span
                            className={`text-xs font-bold tracking-widest px-3 py-1 rounded border ${
                                round.difficulty === "EASY"
                                    ? "border-green-400/30 bg-green-400/10 text-green-400"
                                    : round.difficulty === "MEDIUM"
                                    ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-400"
                                    : round.difficulty === "HARD"
                                    ? "border-orange-400/30 bg-orange-400/10 text-orange-400"
                                    : "border-red-400/30 bg-red-400/10 text-red-400"
                            }`}
                        >
                            {round.difficulty}
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-surface h-1 rounded-full mb-1">
                        <div
                            className="bg-gradient-to-r from-neon-green to-cyan-400 h-full rounded-full transition-all duration-300"
                            style={{ width: `${(currentRound / ROUNDS.length) * 100}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-secondary">
                        <span>{currentRound} / {ROUNDS.length} completed</span>
                        <span>Score: {score}</span>
                    </div>
                </div>

                {/* Timer */}
                <div className="mb-8 flex items-center gap-3">
                    <Timer
                        size={20}
                        className={timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-neon-green"}
                    />
                    <div className="flex items-center gap-2 bg-surface border border-neon-green/20 rounded-full px-5 py-2">
                        <span
                            className={`w-2 h-2 rounded-full ${
                                timeLeft <= 10 ? "bg-red-400 animate-pulse" : "bg-neon-green animate-pulse"
                            }`}
                        />
                        <span
                            className={`text-2xl font-bold tabular-nums ${
                                timeLeft <= 5
                                    ? "text-red-400 animate-pulse"
                                    : timeLeft <= 10
                                    ? "text-orange-400"
                                    : "text-neon-green"
                            }`}
                        >
                            {timeLeft}s
                        </span>
                    </div>
                </div>

                {/* Rules panel */}
                <div className="w-full max-w-2xl border border-neon-green/20 bg-surface rounded-lg p-6 mb-6 relative">
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-neon-green/50" />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-neon-green/50" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-neon-green/50" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-neon-green/50" />

                    <div className="flex items-center gap-2 mb-4">
                        <Lock size={14} className="text-neon-green" />
                        <h3 className="text-xs font-bold text-neon-green tracking-widest">CONSTRAINTS</h3>
                    </div>

                    <ul className="space-y-3">
                        {round.rules.map((rule, i) => {
                            const passed = password.length > 0 && rule.check(password);
                            return (
                                <li key={i} className="flex items-start gap-3">
                                    {password.length === 0 ? (
                                        <span className="w-5 h-5 rounded-full border border-secondary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-secondary/30" />
                                        </span>
                                    ) : passed ? (
                                        <CheckCircle2
                                            size={20}
                                            className="text-green-400 flex-shrink-0 mt-0.5 drop-shadow-[0_0_6px_rgba(74,222,128,0.5)]"
                                        />
                                    ) : (
                                        <XCircle
                                            size={20}
                                            className="text-red-400 flex-shrink-0 mt-0.5 drop-shadow-[0_0_6px_rgba(248,113,113,0.5)]"
                                        />
                                    )}
                                    <span
                                        className={`text-sm ${
                                            password.length === 0
                                                ? "text-secondary"
                                                : passed
                                                ? "text-green-400"
                                                : "text-red-400"
                                        } transition-colors`}
                                    >
                                        {rule.label}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Password input */}
                <div className="w-full max-w-2xl mb-6">
                    <label className="block text-xs text-neon-green tracking-widest mb-2">
                        CRAFT YOUR PASSWORD
                    </label>
                    <input
                        type="text"
                        autoFocus
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-background border border-neon-green/30 rounded px-4 py-3 text-foreground outline-none focus:border-neon-green focus:shadow-[0_0_15px_rgba(13,242,89,0.15)] transition-all font-mono text-lg tracking-wider"
                        placeholder="Type your password here..."
                        spellCheck={false}
                        autoComplete="off"
                    />
                    <p className="text-xs text-secondary mt-2">
                        Length: <span className="text-foreground">{password.length}</span> characters
                    </p>
                </div>

                {/* Submit button */}
                <button
                    onClick={() => advanceRound(true)}
                    disabled={!allPassed}
                    className={`w-full max-w-2xl font-bold py-3 rounded transition-all flex items-center justify-center gap-2 ${
                        allPassed
                            ? "bg-neon-green/10 border border-neon-green/50 text-neon-green hover:bg-neon-green/20 hover:shadow-[0_0_20px_rgba(13,242,89,0.2)] cursor-pointer"
                            : "bg-surface border border-neon-green/10 text-secondary/50 cursor-not-allowed"
                    }`}
                >
                    <Zap size={16} />
                    {allPassed ? "[ SUBMIT_PASSWORD ]" : "[ SATISFY ALL CONSTRAINTS ]"}
                </button>
            </div>
        </main>
    );
}
