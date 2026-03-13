"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Crosshair, Terminal, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import AccountScoreBar from "@/components/account-score-bar";
import { addTotalScore, syncScoreToDb } from "@/lib/session";

interface Segment {
    id: string;
    content: string;
    isSuspicious: boolean;
    explanation: string;
    style?: string;
}

interface Puzzle {
    id: number;
    title: string;
    description: string;
    timeLimit: number;
    segments: Segment[];
}

const puzzles: Puzzle[] = [
    {
        id: 1,
        title: "Fake PayPal Email",
        description: "A customer received this email. Find all suspicious elements before time runs out.",
        timeLimit: 60,
        segments: [
            { id: "p1-from", content: "From: paypa1-security@accounts-verify.net", isSuspicious: true, explanation: "The domain is 'accounts-verify.net', not paypal.com. Also note 'paypa1' uses a number 1 instead of letter l.", style: "text-xs text-[#64748b]" },
            { id: "p1-subject", content: "Subject: Your PayPal account has been limited — action required", isSuspicious: false, explanation: "Subject lines alone aren't suspicious — content and sender matter more.", style: "text-sm font-bold text-[#e2e8f0]" },
            { id: "p1-date", content: "Date: Thu, 12 March 2026, 03:14 AM", isSuspicious: true, explanation: "Legitimate PayPal emails don't send security alerts at 3am. Scammers send in bulk regardless of timezone.", style: "text-xs text-[#64748b]" },
            { id: "p1-greeting", content: "Dear Valued Customer,", isSuspicious: true, explanation: "PayPal always addresses you by your full name. 'Dear Customer' or 'Dear Valued Customer' is a classic phishing tell — they don't know your name.", style: "text-sm text-[#e2e8f0] font-bold mt-2" },
            { id: "p1-body1", content: "We have detected unusual activity on your PayPal account. To protect your funds, your account has been temporarily limited.", isSuspicious: false, explanation: "Generic body text — not suspicious on its own, but be wary in context.", style: "text-sm text-[#94a3b8] leading-relaxed" },
            { id: "p1-urgency", content: "You must verify your information within 24 hours or your account will be permanently suspended.", isSuspicious: true, explanation: "Manufactured urgency is one of the most reliable phishing signals. Scammers want you to act before you think.", style: "text-sm text-red-300 font-bold" },
            { id: "p1-cta", content: "[ CLICK HERE TO RESTORE ACCESS ]", isSuspicious: true, explanation: "This button links to 'http://paypal-restore-account.xyz' — not paypal.com. Always hover over links to see the real URL before clicking.", style: "px-4 py-2 bg-blue-600/30 border border-blue-500/50 text-blue-300 text-sm rounded cursor-pointer w-fit" },
            { id: "p1-footer", content: "PayPal | 2211 North First Street, San Jose, CA 95131", isSuspicious: false, explanation: "A real address doesn't make an email real — anyone can copy it. But it's not a suspicious element by itself.", style: "text-xs text-[#475569]" },
            { id: "p1-unsubscribe", content: "Unsubscribe | Privacy | Help", isSuspicious: false, explanation: "Footer links are common in both legitimate and phishing emails. Not a red flag.", style: "text-xs text-[#475569]" },
        ],
    },
    {
        id: 2,
        title: "Fake HMRC Refund Email",
        description: "You've been sent this government refund notification. Find the red flags.",
        timeLimit: 55,
        segments: [
            { id: "p2-from", content: "From: noreply@hmrc-gov-refunds.co.uk", isSuspicious: true, explanation: "HMRC's real domain is hmrc.gov.uk. 'hmrc-gov-refunds.co.uk' is a lookalike domain designed to deceive.", style: "text-xs text-[#64748b]" },
            { id: "p2-subject", content: "Subject: Tax Refund Notification — £847.50 Ready to Claim", isSuspicious: true, explanation: "HMRC doesn't email you to claim a refund with a specific amount out of nowhere. Refunds are processed through your government account or post.", style: "text-sm font-bold text-[#e2e8f0]" },
            { id: "p2-logo", content: "HMRC — HM Revenue & Customs", isSuspicious: false, explanation: "Copying a logo or name is trivially easy. This alone is not a red flag.", style: "text-base font-bold text-[#e2e8f0] border-b border-slate-700 pb-2" },
            { id: "p2-greeting", content: "Dear Taxpayer,", isSuspicious: true, explanation: "HMRC knows your name from your tax records. 'Dear Taxpayer' is proof this isn't genuine HMRC correspondence.", style: "text-sm text-[#e2e8f0] font-bold mt-2" },
            { id: "p2-body1", content: "Following a review of your 2024/25 tax assessment, you are entitled to a refund of £847.50.", isSuspicious: false, explanation: "The format is plausible, but the combination of other signals makes this suspicious.", style: "text-sm text-[#94a3b8] leading-relaxed" },
            { id: "p2-cta", content: "To receive your refund, you must update your banking details using the secure form below.", isSuspicious: true, explanation: "HMRC never asks you to 'update banking details' via email. Refunds go to your existing registered bank account.", style: "text-sm text-yellow-300 leading-relaxed" },
            { id: "p2-link", content: "[ Access Your Refund Portal → http://hmrc-refund-claim.net/secure ]", isSuspicious: true, explanation: "The URL is 'hmrc-refund-claim.net' — completely different from hmrc.gov.uk. This is a credential harvesting page.", style: "text-sm text-blue-400 underline" },
            { id: "p2-ref", content: "Reference: HMRC/2025/T/481029", isSuspicious: false, explanation: "Anyone can fabricate a reference number. It's not suspicious on its own.", style: "text-xs text-[#64748b]" },
            { id: "p2-warning", content: "Failure to claim within 30 days will result in the refund being returned to HMRC reserves.", isSuspicious: true, explanation: "More manufactured urgency. HMRC does not force you to 'claim' by a deadline or lose your refund via email.", style: "text-xs text-orange-400" },
        ],
    },
    {
        id: 3,
        title: "Fake IT Helpdesk Email",
        description: "This email arrived in your work inbox from 'IT Support'. Spot every red flag.",
        timeLimit: 50,
        segments: [
            { id: "p3-from", content: "From: it-helpdesk@yourcompany-support.net", isSuspicious: true, explanation: "Your real IT team would email from @yourcompany.co.uk or similar. 'yourcompany-support.net' is a lookalike third-party domain.", style: "text-xs text-[#64748b]" },
            { id: "p3-subject", content: "Subject: Urgent — Your Microsoft 365 Password Expires Today", isSuspicious: false, explanation: "IT teams do send password expiry notices. The subject alone isn't suspicious — check the sender and content.", style: "text-sm font-bold text-[#e2e8f0]" },
            { id: "p3-greeting", content: "Hi User,", isSuspicious: true, explanation: "Your IT team knows your name. 'Hi User' betrays that this email was sent in bulk to many addresses.", style: "text-sm text-[#e2e8f0] font-bold mt-2" },
            { id: "p3-body1", content: "Your Microsoft 365 password expires today at 11:59pm. To keep access to your email, Teams, and OneDrive, you must reset your password immediately.", isSuspicious: false, explanation: "The content is plausible. But combined with other signals, treat this with caution.", style: "text-sm text-[#94a3b8] leading-relaxed" },
            { id: "p3-link", content: "[ Reset My Password Now ] — http://ms365-reset.yourcompany-support.net", isSuspicious: true, explanation: "The link goes to 'yourcompany-support.net', not your actual company or microsoft.com. This would capture your Microsoft credentials.", style: "text-sm text-blue-400 underline" },
            { id: "p3-timeout", content: "Accounts that are not updated within 2 hours will be locked and require manual recovery via the IT desk.", isSuspicious: true, explanation: "Tight time pressure is a social engineering tactic. Legitimate IT communications give you days, not hours.", style: "text-sm text-red-300" },
            { id: "p3-signed", content: "Kind regards, The IT Helpdesk Team", isSuspicious: false, explanation: "An email signature alone isn't suspicious — anyone can write one.", style: "text-sm text-[#94a3b8]" },
            { id: "p3-phoneno", content: "Tel: 0800 123 4567 | support@yourcompany.co.uk", isSuspicious: true, explanation: "The phone number is unverifiable, and the support email here contradicts the sender domain — a common inconsistency in phishing emails.", style: "text-xs text-[#64748b]" },
        ],
    },
    {
        id: 4,
        title: "Fake Amazon Delivery",
        description: "This delivery notification just arrived. Find every red flag.",
        timeLimit: 55,
        segments: [
            { id: "p4-from", content: "From: delivery-updates@amazon-shipping-notify.com", isSuspicious: true, explanation: "Amazon's delivery notifications come from @amazon.co.uk or @amazon.com. 'amazon-shipping-notify.com' is a scam domain.", style: "text-xs text-[#64748b]" },
            { id: "p4-subject", content: "Subject: Your Amazon order has been delayed — action needed", isSuspicious: false, explanation: "Delay notifications do happen. The subject alone isn't proof of a scam.", style: "text-sm font-bold text-[#e2e8f0]" },
            { id: "p4-greeting", content: "Hello Amazon Shopper,", isSuspicious: true, explanation: "Amazon emails address you by your real name. 'Hello Amazon Shopper' indicates this was sent in bulk.", style: "text-sm text-[#e2e8f0] font-bold mt-2" },
            { id: "p4-body1", content: "Your order #AMZ-7829104 has been delayed due to an address verification issue.", isSuspicious: false, explanation: "Plausible delivery issue. Check the sender and links for confirmation.", style: "text-sm text-[#94a3b8] leading-relaxed" },
            { id: "p4-action", content: "Please confirm your delivery address and pay the £2.49 re-routing fee to continue processing:", isSuspicious: true, explanation: "Amazon never charges re-routing or address confirmation fees. This is an advance-fee scam tactic.", style: "text-sm text-yellow-300" },
            { id: "p4-link", content: "[ Confirm Address & Pay → http://amazon-delivery-update.xyz/confirm ]", isSuspicious: true, explanation: "The URL is 'amazon-delivery-update.xyz' — not amazon.com. The .xyz TLD is commonly used in phishing.", style: "text-sm text-blue-400 underline" },
            { id: "p4-urgency", content: "If no action is taken within 12 hours, your parcel will be returned to the seller.", isSuspicious: true, explanation: "Artificial urgency. Amazon gives days to resolve delivery issues, not hours.", style: "text-xs text-orange-400" },
            { id: "p4-footer", content: "Amazon.com, Inc. | 410 Terry Avenue North, Seattle, WA 98109", isSuspicious: false, explanation: "Copying a real address doesn't validate the email. Anyone can include this.", style: "text-xs text-[#475569]" },
        ],
    },
    {
        id: 5,
        title: "Fake LinkedIn Recruiter",
        description: "You received this LinkedIn message. Spot every suspicious element.",
        timeLimit: 50,
        segments: [
            { id: "p5-from", content: "From: careers@linkedin-recruiting-pro.net", isSuspicious: true, explanation: "LinkedIn's domain is linkedin.com. 'linkedin-recruiting-pro.net' is a fraudulent lookalike domain.", style: "text-xs text-[#64748b]" },
            { id: "p5-subject", content: "Subject: Job Opportunity — Remote Senior Developer ($150k+)", isSuspicious: false, explanation: "The salary and role aren't suspicious on their own. Remote developer roles at this salary exist.", style: "text-sm font-bold text-[#e2e8f0]" },
            { id: "p5-greeting", content: "Hi Professional,", isSuspicious: true, explanation: "A real recruiter would use your name. 'Hi Professional' is a mass-sent message indicator.", style: "text-sm text-[#e2e8f0] font-bold mt-2" },
            { id: "p5-body1", content: "I came across your LinkedIn profile and was impressed by your experience. We have an immediate opening at a Fortune 500 company.", isSuspicious: false, explanation: "Recruiters do reach out this way. Not suspicious on its own.", style: "text-sm text-[#94a3b8] leading-relaxed" },
            { id: "p5-salary", content: "Starting salary: $150,000-$200,000 + equity. No interview required — we've already reviewed your qualifications.", isSuspicious: true, explanation: "'No interview required' is a major red flag. Every legitimate company conducts interviews. This bypasses all normal hiring processes.", style: "text-sm text-[#e2e8f0]" },
            { id: "p5-action", content: "To proceed, please fill out this onboarding form with your SSN, bank details for direct deposit, and a copy of your ID:", isSuspicious: true, explanation: "No legitimate employer asks for SSN, bank details, and ID before you've even interviewed. This is identity theft.", style: "text-sm text-yellow-300" },
            { id: "p5-link", content: "[ Complete Onboarding → http://career-portal-secure.net/onboard ]", isSuspicious: true, explanation: "A phishing URL unrelated to any known company. This form would harvest your identity and financial information.", style: "text-sm text-blue-400 underline" },
            { id: "p5-deadline", content: "This offer expires in 48 hours. Positions are filling quickly.", isSuspicious: true, explanation: "Artificial time pressure. No real job offer expires in 48 hours without even an interview.", style: "text-xs text-orange-400" },
        ],
    },
];

type Screen = "start" | "playing" | "review" | "done";

interface PuzzleResult {
    puzzle: Puzzle;
    flagged: string[];
    timeUsed: number;
    correct: number;
    wrong: number;
}

export default function SpotRedFlagsPage() {
    const [screen, setScreen] = useState<Screen>("start");
    const [puzzleIndex, setPuzzleIndex] = useState(0);
    const [flagged, setFlagged] = useState<Set<string>>(new Set());
    const [revealed, setRevealed] = useState<Set<string>>(new Set());
    const [timeLeft, setTimeLeft] = useState(0);
    const [results, setResults] = useState<PuzzleResult[]>([]);

    const puzzle = puzzles[puzzleIndex];

    const timerExpired = useCallback(() => {
        finishPuzzle(puzzle, flagged, puzzle.timeLimit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [puzzle, flagged]);

    useEffect(() => {
        if (screen !== "playing") return;
        if (timeLeft <= 0) {
            timerExpired();
            return;
        }
        const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [screen, timeLeft, timerExpired]);

    const finishPuzzle = (p: Puzzle, userFlagged: Set<string>, timeUsed: number) => {
        const suspicious = p.segments.filter((s) => s.isSuspicious);
        const correct = suspicious.filter((s) => userFlagged.has(s.id)).length;
        const wrong = [...userFlagged].filter((id) => !suspicious.find((s) => s.id === id)).length;
        setResults((prev) => [...prev, { puzzle: p, flagged: [...userFlagged], timeUsed, correct, wrong }]);
        setScreen("review");
    };

    const handleSegmentClick = (seg: Segment) => {
        if (screen !== "playing") return;
        setRevealed((prev) => new Set([...prev, seg.id]));
        setFlagged((prev) => {
            const next = new Set(prev);
            if (next.has(seg.id)) next.delete(seg.id);
            else next.add(seg.id);
            return next;
        });
    };

    const startPuzzle = () => {
        setFlagged(new Set());
        setRevealed(new Set());
        setTimeLeft(puzzle.timeLimit);
        setScreen("playing");
    };

    const nextPuzzle = () => {
        if (puzzleIndex + 1 >= puzzles.length) {
            setScreen("done");
        } else {
            setPuzzleIndex((i) => i + 1);
            setFlagged(new Set());
            setRevealed(new Set());
            setScreen("start");
        }
    };

    const totalCorrect = results.reduce((a, r) => a + r.correct, 0);
    const totalSuspicious = results.reduce((a, r) => a + r.puzzle.segments.filter((s) => s.isSuspicious).length, 0);
    const totalWrong = results.reduce((a, r) => a + r.wrong, 0);
    const scoreSyncedRef = useRef(false);

    useEffect(() => {
        if (screen === "done" && !scoreSyncedRef.current) {
            scoreSyncedRef.current = true;
            const points = Math.max(0, totalCorrect * 3 - totalWrong);
            addTotalScore(points);
            syncScoreToDb();
        }
        if (screen === "start" && puzzleIndex === 0) {
            scoreSyncedRef.current = false;
        }
    }, [screen, totalCorrect, totalWrong, puzzleIndex]);

    const timerColor = timeLeft > 20 ? "text-neon-green" : timeLeft > 10 ? "text-yellow-400" : "text-red-400";
    const suspiciousCount = puzzle?.segments.filter((s) => s.isSuspicious).length ?? 0;

    return (
        <main className="min-h-screen bg-[#0f172a] text-[#e2e8f0] font-mono relative overflow-hidden">
            <nav className="sticky top-0 z-50 border-b border-yellow-400/20 bg-[#0f172a]">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-wider group">
                        <Terminal className="text-neon-green group-hover:animate-pulse" />
                        <span>Cyber<span className="text-neon-green">Shield</span> 360</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/puzzles" className="text-sm text-[#94a3b8] hover:text-yellow-400 transition-colors">← Puzzle Hub</Link>
                        <AccountScoreBar />
                    </div>
                </div>
            </nav>

            <div className="mx-auto max-w-3xl px-6 py-12">

                {/* START */}
                {screen === "start" && (
                    <div className="text-center">
                        <Crosshair size={48} className="text-yellow-400 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold mb-3">Spot the <span className="text-yellow-400">Red Flags</span></h1>
                        {puzzleIndex === 0 ? (
                            <p className="text-[#94a3b8] mb-8 text-sm max-w-md mx-auto leading-relaxed">
                                You&apos;ll see 5 fake emails. Click every element you think is suspicious. Click again to deselect. Race the timer to find all red flags.
                            </p>
                        ) : (
                            <p className="text-[#94a3b8] mb-8 text-sm max-w-md mx-auto leading-relaxed">
                                Puzzle {puzzleIndex + 1} of {puzzles.length}: <strong className="text-yellow-400">{puzzle.title}</strong>
                            </p>
                        )}
                        <div className="inline-flex gap-6 mb-8 text-sm">
                            <div className="text-center">
                                <div className="text-yellow-400 font-bold text-xl">{suspiciousCount}</div>
                                <div className="text-[#64748b] text-xs">red flags to find</div>
                            </div>
                            <div className="text-center">
                                <div className="text-neon-green font-bold text-xl">{puzzle?.timeLimit}s</div>
                                <div className="text-[#64748b] text-xs">time limit</div>
                            </div>
                        </div>
                        <br />
                        <button
                            onClick={startPuzzle}
                            className="px-8 py-3 rounded-lg border border-yellow-400/50 bg-yellow-400/10 text-yellow-400 font-bold hover:bg-yellow-400/20 transition-colors"
                        >
                            [ START PUZZLE {puzzleIndex + 1} ]
                        </button>
                    </div>
                )}

                {/* PLAYING */}
                {screen === "playing" && puzzle && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="text-xs text-[#64748b] tracking-widest">PUZZLE {puzzleIndex + 1} — {puzzle.title.toUpperCase()}</div>
                                <div className="text-sm text-[#94a3b8]">{puzzle.description}</div>
                            </div>
                            <div className={`flex items-center gap-2 font-bold text-lg ${timerColor}`}>
                                <Clock size={16} />
                                <span>{timeLeft}s</span>
                            </div>
                        </div>

                        <div className="text-xs text-[#64748b] mb-3 flex items-center gap-2">
                            <AlertCircle size={12} className="text-yellow-400" />
                            Click on anything suspicious. Click again to deselect.
                        </div>

                        {/* Flagged count */}
                        <div className="text-xs text-[#64748b] mb-4">
                            Flagged: <span className="text-yellow-400">{flagged.size}</span> / {suspiciousCount} red flags
                        </div>

                        {/* Email render */}
                        <div className="rounded-xl border border-slate-700 bg-[#1e293b] overflow-hidden mb-6">
                            <div className="border-b border-slate-700 bg-[#0f172a] px-5 py-2 text-xs text-[#64748b] flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500/60" />
                                <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
                                <div className="w-2 h-2 rounded-full bg-green-500/60" />
                                <span className="ml-2">Email Client</span>
                            </div>
                            <div className="p-5 space-y-2">
                                {puzzle.segments.map((seg) => {
                                    const isFlagged = flagged.has(seg.id);
                                    const isRevealed = revealed.has(seg.id);
                                    return (
                                        <div key={seg.id} className="space-y-1">
                                            <div
                                                onClick={() => handleSegmentClick(seg)}
                                                className={`
                                                    ${seg.style ?? "text-sm text-[#94a3b8]"}
                                                    cursor-pointer rounded px-2 py-1 transition-colors
                                                    ${isFlagged ? "ring-2 ring-yellow-400 bg-yellow-400/10" : "hover:bg-white/5"}
                                                `}
                                            >
                                                {seg.content}
                                                {isFlagged && <span className="ml-2 text-yellow-400 text-xs">⚑ FLAGGED</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            onClick={() => finishPuzzle(puzzle, flagged, puzzle.timeLimit - timeLeft)}
                            className="w-full py-3 rounded-lg border border-yellow-400/50 bg-yellow-400/10 text-yellow-400 font-bold hover:bg-yellow-400/20 transition-colors"
                        >
                            Submit Flags
                        </button>
                    </div>
                )}

                {/* REVIEW */}
                {screen === "review" && puzzle && results.length > 0 && (() => {
                    const r = results[results.length - 1];
                    return (
                        <div>
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold mb-2">{puzzle.title} — <span className="text-yellow-400">Results</span></h2>
                                <div className="flex justify-center gap-8 mt-4 text-sm">
                                    <div className="text-center">
                                        <div className="text-neon-green font-bold text-2xl">{r.correct}</div>
                                        <div className="text-[#64748b] text-xs">correct flags</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-red-400 font-bold text-2xl">{r.wrong}</div>
                                        <div className="text-[#64748b] text-xs">false positives</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-yellow-400 font-bold text-2xl">{puzzle.segments.filter((s) => s.isSuspicious).length - r.correct}</div>
                                        <div className="text-[#64748b] text-xs">missed</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-8">
                                {puzzle.segments.map((seg) => {
                                    const wasFlagged = r.flagged.includes(seg.id);
                                    const isCorrect = seg.isSuspicious && wasFlagged;
                                    const isMissed = seg.isSuspicious && !wasFlagged;
                                    const isFalsePositive = !seg.isSuspicious && wasFlagged;
                                    return (
                                        <div key={seg.id} className={`rounded-lg border p-3 text-sm ${
                                            isCorrect ? "border-neon-green/30 bg-neon-green/5"
                                            : isMissed ? "border-red-500/30 bg-red-500/5"
                                            : isFalsePositive ? "border-yellow-500/30 bg-yellow-500/5"
                                            : "border-slate-700 bg-transparent opacity-50"
                                        }`}>
                                            <div className="flex items-start gap-2">
                                                {isCorrect && <CheckCircle size={14} className="text-neon-green mt-0.5 shrink-0" />}
                                                {isMissed && <XCircle size={14} className="text-red-400 mt-0.5 shrink-0" />}
                                                {isFalsePositive && <AlertCircle size={14} className="text-yellow-400 mt-0.5 shrink-0" />}
                                                {!seg.isSuspicious && !wasFlagged && <div className="w-3.5 h-3.5 shrink-0" />}
                                                <div>
                                                    <div className="text-[#e2e8f0] text-xs font-bold mb-1">
                                                        {isCorrect ? "✓ Correct" : isMissed ? "✗ Missed red flag" : isFalsePositive ? "⚑ False positive" : "Legitimate"}
                                                    </div>
                                                    <div className="text-[#64748b] text-xs mb-1 italic">&ldquo;{seg.content}&rdquo;</div>
                                                    <div className="text-[#94a3b8] text-xs leading-relaxed">{seg.explanation}</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={nextPuzzle}
                                className="w-full py-3 rounded-lg border border-yellow-400/50 bg-yellow-400/10 text-yellow-400 font-bold hover:bg-yellow-400/20 transition-colors"
                            >
                                {puzzleIndex + 1 >= puzzles.length ? "See Final Score" : "Next Puzzle →"}
                            </button>
                        </div>
                    );
                })()}

                {/* DONE */}
                {screen === "done" && (
                    <div className="text-center">
                        <Crosshair size={48} className="text-yellow-400 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold mb-3">All Puzzles <span className="text-yellow-400">Complete</span></h1>
                        <div className="text-5xl font-bold my-6">
                            <span className={totalCorrect >= totalSuspicious * 0.8 ? "text-neon-green" : "text-yellow-400"}>{totalCorrect}</span>
                            <span className="text-[#64748b] text-3xl"> / {totalSuspicious}</span>
                        </div>
                        <p className="text-[#94a3b8] text-sm mb-4">
                            {totalCorrect === totalSuspicious && totalWrong === 0 ? "Perfect! No false positives, no missed flags." :
                            totalCorrect >= totalSuspicious * 0.8 ? "Strong performance — you missed a few but had good precision." :
                            "Work on identifying sender domains and urgency tactics."}
                        </p>
                        {totalWrong > 0 && <p className="text-yellow-400 text-sm mb-6">{totalWrong} false positive{totalWrong > 1 ? "s" : ""} — you flagged elements that were legitimate.</p>}
                        <div className="flex justify-center gap-3 flex-wrap">
                            <button
                                onClick={() => { setScreen("start"); setPuzzleIndex(0); setResults([]); }}
                                className="px-6 py-3 rounded-lg border border-yellow-400/50 bg-yellow-400/10 text-yellow-400 font-bold hover:bg-yellow-400/20 transition-colors"
                            >
                                Play Again
                            </button>
                            <Link href="/puzzles" className="px-6 py-3 rounded-lg border border-slate-600 text-[#94a3b8] font-bold hover:border-yellow-400/40 hover:text-yellow-400 transition-colors">
                                Back to Hub
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
