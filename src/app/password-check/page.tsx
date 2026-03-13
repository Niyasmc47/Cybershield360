"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KeyRound, Shield, Eye, EyeOff, AlertTriangle, CheckCircle, Terminal } from "lucide-react";
import AccountScoreBar from "@/components/account-score-bar";
import { getBackendUrl } from "@/lib/backend-url";

interface CrackTimeEstimates {
    online_throttled: string;
    online_unthrottled: string;
    offline_slow_hash: string;
    offline_fast_hash: string;
}

interface PasswordDetails {
    length: number;
    has_uppercase: boolean;
    has_lowercase: boolean;
    has_digits: boolean;
    has_special: boolean;
}

interface PasswordResult {
    strength: string;
    score: number;
    breach_count: number;
    crack_times: CrackTimeEstimates;
    feedback: string[];
    details: PasswordDetails & { character_pool: number };
}

export default function PasswordCheck() {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PasswordResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCheck = async () => {
        if (!password.trim()) return;
        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const res = await fetch(`${getBackendUrl()}/api/password/check`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            if (!res.ok) throw new Error("Failed to check password");
            const data = await res.json();
            setResult(data);
        } catch {
            setError("Failed to check password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const strengthColor = (strength: string) => {
        const s = strength.toLowerCase();
        if (s.includes("weak")) return "text-red-400";
        if (s === "medium") return "text-yellow-400";
        return "text-neon-green";
    };

    const strengthBorderColor = (strength: string) => {
        const s = strength.toLowerCase();
        if (s.includes("weak")) return "border-red-500/30";
        if (s === "medium") return "border-yellow-500/30";
        return "border-neon-green/30";
    };

    const strengthBgColor = (strength: string) => {
        const s = strength.toLowerCase();
        if (s.includes("weak")) return "bg-red-500/10";
        if (s === "medium") return "bg-yellow-500/10";
        return "bg-neon-green/10";
    };

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
                        <KeyRound size={48} />
                    </div>
                    <h1 className="mb-4 font-mono text-4xl font-bold tracking-tighter sm:text-5xl text-foreground">
                        Password <span className="text-neon-green">Checker</span>
                    </h1>
                    <p className="text-lg text-secondary mb-8 font-mono">
                        <span className="text-neon-green opacity-50">{">"} </span>
                        Analyze your password strength, check for breaches, and get actionable feedback.
                    </p>
                </div>
            </section>

            {/* Password Input Section */}
            <section className="px-6 relative z-10 max-w-2xl mx-auto">
                <div className="rounded-lg border border-neon-green/20 bg-surface/80 p-8 font-mono shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                    <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-3">
                        Enter Password
                    </label>
                    <div className="relative mb-6">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                            placeholder="Type your password here..."
                            className="w-full rounded border border-slate-700 bg-black px-4 py-3 pr-12 font-mono text-sm text-foreground placeholder:text-slate-600 focus:border-neon-green/50 focus:outline-none focus:ring-1 focus:ring-neon-green/30 transition"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-neon-green transition"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <button
                        onClick={handleCheck}
                        disabled={loading || !password.trim()}
                        className="w-full rounded border border-neon-green/50 bg-neon-green/10 px-6 py-3 font-mono text-sm font-bold text-neon-green uppercase tracking-widest transition hover:bg-neon-green/20 hover:border-neon-green disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-neon-green border-t-transparent" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Shield size={16} />
                                Check Password
                            </>
                        )}
                    </button>

                    {/* Security Notice */}
                    <div className="mt-4 flex items-start gap-2 text-xs text-slate-500">
                        <Shield size={14} className="shrink-0 mt-0.5" />
                        <span>Your password is never stored or sent in plain text to any third-party API.</span>
                    </div>
                </div>
            </section>

            {/* Error */}
            {error && (
                <section className="px-6 relative z-10 max-w-2xl mx-auto mt-8">
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 font-mono text-sm text-red-400 flex items-center gap-3">
                        <AlertTriangle size={18} className="shrink-0" />
                        {error}
                    </div>
                </section>
            )}

            {/* Results */}
            {result && (
                <section className="px-6 relative z-10 max-w-4xl mx-auto mt-10 space-y-6 font-mono">

                    {/* Strength & Breach Row */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Strength Card */}
                        <div className={`rounded-lg border ${strengthBorderColor(result.strength)} ${strengthBgColor(result.strength)} p-6`}>
                            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Shield size={14} />
                                Password Strength
                            </h3>
                            <div className={`text-3xl font-bold uppercase tracking-wider ${strengthColor(result.strength)}`}>
                                {result.strength}
                            </div>
                        </div>

                        {/* Breach Card */}
                        <div className={`rounded-lg border p-6 ${result.breach_count > 0 ? "border-red-500/30 bg-red-500/10" : "border-neon-green/30 bg-neon-green/10"}`}>
                            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3 flex items-center gap-2">
                                <AlertTriangle size={14} />
                                Breach Detection
                            </h3>
                            {result.breach_count > 0 ? (
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl font-bold text-red-400">{result.breach_count.toLocaleString()}</span>
                                    <span className="text-sm text-red-400/80">times found in data breaches</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <CheckCircle size={28} className="text-neon-green" />
                                    <span className="text-sm text-neon-green">No breaches detected</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Brute Force Estimate */}
                    <div className="rounded-lg border border-slate-700 bg-surface/80 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                        <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-5 flex items-center gap-2">
                            <span className="w-1 h-3 bg-neon-green rounded-full" />
                            Brute Force Time
                        </h3>
                        <div className="rounded border border-slate-700 bg-black p-4">
                            <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Offline (Fast Hash)</div>
                            <div className="text-sm font-bold text-neon-green">{result.crack_times.offline_fast_hash}</div>
                        </div>
                    </div>

                    {/* Feedback Suggestions */}
                    {result.feedback.length > 0 && (
                        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-6">
                            <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <AlertTriangle size={14} />
                                Suggestions
                            </h3>
                            <ul className="space-y-3">
                                {result.feedback.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm text-secondary leading-relaxed">
                                        <span className="mt-0.5 text-yellow-400 shrink-0">{">"}</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Password Details */}
                    <div className="rounded-lg border border-slate-700 bg-surface/80 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                        <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-5 flex items-center gap-2">
                            <span className="w-1 h-3 bg-neon-green rounded-full" />
                            Password Details
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            <span className="rounded border border-slate-700 bg-black px-3 py-1.5 text-xs text-secondary">
                                Length: <span className="text-foreground font-bold">{result.details.length}</span>
                            </span>
                            {[
                                { label: "Uppercase", value: result.details.has_uppercase },
                                { label: "Lowercase", value: result.details.has_lowercase },
                                { label: "Digits", value: result.details.has_digits },
                                { label: "Special Chars", value: result.details.has_special },
                            ].map((badge) => (
                                <span
                                    key={badge.label}
                                    className={`rounded border px-3 py-1.5 text-xs font-bold ${
                                        badge.value
                                            ? "border-neon-green/30 bg-neon-green/10 text-neon-green"
                                            : "border-red-500/30 bg-red-500/10 text-red-400"
                                    }`}
                                >
                                    {badge.value ? <CheckCircle size={12} className="inline mr-1.5 -mt-0.5" /> : <AlertTriangle size={12} className="inline mr-1.5 -mt-0.5" />}
                                    {badge.label}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}
