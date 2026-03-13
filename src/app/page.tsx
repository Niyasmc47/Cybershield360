"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldAlert, Terminal, ShieldCheck, Activity, Key, UploadCloud, Database, MessageSquare, Flag, CheckCircle, Users } from "lucide-react";
import { getBackendUrl } from "@/lib/backend-url";
import GameClient from "@/lib/game-client";
import AccountScoreBar from "@/components/account-score-bar";
import { getUser, refreshSessionFromDb, setSession, setTotalScore } from "@/lib/session";

export default function Home() {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authData, setAuthData] = useState({ username: "", email: "", password: "" });
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [communityUrl, setCommunityUrl] = useState("");
  const [communityReason, setCommunityReason] = useState("");
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communityMsg, setCommunityMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [communityList, setCommunityList] = useState<{ domain: string; reported_count: number; reason?: string }[]>([]);
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM] INITIATING SECURE CONNECTION...",
    "[SYSTEM] VERIFYING ENCRYPTION PROTOCOLS...",
    "[SUCCESS] UPLINK ESTABLISHED. PORT 443 SECURE.",
  ]);
  const [currentTime, setCurrentTime] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentYear, setCurrentYear] = useState(2024);

  const buildBackendHeaders = (includeJson = false) => {
    const backendUrl = getBackendUrl();
    const isNgrok = backendUrl.includes("ngrok-free.app") || backendUrl.includes("ngrok.app");
    return {
      ...(includeJson ? { "Content-Type": "application/json" } : {}),
      ...(isNgrok ? { "ngrok-skip-browser-warning": "1" } : {}),
    };
  };

  useEffect(() => {
    // Set hydration flag and initialize time on client only
    setIsHydrated(true);
    setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    setCurrentYear(new Date().getFullYear());

    const existingUser = getUser();
    setIsLoggedIn(!!existingUser);

    // Re-evaluate login state whenever session changes (e.g. logout from AccountScoreBar)
    const onSessionChange = () => {
      setIsLoggedIn(!!getUser());
    };
    window.addEventListener("cybershield-session-updated", onSessionChange);
    window.addEventListener("storage", onSessionChange);

    // Load community scam list
    fetch(`${getBackendUrl()}/api/community/list`, {
      headers: buildBackendHeaders(),
    })
      .then(r => r.json())
      .then(d => Array.isArray(d) && setCommunityList(d.slice(0, 8)))
      .catch(() => {});

    const logMessages = [
      "[ALERT] UNAUTHORIZED ACCESS ATTEMPT BLOCKED: 192.168.1.104",
      "[SCAN] NODE 7 STATUS: NOMINAL",
      "[SYSTEM] UPDATING THREAT DEFINITIONS...",
      "[SUCCESS] THREAT DB v4.9.2 LOADED",
      "[SCAN] COMMENCING DEEP PACKET INSPECTION...",
      "[INFO] 4,291 PACKETS ANALYZED. 0 ANOMALIES FOUND.",
    ];

    let index = 0;
    const interval = setInterval(() => {
      setLogs((prev) => {
        const newLogs = [...prev, logMessages[index]];
        if (newLogs.length > 6) newLogs.shift();
        return newLogs;
      });
      index = (index + 1) % logMessages.length;
    }, 3000);

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
      window.removeEventListener("cybershield-session-updated", onSessionChange);
      window.removeEventListener("storage", onSessionChange);
    };
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage("");
    setAuthLoading(true);

    try {
      const result =
        authMode === "login"
          ? await GameClient.login(authData.email, authData.password)
          : await GameClient.register(authData.username, authData.email, authData.password);

      setSession(result.token, result.user, result.user.total_score ?? 0);
      const refreshedUser = await refreshSessionFromDb(result.token);
      setTotalScore(refreshedUser?.total_score ?? result.user.total_score ?? 0);
      setIsLoggedIn(true);
      setAuthMessage(`Welcome ${refreshedUser?.username || result.user.username}. Account is now active for all features.`);
      setAuthData({ username: "", email: "", password: "" });
    } catch (error: any) {
      setAuthMessage(error?.message || "Authentication failed. Check backend connection.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-sans relative overflow-hidden">
      {/* Global Scanline Effect */}
      <div className="animate-scanline" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neon-green/20 bg-[#050505]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 text-xl font-bold font-mono tracking-wider group">
            <Terminal className="text-neon-green group-hover:animate-pulse" />
            <span>
              Cyber<span className="text-neon-green">Shield</span> 360
            </span>
          </Link>
          <div className="hidden items-center gap-8 text-sm text-secondary font-mono md:flex">
            <a href="#features" className="transition hover:text-neon-green hover:underline decoration-neon-green/50 underline-offset-4">
              Features
            </a>
            <a href="#extension" className="transition hover:text-neon-green hover:underline decoration-neon-green/50 underline-offset-4">
              Extension
            </a>
            <a href="#discord" className="transition hover:text-neon-green hover:underline decoration-neon-green/50 underline-offset-4">
              Discord
            </a>
            <a href="/learn" className="transition hover:text-neon-green hover:underline decoration-neon-green/50 underline-offset-4">
              Awareness Hub
            </a>
            <Link href="/website-check" className="transition hover:text-neon-green hover:underline decoration-neon-green/50 underline-offset-4">
              Risk Detector
            </Link>
          </div>
          <AccountScoreBar />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center">
        {/* Hacker grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(13, 242, 89, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(13, 242, 89, 0.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow */}
        <div className="pointer-events-none absolute top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-green/5 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-5xl w-full grid lg:grid-cols-2 gap-12 items-center text-left">

          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded border border-neon-green/30 bg-neon-green/5 px-3 py-1 font-mono text-xs text-neon-green tracking-widest">
              <span className="inline-block h-2 w-2 rounded-full bg-neon-green animate-blink" />
              System Status: Online
            </div>

            <h1 className="mb-6 font-mono text-5xl font-bold leading-tight tracking-tighter sm:text-6xl text-foreground">
              Cyber<span className="text-neon-green">Shield</span>
              <br />
              <span className="text-neon-green">360</span>
            </h1>

            <p className="mb-4 max-w-lg text-lg text-secondary font-mono">
              <span className="text-neon-green opacity-50">{">"} </span>
              Cybersecurity Awareness Platform
            </p>

            <p className="mb-10 max-w-lg text-sm text-secondary leading-relaxed">
              Gamified cybersecurity awareness and protection platform.
            </p>

            <div className="flex flex-wrap items-center gap-4 font-mono text-sm">
              <a
                href="#"
                className="group rounded border border-neon-green bg-neon-green px-6 py-3 font-bold text-black transition hover:bg-neon-green/90 hover:shadow-[0_0_20px_rgba(13,242,89,0.4)]"
              >
                Get Started <span className="inline-block transition group-hover:translate-x-1">{"->"}</span>
              </a>
              <Link
                href="/learn"
                className="rounded border border-slate-700 bg-surface px-6 py-3 font-bold text-secondary transition hover:border-neon-green/50 hover:text-neon-green"
              >
                Explore Awareness Hub
              </Link>
              <Link
                href="/games"
                className="rounded border border-slate-700 bg-surface px-6 py-3 font-bold text-secondary transition hover:border-neon-green/50 hover:text-neon-green"
              >
                Explore our Games
              </Link>
              <Link
                href="/password-check"
                className="rounded border border-slate-700 bg-surface px-6 py-3 font-bold text-secondary transition hover:border-neon-green/50 hover:text-neon-green"
              >
                Check My Password
              </Link>
              <Link
                href="/website-check"
                className="rounded border border-slate-700 bg-surface px-6 py-3 font-bold text-secondary transition hover:border-red-500/50 hover:text-red-400"
              >
                Scan a Website
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {!isLoggedIn && (
              <div className="rounded-lg border border-neon-green/30 bg-black/80 backdrop-blur-sm p-4 shadow-[0_0_30px_rgba(13,242,89,0.05)] relative overflow-hidden">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex gap-2 text-xs font-mono">
                    <button
                      onClick={() => setAuthMode("login")}
                      className={`px-3 py-1 rounded border ${authMode === "login" ? "border-neon-green text-neon-green" : "border-slate-700 text-secondary"}`}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setAuthMode("register")}
                      className={`px-3 py-1 rounded border ${authMode === "register" ? "border-neon-green text-neon-green" : "border-slate-700 text-secondary"}`}
                    >
                      Register
                    </button>
                  </div>
                  <span className="font-mono text-xs text-neon-green/50 tracking-widest">Account Access</span>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-3 font-mono text-sm">
                  {authMode === "register" && (
                    <input
                      value={authData.username}
                      onChange={(e) => setAuthData((prev) => ({ ...prev, username: e.target.value }))}
                      placeholder="Username"
                      className="w-full rounded border border-slate-700 bg-surface px-3 py-2 text-foreground outline-none focus:border-neon-green"
                      required
                    />
                  )}
                  <input
                    type="email"
                    value={authData.email}
                    onChange={(e) => setAuthData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Email"
                    className="w-full rounded border border-slate-700 bg-surface px-3 py-2 text-foreground outline-none focus:border-neon-green"
                    required
                  />
                  <input
                    type="password"
                    value={authData.password}
                    onChange={(e) => setAuthData((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Password"
                    className="w-full rounded border border-slate-700 bg-surface px-3 py-2 text-foreground outline-none focus:border-neon-green"
                    required
                  />
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full rounded border border-neon-green bg-neon-green/10 px-4 py-2 text-sm font-mono font-bold text-neon-green transition hover:bg-neon-green hover:text-black disabled:opacity-50"
                  >
                    {authLoading ? "Processing..." : authMode === "login" ? "Login" : "Create Account"}
                  </button>
                </form>

                {authMessage && <p className="mt-3 text-xs text-secondary">{authMessage}</p>}
              </div>
            )}

            <div className="rounded-lg border border-neon-green/30 bg-black/80 backdrop-blur-sm p-4 h-80 flex flex-col shadow-[0_0_30px_rgba(13,242,89,0.05)] relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-neon-green/20 pb-2 mb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-neon-green/50"></div>
                </div>
                <span className="font-mono text-xs text-neon-green/50 tracking-widest">Live System Logs</span>
              </div>
              <div className="flex-1 font-mono text-xs sm:text-sm text-neon-green/80 flex flex-col justify-end space-y-2 opacity-90 relative z-10">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-slate-600">[{isHydrated ? currentTime : "00:00:00"}]</span>
                    <span className={log.includes("ERROR") || log.includes("BLOCKED") ? "text-rose-400" : log.includes("SUCCESS") ? "text-emerald-400" : ""}>{log}</span>
                  </div>
                ))}
                <div className="flex gap-2 animate-pulse mt-2">
                  <span className="text-slate-600">[{isHydrated ? currentTime : "00:00:00"}]</span>
                  <span>_</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-neon-green/50 font-mono text-xs">
          Scroll Down
        </div>
      </section>

      {/* Browser Extension */}
      <section id="extension" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded border border-neon-green/30 bg-gradient-to-br from-surface to-background relative">
            {/* Tech lines top right */}
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="var(--color-neon-green)">
                <path d="M100 0 L50 50 L50 100 M80 0 L30 50 L0 50" strokeWidth="1" />
              </svg>
            </div>

            <div className="grid items-center gap-8 p-8 md:grid-cols-2 md:p-12 relative z-10">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded border border-neon-green/20 bg-neon-green/10 px-3 py-1 font-mono text-xs font-medium text-neon-green tracking-wider">
                  &gt; Browser Extension
                </div>
                <h2 className="mb-4 font-mono text-3xl font-bold sm:text-4xl">
                  Browser <span className="text-neon-green">Protection</span>
                </h2>
                <p className="mb-8 text-secondary text-sm font-mono leading-relaxed">
                  Install the CyberShield browser extension to activate real-time packet analysis. Detects phishing vectors, intercepts suspicious payloads, and secures your active session.
                </p>
                <a
                  href="/chrome_extension.zip"
                  download="chrome_extension.zip"
                  className="inline-flex items-center gap-2 rounded border border-neon-green bg-neon-green px-6 py-3 font-mono font-bold text-black transition hover:bg-neon-green/80 hover:shadow-[0_0_20px_rgba(13,242,89,0.3)]"
                >
                  <Key size={18} />
                  Download Extension
                </a>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative flex h-64 w-full items-center justify-center rounded border border-neon-green/30 bg-black shadow-[inset_0_0_30px_rgba(13,242,89,0.05)] overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTIwIDBMMCAyMEwyMCA0MEw0MCAyMEwyMCAweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDEzLCAyNDIsIDg5LCAwLjA1KSIvPjwvc3ZnPg==')] bg-[length:20px_20px] opacity-30" />

                  <div className="relative h-52 w-[90%] overflow-hidden rounded border border-neon-green/20 bg-black/40 backdrop-blur-sm">
                    <Image
                      src="/images/extension-status.png"
                      alt="Browser extension status preview"
                      fill
                      className="object-contain"
                      priority
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discord Bot */}
      <section id="discord" className="px-6 py-24 bg-surface/30">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded border border-neon-green/30 bg-gradient-to-br from-surface to-background relative">
            {/* Tech lines top right */}
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="var(--color-neon-green)">
                <path d="M100 0 L50 50 L50 100 M80 0 L30 50 L0 50" strokeWidth="1" />
              </svg>
            </div>

            <div className="grid items-center gap-8 p-8 md:grid-cols-2 md:p-12 relative z-10">
              {/* Right side first on this card for visual variety */}
              <div className="flex items-center justify-center order-last md:order-first">
                <div className="relative flex h-64 w-full items-center justify-center rounded border border-neon-green/30 bg-black shadow-[inset_0_0_30px_rgba(13,242,89,0.05)] overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTIwIDBMMCAyMEwyMCA0MEw0MCAyMEwyMCAweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDEzLCAyNDIsIDg5LCAwLjA1KSIvPjwvc3ZnPg==')] bg-[length:20px_20px] opacity-30" />
                  <div className="relative h-52 w-[90%] overflow-hidden rounded border border-neon-green/20 bg-black/40 backdrop-blur-sm">
                    <Image
                      src="/images/extension-status.png"
                      alt="Discord bot preview"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded border border-neon-green/20 bg-neon-green/10 px-3 py-1 font-mono text-xs font-medium text-neon-green tracking-wider">
                  &gt; Discord Integration
                </div>
                <h2 className="mb-4 font-mono text-3xl font-bold sm:text-4xl">
                  Discord <span className="text-neon-green">Bot</span>
                </h2>
                <p className="mb-8 text-secondary text-sm font-mono leading-relaxed">
                  Bring CyberShield directly into your Discord server. Scan suspicious links, broadcast real-time threat alerts, and track your guild&apos;s cybersecurity leaderboard — all with slash commands.
                </p>
                <a
                  href="https://discord.com/api/oauth2/authorize?client_id=1391726803768578151&permissions=268435496&scope=bot%20applications.commands"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded border border-neon-green bg-neon-green px-6 py-3 font-mono font-bold text-black transition hover:bg-neon-green/80 hover:shadow-[0_0_20px_rgba(13,242,89,0.3)]"
                >
                  <MessageSquare size={18} />
                  Invite to Discord
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Scam Reporter */}
      <section id="community" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded border border-red-500/30 bg-gradient-to-br from-surface to-background relative">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="#ef4444">
                <path d="M100 0 L50 50 L50 100 M80 0 L30 50 L0 50" strokeWidth="1" />
              </svg>
            </div>
            <div className="grid items-start gap-8 p-8 md:grid-cols-2 md:p-12 relative z-10">
              {/* Left — form */}
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded border border-red-500/20 bg-red-500/10 px-3 py-1 font-mono text-xs font-medium text-red-400 tracking-wider">
                  &gt; Community Intel
                </div>
                <h2 className="mb-4 font-mono text-3xl font-bold sm:text-4xl">
                  Report a <span className="text-red-400">Scam Site</span>
                </h2>
                <p className="mb-6 text-secondary text-sm font-mono leading-relaxed">
                  Found a scam, phishing, or dangerous website? Submit it here. It gets stored in the CyberShield community database and used to protect everyone during Website Risk scans.
                </p>
                <div className="space-y-3 font-mono text-sm">
                  <input
                    value={communityUrl}
                    onChange={e => setCommunityUrl(e.target.value)}
                    placeholder="https://scam-site.com"
                    className="w-full rounded border border-slate-700 bg-surface px-3 py-2 text-foreground outline-none focus:border-red-400 placeholder:text-secondary/40"
                  />
                  <input
                    value={communityReason}
                    onChange={e => setCommunityReason(e.target.value)}
                    placeholder="Why is it suspicious? (optional)"
                    className="w-full rounded border border-slate-700 bg-surface px-3 py-2 text-foreground outline-none focus:border-red-400 placeholder:text-secondary/40"
                  />
                  <button
                    disabled={communityLoading || !communityUrl.trim()}
                    onClick={async () => {
                      setCommunityLoading(true);
                      setCommunityMsg(null);
                      try {
                        const res = await fetch(`${getBackendUrl()}/api/community/report`, {
                          method: "POST",
                          headers: buildBackendHeaders(true),
                          body: JSON.stringify({ url: communityUrl.trim(), reason: communityReason.trim(), reporter: "anonymous" }),
                        });
                        const d = await res.json();
                        if (res.ok) {
                          setCommunityMsg({ ok: true, text: d.message || "Reported!" });
                          setCommunityUrl("");
                          setCommunityReason("");
                          // Refresh list
                          fetch(`${getBackendUrl()}/api/community/list`, {
                            headers: buildBackendHeaders(),
                          }).then(r => r.json()).then(d => Array.isArray(d) && setCommunityList(d.slice(0, 8))).catch(() => {});
                        } else {
                          setCommunityMsg({ ok: false, text: d.error || "Failed to report." });
                        }
                      } catch {
                        setCommunityMsg({ ok: false, text: "Could not connect to backend." });
                      } finally {
                        setCommunityLoading(false);
                      }
                    }}
                    className="w-full rounded border border-red-500 bg-red-500/10 px-4 py-2 font-bold text-red-400 transition hover:bg-red-500 hover:text-black disabled:opacity-40"
                  >
                    {communityLoading ? "Submitting..." : "Submit Report"}
                  </button>
                  {communityMsg && (
                    <div className={`flex items-center gap-2 text-xs ${communityMsg.ok ? "text-neon-green" : "text-red-400"}`}>
                      {communityMsg.ok ? <CheckCircle size={13} /> : <Flag size={13} />}
                      {communityMsg.text}
                    </div>
                  )}
                </div>
              </div>

              {/* Right — live list */}
              <div>
                <div className="flex items-center gap-2 mb-4 text-xs font-mono text-secondary uppercase tracking-widest">
                  <Users size={13} />
                  Community-Reported Sites
                </div>
                {communityList.length === 0 ? (
                  <div className="rounded border border-slate-700 bg-black/40 p-6 text-center font-mono text-xs text-secondary">
                    No reports yet. Be the first to submit a scam site.
                  </div>
                ) : (
                  <ul className="space-y-2 font-mono text-xs">
                    {communityList.map((site, i) => (
                      <li key={i} className="flex items-center justify-between gap-3 rounded border border-red-500/20 bg-red-500/5 px-4 py-2">
                        <span className="text-red-400 truncate flex items-center gap-2">
                          <Flag size={11} className="shrink-0" />
                          {site.domain}
                        </span>
                        <span className="shrink-0 text-secondary">{site.reported_count}x reported</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  href="/website-check"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-mono text-neon-green hover:underline decoration-neon-green/50"
                >
                  <ShieldCheck size={13} />
                  Scan a website for risks -&gt;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative px-6 py-24 bg-surface/50 border-b border-slate-900">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 font-mono">
            <div className="mb-2 inline-flex items-center gap-2 rounded border border-neon-green/20 bg-neon-green/5 px-3 py-1 text-xs text-neon-green">
              // Core Features
            </div>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              System <span className="text-neon-green">Capabilities</span>
            </h2>
            <p className="max-w-xl text-secondary text-sm">
              Advanced heuristics and interactive training protocols to harden your personal digital perimeter.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Database />}
              title="Awareness Database"
              description="Interactive lessons, scam examples, and guides mapped to modern threat matrices."
            />
            <FeatureCard
              icon={<Activity />}
              title="Cyber IQ Test"
              description="Gamified simulations tracking your anomaly detection capabilities. Score ranks dynamically."
              highlighted
            />
            <FeatureCard
              icon={<ShieldCheck />}
              title="Real-Time Scanner"
              description="Browser-level defensive extension detecting injected nodes and phishing domains."
            />
            <FeatureCard
              icon={<Key />}
              title="Password Strength Checker"
              description="Advanced entropy analysis tool. Calculates brute-force resistance and measures credential viability."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neon-green/20 bg-black px-6 py-12 font-mono text-xs">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="col-span-2">
              <div className="mb-4 flex items-center gap-2 text-lg font-bold">
                <Terminal className="text-neon-green" size={20} />
                Cyber<span className="text-neon-green">Shield</span> 360
              </div>
              <p className="text-secondary leading-relaxed max-w-sm">
                Advanced AI-driven threat mitigation and cybersecurity training platform. Designed for maximum resilience against class-4 security breaches.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-bold text-neon-green">Pages</h4>
              <ul className="space-y-2 text-secondary">
                <li><a href="#features" className="hover:text-neon-green hover:underline decoration-neon-green/50">Features</a></li>
                <li><a href="#extension" className="hover:text-neon-green hover:underline decoration-neon-green/50">Chrome Extension</a></li>
                <li><a href="#discord" className="hover:text-neon-green hover:underline decoration-neon-green/50">Discord Bot</a></li>
                <li><a href="/learn" className="hover:text-neon-green hover:underline decoration-neon-green/50">Awareness Hub</a></li>
                <li><Link href="/website-check" className="hover:text-neon-green hover:underline decoration-neon-green/50">Website Risk Detector</Link></li>
                <li><a href="#community" className="hover:text-neon-green hover:underline decoration-neon-green/50">Report Scam Site</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-bold text-neon-green">Socials</h4>
              <ul className="space-y-2 text-secondary">
                <li><a href="#" className="hover:text-neon-green hover:underline decoration-neon-green/50">GitHub</a></li>
                <li><a href="#" className="hover:text-neon-green hover:underline decoration-neon-green/50">Discord</a></li>
                <li><a href="#" className="hover:text-neon-green hover:underline decoration-neon-green/50">Email Us</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-neon-green/10 pt-6 flex flex-col md:flex-row justify-between items-center text-secondary/50">
            <p>
              © {currentYear} CyberShield 360. All rights reserved.
            </p>
            <p className="mt-2 md:mt-0 flex gap-4">
              <span>Uptime: 99.99%</span>
              <span>Version: 4.0.2 Stable</span>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ─── Feature Card Component ─── */

function FeatureCard({
  icon,
  title,
  description,
  highlighted = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`group relative rounded border p-6 font-mono transition-all duration-300 hover:-translate-y-1 ${highlighted
        ? "border-neon-green/50 bg-neon-green/5 shadow-[0_0_20px_rgba(13,242,89,0.1)]"
        : "border-slate-800 bg-surface/80 hover:border-neon-green/30 hover:bg-surface"
        }`}
    >
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-neon-green opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 -translate-y-1"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-neon-green opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 translate-y-1"></div>

      <div
        className={`mb-6 flex h-12 w-12 items-center justify-center rounded ${highlighted
          ? "bg-neon-green/20 text-neon-green"
          : "bg-slate-800 text-secondary group-hover:text-neon-green group-hover:bg-neon-green/10"
          } transition-colors`}
      >
        {icon}
      </div>
      <h3 className="mb-3 text-lg font-bold text-foreground">{title}</h3>
      <p className="text-xs leading-relaxed text-secondary">{description}</p>
    </div>
  );
}
