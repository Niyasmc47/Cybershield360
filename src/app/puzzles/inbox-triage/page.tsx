"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { MailWarning, Terminal, CheckCircle, XCircle, Clock, ChevronRight } from "lucide-react";
import AccountScoreBar from "@/components/account-score-bar";
import { addTotalScore, syncScoreToDb } from "@/lib/session";

type Label = "Phishing" | "Suspicious" | "Safe";

interface Email {
    id: number;
    from: string;
    subject: string;
    preview: string;
    body: string;
    answer: Label;
    explanation: string;
}

const emails: Email[] = [
    {
        id: 1,
        from: "prize-claims@randomwinner2024.xyz",
        subject: "🎉 You've Been Selected — Claim Your £5,000 Prize NOW",
        preview: "Congratulations! Your email was randomly selected in our global prize draw...",
        body: "Congratulations! Your email was randomly selected in our global prize draw. To claim your £5,000 prize, click the link below within 24 hours and provide your bank details for transfer. This offer expires soon.",
        answer: "Phishing",
        explanation: "Suspicious domain, urgency tactics, unsolicited prize, and asking for bank details are classic phishing signals.",
    },
    {
        id: 2,
        from: "newsletter@bbcnews.com",
        subject: "BBC News Morning Briefing — Wednesday Edition",
        preview: "Good morning. Here are today's top stories from around the world...",
        body: "Good morning. Here are today's top stories from around the world. Today: EU energy summit results, UK inflation figures released, and England cricket team announces squad changes. Read more at bbc.com/news.",
        answer: "Safe",
        explanation: "Legitimate sender domain, no suspicious links, no urgency, and content matches a real news outlet format.",
    },
    {
        id: 3,
        from: "security@paypa1-accounts.com",
        subject: "URGENT: Your PayPal account has been limited",
        preview: "We noticed unusual activity on your account. Verify your identity immediately...",
        body: "We noticed unusual activity on your PayPal account. Your account has been limited until you verify your identity. Click here to restore access: http://paypa1-verify.net/secure. Failure to act within 48 hours will result in permanent suspension.",
        answer: "Phishing",
        explanation: "The domain is 'paypa1' (number 1 instead of letter l), the link goes to a different domain, and the threat of suspension creates false urgency.",
    },
    {
        id: 4,
        from: "sarah.johnson@yourcompany.co.uk",
        subject: "Re: Meeting tomorrow at 10am — agenda attached",
        preview: "Hi, just confirming tomorrow's meeting. I've attached the agenda as we discussed...",
        body: "Hi, just confirming tomorrow's meeting. I've attached the agenda as we discussed in Monday's call. The location has changed to Conference Room B. Let me know if you can't make it. Thanks, Sarah.",
        answer: "Safe",
        explanation: "Comes from a known company domain, references prior context, no suspicious links, no urgency, and no requests for credentials.",
    },
    {
        id: 5,
        from: "noreply@voicemail-notify.net",
        subject: "You have 1 unread voicemail — listen now",
        preview: "A voicemail was left for you. Tap the play button below to listen...",
        body: "A voicemail was left for your number ending in ••••. Tap the play button below to listen to the message. This link expires in 12 hours. [Play Voicemail →] http://vm-audio-cdn.net/play?id=829301",
        answer: "Suspicious",
        explanation: "Voicemail-via-email is a common smishing vector. The sender domain is not tied to any carrier, the link goes to an unverifiable CDN, and your number is hidden — common in bulk phishing.",
    },
    {
        id: 6,
        from: "accounts@delta-supplies.co.uk",
        subject: "Invoice #INV-4521 for March — please review",
        preview: "Please find attached invoice #INV-4521 for services rendered in March...",
        body: "Please find attached invoice #INV-4521 for services rendered in March. Payment terms are 30 days. Bank details remain unchanged. If you have questions, contact accounts@delta-supplies.co.uk or call 0121 496 0022.",
        answer: "Safe",
        explanation: "Legitimate business domain, invoice matches expected format, no suspicious links, and payment details are provided by reference not inline link.",
    },
    {
        id: 7,
        from: "netflix-support@gmail.com",
        subject: "URGENT: Your Netflix password was just changed",
        preview: "Someone changed your Netflix password. If this wasn't you, secure your account immediately...",
        body: "Someone changed your Netflix password. If this wasn't you, you must act immediately. Click below to reverse the change and secure your account: http://netflix-support-recovery.xyz/secure. Do not ignore this email.",
        answer: "Phishing",
        explanation: "Official Netflix would never use a Gmail address. The recovery link goes to a fake domain ending in .xyz — not netflix.com.",
    },
    {
        id: 8,
        from: "no-reply@amazon.co.uk",
        subject: "Your order #205-8829134-6718729 has shipped",
        preview: "Great news! Your order is on its way. Expected delivery: Thursday 14 March...",
        body: "Great news! Your order of 'USB-C Hub 7-in-1' is on its way. Expected delivery: Thursday 14 March. Track your package at amazon.co.uk/orders or via the Amazon app. Order total: £34.99.",
        answer: "Safe",
        explanation: "Comes from amazon.co.uk, references a real order number and product, directs to amazon.co.uk — no off-site links or credential requests.",
    },
    {
        id: 9,
        from: "delivery@dhl-parcel-redelivery.info",
        subject: "Delivery failed — reschedule your parcel",
        preview: "We attempted to deliver your parcel but were unable to complete delivery...",
        body: "We attempted to deliver your parcel (ref: UK2948201) but were unable to complete delivery. Please pay a £1.99 redelivery fee to confirm your new delivery slot: http://dhl-redelivery.info/pay. Your parcel will be returned to sender after 48 hours.",
        answer: "Phishing",
        explanation: "DHL's real domain is dhl.com or dhl.co.uk. 'dhl-parcel-redelivery.info' is a fake. Asking for payment via an emailed link is a known parcel scam tactic.",
    },
    {
        id: 10,
        from: "it-helpdesk@yourcompany.co.uk",
        subject: "Action required: Reset your VPN credentials by Friday",
        preview: "As part of our quarterly security rotation, all VPN passwords must be reset...",
        body: "As part of our quarterly security rotation, all VPN passwords must be reset by Friday 14 March. Please log in to the IT portal at portal.yourcompany.co.uk and update your credentials. Contact helpdesk@yourcompany.co.uk with any issues.",
        answer: "Suspicious",
        explanation: "The domain matches your company, and the link goes to yourcompany.co.uk — but credential reset requests via email are unusual and could be spoofed. Always verify with IT directly before clicking.",
    },
    {
        id: 11,
        from: "support@apple-id-recovery.support",
        subject: "Your Apple ID was used to sign in on a new device",
        preview: "Your Apple ID was used on an unknown iPhone. If this wasn't you...",
        body: "Your Apple ID (ending in ****@gmail.com) was used to sign in on an unknown device: iPhone 15 Pro, Location: Lagos, Nigeria. If this wasn't you, click below immediately to secure your account: http://apple-id-recovery.support/verify",
        answer: "Phishing",
        explanation: "The domain 'apple-id-recovery.support' is not apple.com. Apple security emails come from @apple.com or @id.apple.com only.",
    },
    {
        id: 12,
        from: "team@slack.com",
        subject: "Your weekly Slack activity digest",
        preview: "Here's your weekly summary: 47 messages sent, 12 channels active...",
        body: "Here's your weekly summary for the workspace 'YourCompany'. You sent 47 messages across 12 channels. Most active channel: #engineering. View full report at slack.com/stats.",
        answer: "Safe",
        explanation: "Legitimate Slack domain, standard digest format, links to slack.com, no credential requests or urgency.",
    },
    {
        id: 13,
        from: "verify@bank0famerica.com",
        subject: "Verify your account to avoid suspension",
        preview: "We noticed your account information is outdated. Update now to avoid...",
        body: "Dear Valued Customer, our records indicate your account information needs updating. Failure to verify within 72 hours will result in temporary account suspension. Verify here: http://boa-verify-secure.net/update",
        answer: "Phishing",
        explanation: "The sender domain 'bank0famerica.com' uses a zero instead of the letter O. The verification link goes to 'boa-verify-secure.net', not bankofamerica.com.",
    },
    {
        id: 14,
        from: "receipts@uber.com",
        subject: "Your trip receipt from Thursday",
        preview: "Thanks for riding with Uber. Here's your receipt for your recent trip...",
        body: "Thanks for riding with Uber. Trip from London Bridge to Canary Wharf on Thursday, 13 March. Duration: 18 min. Fare: £12.40. View full receipt at uber.com/trips. Charged to Visa ending 4829.",
        answer: "Safe",
        explanation: "From uber.com (legitimate domain), references specific trip details, links to uber.com, standard receipt format.",
    },
    {
        id: 15,
        from: "admin@company-sharepoint-docs.com",
        subject: "Shared Document: Q4 Financial Report - CONFIDENTIAL",
        preview: "A document has been shared with you. Click to review the Q4 report...",
        body: "John has shared a document with you: 'Q4 Financial Report - Board Review CONFIDENTIAL'. This document requires your Microsoft 365 login to access. View Document: http://company-sharepoint-docs.com/view?doc=q4report",
        answer: "Phishing",
        explanation: "The domain 'company-sharepoint-docs.com' is not a legitimate Microsoft SharePoint URL. Real SharePoint links contain 'sharepoint.com' in the URL. This is credential harvesting disguised as document sharing.",
    },
];

const TIMER_PER_EMAIL = 18;

type Screen = "start" | "playing" | "result" | "done";

interface RoundResult {
    email: Email;
    chosen: Label;
    correct: boolean;
    timeLeft: number;
}

export default function InboxTriagePage() {
    const [screen, setScreen] = useState<Screen>("start");
    const [index, setIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TIMER_PER_EMAIL);
    const [chosen, setChosen] = useState<Label | null>(null);
    const [results, setResults] = useState<RoundResult[]>([]);
    const [expanded, setExpanded] = useState(false);

    const currentEmail = emails[index];

    const handleAnswer = useCallback(
        (label: Label) => {
            if (chosen) return;
            setChosen(label);
            const correct = label === currentEmail.answer;
            setResults((prev) => [
                ...prev,
                { email: currentEmail, chosen: label, correct, timeLeft },
            ]);
        },
        [chosen, currentEmail, timeLeft]
    );

    const next = () => {
        if (index + 1 >= emails.length) {
            setScreen("done");
        } else {
            setIndex((i) => i + 1);
            setChosen(null);
            setTimeLeft(TIMER_PER_EMAIL);
            setExpanded(false);
        }
    };

    useEffect(() => {
        if (screen !== "playing" || chosen) return;
        if (timeLeft <= 0) {
            handleAnswer("Safe"); // treat timeout as wrong guess — pick a non-answer label
            return;
        }
        const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [screen, timeLeft, chosen, handleAnswer]);

    const score = results.filter((r) => r.correct).length;
    const scoreSyncedRef = useRef(false);

    useEffect(() => {
        if (screen === "done" && !scoreSyncedRef.current) {
            scoreSyncedRef.current = true;
            const points = score * 3;
            addTotalScore(points);
            syncScoreToDb();
        }
        if (screen === "start") {
            scoreSyncedRef.current = false;
        }
    }, [screen, score]);

    const labelStyle: Record<Label, string> = {
        Phishing: "border-red-500/60 bg-red-500/10 text-red-400 hover:bg-red-500/20",
        Suspicious: "border-yellow-500/60 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20",
        Safe: "border-neon-green/60 bg-neon-green/10 text-neon-green hover:bg-neon-green/20",
    };

    const chosenStyle = (label: Label) => {
        if (!chosen) return labelStyle[label];
        if (label === currentEmail.answer) return "border-neon-green bg-neon-green/20 text-neon-green";
        if (label === chosen && chosen !== currentEmail.answer) return "border-red-500 bg-red-500/20 text-red-400";
        return "border-slate-700 bg-transparent text-[#64748b] opacity-50";
    };

    const timerColor = timeLeft > 10 ? "text-neon-green" : timeLeft > 5 ? "text-yellow-400" : "text-red-400";

    return (
        <main className="min-h-screen bg-[#0f172a] text-[#e2e8f0] font-mono relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,136,0.04),transparent_60%)] pointer-events-none" />

            <nav className="sticky top-0 z-50 border-b border-neon-green/20 bg-[#0f172a]">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-wider group">
                        <Terminal className="text-neon-green group-hover:animate-pulse" />
                        <span>Cyber<span className="text-neon-green">Shield</span> 360</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/puzzles" className="text-sm text-[#94a3b8] hover:text-neon-green transition-colors">← Puzzle Hub</Link>
                        <AccountScoreBar />
                    </div>
                </div>
            </nav>

            <div className="mx-auto max-w-3xl px-6 py-12">

                {/* START SCREEN */}
                {screen === "start" && (
                    <div className="text-center">
                        <div className="mb-4 flex justify-center">
                            <MailWarning size={48} className="text-neon-green" />
                        </div>
                        <h1 className="text-3xl font-bold mb-3">Inbox <span className="text-neon-green">Triage</span></h1>
                        <p className="text-[#94a3b8] mb-8 text-sm max-w-md mx-auto leading-relaxed">
                            You&apos;ll see 15 emails. Classify each one as <span className="text-red-400">Phishing</span>, <span className="text-yellow-400">Suspicious</span>, or <span className="text-neon-green">Safe</span>. You have {TIMER_PER_EMAIL} seconds per email.
                        </p>
                        <div className="grid grid-cols-3 gap-4 mb-10 text-sm">
                            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                                <div className="text-red-400 font-bold mb-1">Phishing</div>
                                <div className="text-[#94a3b8] text-xs">Actively trying to steal data or credentials</div>
                            </div>
                            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                                <div className="text-yellow-400 font-bold mb-1">Suspicious</div>
                                <div className="text-[#94a3b8] text-xs">Possibly malicious — treat with caution</div>
                            </div>
                            <div className="rounded-lg border border-neon-green/30 bg-neon-green/10 p-4">
                                <div className="text-neon-green font-bold mb-1">Safe</div>
                                <div className="text-[#94a3b8] text-xs">Legitimate email from a trusted source</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setScreen("playing")}
                            className="px-8 py-3 rounded-lg border border-neon-green/50 bg-neon-green/10 text-neon-green font-bold hover:bg-neon-green/20 transition-colors"
                        >
                            [ START TRIAGE ]
                        </button>
                    </div>
                )}

                {/* PLAYING SCREEN */}
                {screen === "playing" && currentEmail && (
                    <div>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="text-xs text-[#64748b]">EMAIL {index + 1} OF {emails.length}</div>
                            <div className={`flex items-center gap-2 font-bold text-lg ${timerColor}`}>
                                <Clock size={16} />
                                <span>{timeLeft}s</span>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-[#1e293b] rounded-full h-1 mb-6">
                            <div className="bg-neon-green h-1 rounded-full transition-all" style={{ width: `${((index) / emails.length) * 100}%` }} />
                        </div>

                        {/* Email card */}
                        <div className="rounded-xl border border-slate-700 bg-[#1e293b] overflow-hidden mb-6">
                            {/* Email meta */}
                            <div className="border-b border-slate-700 px-5 py-4 bg-[#0f172a]">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-[#64748b]">FROM:</span>
                                    <span className="text-sm text-[#e2e8f0] break-all">{currentEmail.from}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-[#64748b]">SUBJECT:</span>
                                    <span className="text-sm font-bold text-[#e2e8f0]">{currentEmail.subject}</span>
                                </div>
                            </div>

                            {/* Email body preview */}
                            <div className="px-5 py-4">
                                <p className="text-sm text-[#94a3b8] leading-relaxed">
                                    {expanded ? currentEmail.body : currentEmail.preview}
                                </p>
                                {!expanded && (
                                    <button onClick={() => setExpanded(true)} className="mt-2 text-xs text-neon-green hover:underline">
                                        Read full email →
                                    </button>
                                )}
                            </div>

                            {/* Explanation after answer */}
                            {chosen && (
                                <div className={`px-5 py-4 border-t border-slate-700 ${chosen === currentEmail.answer ? "bg-neon-green/5" : "bg-red-500/5"}`}>
                                    <div className="flex items-start gap-2">
                                        {chosen === currentEmail.answer
                                            ? <CheckCircle size={16} className="text-neon-green mt-0.5 shrink-0" />
                                            : <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                                        }
                                        <div>
                                            <div className={`text-xs font-bold mb-1 ${chosen === currentEmail.answer ? "text-neon-green" : "text-red-400"}`}>
                                                {chosen === currentEmail.answer ? "CORRECT" : `WRONG — Answer: ${currentEmail.answer}`}
                                            </div>
                                            <p className="text-xs text-[#94a3b8] leading-relaxed">{currentEmail.explanation}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Answer buttons */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {(["Phishing", "Suspicious", "Safe"] as Label[]).map((label) => (
                                <button
                                    key={label}
                                    onClick={() => handleAnswer(label)}
                                    disabled={!!chosen}
                                    className={`py-3 rounded-lg border font-bold text-sm transition-colors ${chosenStyle(label)} disabled:cursor-default`}
                                >
                                    {label.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        {/* Next button */}
                        {chosen && (
                            <button
                                onClick={next}
                                className="w-full py-3 rounded-lg border border-neon-green/50 bg-neon-green/10 text-neon-green font-bold hover:bg-neon-green/20 transition-colors flex items-center justify-center gap-2"
                            >
                                {index + 1 >= emails.length ? "See Results" : "Next Email"}
                                <ChevronRight size={16} />
                            </button>
                        )}
                    </div>
                )}

                {/* DONE SCREEN */}
                {screen === "done" && (
                    <div>
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-bold mb-2">Triage <span className="text-neon-green">Complete</span></h1>
                            <div className="text-5xl font-bold my-6">
                                <span className={score >= 8 ? "text-neon-green" : score >= 5 ? "text-yellow-400" : "text-red-400"}>
                                    {score}
                                </span>
                                <span className="text-[#64748b] text-3xl"> / {emails.length}</span>
                            </div>
                            <p className="text-[#94a3b8] text-sm">
                                {score === emails.length
                                    ? "Perfect score! Your phishing radar is razor sharp."
                                    : score >= 8
                                    ? "Great job. A few tricky ones slipped through."
                                    : score >= 5
                                    ? "Not bad, but some scams fooled you. Review the explanations below."
                                    : "Scammers would have you for lunch. Study the explanations carefully."}
                            </p>
                        </div>

                        <div className="space-y-3 mb-8">
                            {results.map((r, i) => (
                                <div key={i} className={`rounded-lg border p-4 ${r.correct ? "border-neon-green/20 bg-neon-green/5" : "border-red-500/20 bg-red-500/5"}`}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {r.correct ? <CheckCircle size={14} className="text-neon-green shrink-0" /> : <XCircle size={14} className="text-red-400 shrink-0" />}
                                                <span className="text-xs font-bold truncate">{r.email.subject}</span>
                                            </div>
                                            <div className="text-xs text-[#64748b] mb-1">
                                                You said: <span className={r.correct ? "text-neon-green" : "text-red-400"}>{r.chosen}</span>
                                                {!r.correct && <span className="text-[#94a3b8]"> — Correct: <span className="text-neon-green">{r.email.answer}</span></span>}
                                            </div>
                                            <p className="text-xs text-[#64748b] leading-relaxed">{r.email.explanation}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 flex-wrap">
                            <button
                                onClick={() => { setScreen("start"); setIndex(0); setChosen(null); setResults([]); setTimeLeft(TIMER_PER_EMAIL); setExpanded(false); }}
                                className="px-6 py-3 rounded-lg border border-neon-green/50 bg-neon-green/10 text-neon-green font-bold hover:bg-neon-green/20 transition-colors"
                            >
                                Play Again
                            </button>
                            <Link href="/puzzles" className="px-6 py-3 rounded-lg border border-slate-600 text-[#94a3b8] font-bold hover:border-neon-green/40 hover:text-neon-green transition-colors">
                                Back to Hub
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
