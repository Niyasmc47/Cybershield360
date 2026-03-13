"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    Terminal, Shield, ShieldAlert, ShieldCheck, Globe, Lock, LockOpen,
    AlertTriangle, CheckCircle, Clock, Flag, Users, Search, ExternalLink,
} from "lucide-react";
import AccountScoreBar from "@/components/account-score-bar";
import { getBackendUrl } from "@/lib/backend-url";

interface SslInfo {
    valid: boolean;
    expires_in_days?: number;
    issuer?: Record<string, string>;
    error?: string;
}

interface DomainAge {
    registered: boolean;
    days_old?: number;
    created_at?: string;
    error?: string;
}

interface ThreatFeedEntry {
    listed: boolean;
    threat?: string;
    source?: string;
    reported_by?: number;
    error?: string;
}

interface CheckResult {
    url: string;
    domain: string;
    ssl: SslInfo;
    domain_age: DomainAge;
    threat_feeds: {
        urlhaus: ThreatFeedEntry;
        local: ThreatFeedEntry;
    };
    risk_score: number;
    verdict: "Likely Safe" | "Caution" | "Suspicious" | "Dangerous";
    flags: string[];
}

const verdictConfig = {
    "Likely Safe":  { color: "text-neon-green",  border: "border-neon-green/40",  bg: "bg-neon-green/10",  icon: ShieldCheck },
    "Caution":      { color: "text-yellow-400",   border: "border-yellow-400/40",  bg: "bg-yellow-400/10",  icon: Shield },
    "Suspicious":   { color: "text-orange-400",   border: "border-orange-400/40",  bg: "bg-orange-400/10",  icon: AlertTriangle },
    "Dangerous":    { color: "text-red-400",       border: "border-red-500/40",     bg: "bg-red-500/10",     icon: ShieldAlert },
};

function ScoreBar({ score }: { score: number }) {
    const color =
        score >= 70 ? "bg-red-500" :
        score >= 40 ? "bg-orange-400" :
        score >= 15 ? "bg-yellow-400" : "bg-neon-green";
    return (
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
                className={`h-3 rounded-full transition-all duration-700 ${color}`}
                style={{ width: `${score}%` }}
            />
        </div>
    );
}

export default function WebsiteCheck() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<CheckResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCheck = async () => {
        const trimmed = url.trim();
        if (!trimmed) return;
        setLoading(true);
        setResult(null);
        setError(null);
        try {
            const res = await fetch(`${getBackendUrl()}/api/website/check`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: trimmed }),
            });
            if (!res.ok) throw new Error("Analysis failed");
            setResult(await res.json());
        } catch {
            setError("Could not analyse the URL. Make sure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const VerdictIcon = result ? verdictConfig[result.verdict].icon : null;

    return (
        <main className="min-h-screen bg-background text-foreground pb-24 font-sans relative overflow-hidden">
            <div className="animate-scanline" />

            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b border-neon-green/20 bg-[#050505]/95">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center gap-3 text-xl font-bold font-mono tracking-wider group">
                        <Terminal className="text-neon-green group-hover:animate-pulse" />
                        <span>Cyber<span className="text-neon-green">Shield</span> 360</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <AccountScoreBar />
                        <Link href="/" className="text-sm font-mono text-secondary hover:text-neon-green transition">
                            {"<-"} Back
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative px-6 pt-20 pb-12 text-center">
                <div className="pointer-events-none absolute top-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-red-500/5 blur-[120px]" />
                <div className="relative z-10 mx-auto max-w-3xl">
                    <div className="mb-6 flex justify-center">
                        <Globe size={48} className="text-neon-green" />
                    </div>
                    <h1 className="mb-4 font-mono text-4xl font-bold tracking-tighter sm:text-5xl">
                        Website <span className="text-neon-green">Risk Detector</span>
                    </h1>
                    <p className="text-lg text-secondary mb-8 font-mono">
                        <span className="text-neon-green opacity-50">{">"} </span>
                        Analyse any URL for SSL issues, domain age, phishing patterns, and threat feed matches.
                    </p>
                </div>
            </section>

            {/* Input */}
            <section className="px-6 max-w-3xl mx-auto relative z-10">
                <div className="rounded-lg border border-neon-green/30 bg-black/80 p-6 shadow-[0_0_30px_rgba(13,242,89,0.05)]">
                    <label className="block font-mono text-xs text-secondary mb-2 tracking-widest">
                        ENTER URL TO ANALYSE
                    </label>
                    <div className="flex gap-3">
                        <input
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                            placeholder="https://example.com"
                            className="flex-1 rounded border border-slate-700 bg-surface px-4 py-3 font-mono text-sm text-foreground outline-none focus:border-neon-green placeholder:text-secondary/40"
                        />
                        <button
                            onClick={handleCheck}
                            disabled={loading || !url.trim()}
                            className="inline-flex items-center gap-2 rounded border border-neon-green bg-neon-green px-5 py-3 font-mono font-bold text-black transition hover:bg-neon-green/80 disabled:opacity-40"
                        >
                            <Search size={16} />
                            {loading ? "Scanning..." : "Scan"}
                        </button>
                    </div>
                    {loading && (
                        <div className="mt-4 flex items-center gap-3 font-mono text-xs text-secondary">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-neon-green border-t-transparent" />
                            Running full threat analysis — checking SSL, WHOIS, threat feeds...
                        </div>
                    )}
                    {error && <p className="mt-3 font-mono text-xs text-red-400">{error}</p>}
                </div>
            </section>

            {/* Results */}
            {result && (
                <section className="px-6 max-w-3xl mx-auto mt-8 space-y-5 relative z-10 font-mono">

                    {/* Verdict Banner */}
                    {(() => {
                        const cfg = verdictConfig[result.verdict];
                        const Icon = cfg.icon;
                        return (
                            <div className={`rounded-lg border ${cfg.border} ${cfg.bg} p-6 flex items-center gap-5`}>
                                <Icon size={40} className={cfg.color} />
                                <div className="flex-1 min-w-0">
                                    <div className={`text-2xl font-bold ${cfg.color}`}>{result.verdict}</div>
                                    <div className="text-sm text-secondary mt-1 truncate">{result.url}</div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className={`text-4xl font-bold tabular-nums ${cfg.color}`}>{result.risk_score}</div>
                                    <div className="text-xs text-secondary">risk score</div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Score Bar */}
                    <div className="rounded-lg border border-slate-700 bg-surface/80 p-5">
                        <div className="flex justify-between text-xs text-secondary mb-2">
                            <span>Safe</span><span>Dangerous</span>
                        </div>
                        <ScoreBar score={result.risk_score} />
                        <div className="flex justify-between mt-1 text-xs">
                            <span className="text-neon-green">0</span>
                            <span className="text-yellow-400">40</span>
                            <span className="text-orange-400">70</span>
                            <span className="text-red-400">100</span>
                        </div>
                    </div>

                    {/* Details grid */}
                    <div className="grid sm:grid-cols-2 gap-4">

                        {/* SSL */}
                        <div className="rounded-lg border border-slate-700 bg-surface/80 p-5 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-secondary uppercase tracking-widest mb-3">
                                {result.ssl.valid
                                    ? <Lock size={13} className="text-neon-green" />
                                    : <LockOpen size={13} className="text-red-400" />}
                                SSL Certificate
                            </div>
                            <div className={`text-sm font-bold ${result.ssl.valid ? "text-neon-green" : "text-red-400"}`}>
                                {result.ssl.valid ? "Valid" : "Invalid / Missing"}
                            </div>
                            {result.ssl.expires_in_days !== undefined && (
                                <div className="text-xs text-secondary">Expires in <span className={result.ssl.expires_in_days < 14 ? "text-red-400" : "text-foreground"}>{result.ssl.expires_in_days} days</span></div>
                            )}
                            {result.ssl.issuer && (
                                <div className="text-xs text-secondary">Issuer: {result.ssl.issuer?.organizationName || result.ssl.issuer?.O || "Unknown"}</div>
                            )}
                            {result.ssl.error && <div className="text-xs text-red-400">{result.ssl.error}</div>}
                        </div>

                        {/* Domain Age */}
                        <div className="rounded-lg border border-slate-700 bg-surface/80 p-5 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-secondary uppercase tracking-widest mb-3">
                                <Clock size={13} />
                                Domain Age
                            </div>
                            {result.domain_age.days_old !== undefined && result.domain_age.days_old !== null ? (
                                <>
                                    <div className={`text-sm font-bold ${result.domain_age.days_old < 30 ? "text-red-400" : result.domain_age.days_old < 180 ? "text-yellow-400" : "text-neon-green"}`}>
                                        {result.domain_age.days_old} days old
                                    </div>
                                    {result.domain_age.created_at && (
                                        <div className="text-xs text-secondary">Registered: {result.domain_age.created_at}</div>
                                    )}
                                </>
                            ) : (
                                <div className="text-sm font-bold text-secondary">{result.domain_age.error || "Could not determine"}</div>
                            )}
                        </div>

                        {/* URLhaus */}
                        <div className="rounded-lg border border-slate-700 bg-surface/80 p-5 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-secondary uppercase tracking-widest mb-3">
                                <ExternalLink size={13} />
                                URLhaus (abuse.ch)
                            </div>
                            {result.threat_feeds.urlhaus.listed ? (
                                <div className="text-sm font-bold text-red-400">⚑ Listed — {result.threat_feeds.urlhaus.threat || "threat"}</div>
                            ) : (
                                <div className="text-sm font-bold text-neon-green">✓ Not listed</div>
                            )}
                            {result.threat_feeds.urlhaus.error && <div className="text-xs text-secondary">{result.threat_feeds.urlhaus.error}</div>}
                        </div>

                        {/* Community DB */}
                        <div className="rounded-lg border border-slate-700 bg-surface/80 p-5 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-secondary uppercase tracking-widest mb-3">
                                <Users size={13} />
                                Community Reports
                            </div>
                            {result.threat_feeds.local.listed ? (
                                <div className="text-sm font-bold text-red-400">
                                    ⚑ Reported {result.threat_feeds.local.reported_by ?? ""}x by community
                                </div>
                            ) : (
                                <div className="text-sm font-bold text-neon-green">✓ No community reports</div>
                            )}
                        </div>
                    </div>

                    {/* Flags */}
                    {result.flags.length > 0 && (
                        <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-5">
                            <div className="flex items-center gap-2 text-xs text-orange-400 uppercase tracking-widest mb-4">
                                <Flag size={13} />
                                Risk Flags Detected
                            </div>
                            <ul className="space-y-2">
                                {result.flags.map((f, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-secondary">
                                        <span className="text-orange-400 shrink-0 mt-0.5">⚑</span>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {result.flags.length === 0 && (
                        <div className="rounded-lg border border-neon-green/20 bg-neon-green/5 p-5 flex items-center gap-3">
                            <CheckCircle size={20} className="text-neon-green shrink-0" />
                            <p className="text-sm text-secondary">No risk flags detected. Site appears clean based on available checks.</p>
                        </div>
                    )}

                    {/* Report CTA */}
                    <div className="rounded-lg border border-slate-700 bg-surface/80 p-5 flex items-center justify-between gap-4">
                        <div>
                            <div className="text-sm font-bold text-foreground">Know this site is a scam?</div>
                            <div className="text-xs text-secondary mt-1">Help the community by reporting it.</div>
                        </div>
                        <Link
                            href="/#community"
                            className="shrink-0 inline-flex items-center gap-2 rounded border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition"
                        >
                            <Flag size={13} />
                            Report Site
                        </Link>
                    </div>
                </section>
            )}

            {/* API suggestion box (always visible) */}
            <section className="px-6 max-w-3xl mx-auto mt-10 relative z-10">
                <div className="rounded-lg border border-slate-700/50 bg-surface/40 p-5 font-mono text-xs text-secondary">
                    <div className="font-bold text-neon-green mb-3 tracking-widest uppercase">Recommended Threat APIs (add to backend for deeper coverage)</div>
                    <ul className="space-y-1.5">
                        <li><span className="text-foreground">Google Safe Browsing</span> — safebrowsing.googleapis.com — industry-standard phishing/malware DB</li>
                        <li><span className="text-foreground">VirusTotal</span> — virustotal.com/api — 70+ AV engines scan any URL, free tier 4 req/min</li>
                        <li><span className="text-foreground">IPQualityScore</span> — ipqualityscore.com — fraud score, proxy/VPN/bot detection</li>
                        <li><span className="text-foreground">PhishTank</span> — phishtank.com/api — community phishing URL database, free with API key</li>
                        <li><span className="text-foreground">OpenPhish</span> — openphish.com — free phishing intelligence feed (no key needed)</li>
                    </ul>
                </div>
            </section>
        </main>
    );
}
