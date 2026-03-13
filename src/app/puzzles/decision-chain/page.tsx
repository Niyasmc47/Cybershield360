"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { BrainCircuit, Terminal, Shield, AlertTriangle, XCircle, CheckCircle, Clock3 } from "lucide-react";
import AccountScoreBar from "@/components/account-score-bar";
import { addTotalScore, syncScoreToDb } from "@/lib/session";

interface Choice {
    text: string;
    riskDelta: number;
    feedback: string;
    endsEarly?: boolean;
    endsEarlyAs?: "safe" | "close";
}

interface Chapter {
    id: number;
    heading: string;
    narrative: string;
    choices: Choice[];
}

interface Story {
    title: string;
    description: string;
    chapters: Chapter[];
}

const stories: Story[] = [
{
    title: "The Amazon Prize Scam",
    description: "A scam unfolds across 5 chapters. At each step, you choose what to do.",
    chapters: [
    {
        id: 1,
        heading: "Chapter 1 — The Email",
        narrative:
            'You open your inbox and see a new message:\n\n**From:** prizes@amazon-giveaway-uk.net\n**Subject:** 🎉 Congratulations — You\'ve been selected for a £1,000 Amazon Voucher!\n\n"You are one of 50 winners chosen from millions of Amazon customers this month. To claim your prize, click below within 48 hours."',
        choices: [
            { text: "Click the claim link. Why not?", riskDelta: 20, feedback: "You navigated to 'amazon-giveaway-uk.net' — a domain Amazon doesn't own. The page was a credential harvesting site." },
            { text: "Check the sender's domain first before clicking anything.", riskDelta: -5, feedback: "Smart instinct. The sender is 'amazon-giveaway-uk.net', not amazon.co.uk or amazon.com. You clicked anyway to investigate." },
            { text: "Delete it. Amazon doesn't do prize draws like this.", riskDelta: -30, feedback: "", endsEarly: true, endsEarlyAs: "safe" },
        ],
    },
    {
        id: 2,
        heading: "Chapter 2 — The Verification Form",
        narrative:  
            "The website looks convincing — Amazon branding, a progress bar, even a countdown timer. It asks:\n\n**\"To verify your identity and process your prize, please enter your full name, home address, and date of birth.\"**\n\nA padlock icon displays in the browser bar.",
        choices: [
            { text: "Enter my details — the padlock means it's secure.", riskDelta: 30, feedback: "HTTPS (the padlock) only means the connection is encrypted — it says nothing about whether the site is legitimate. Your personal data was collected." },
            { text: "Enter fake details to see what happens next.", riskDelta: 15, feedback: "Your real identity wasn't stolen here — but you're still engaging with a scam site. They may try to call or email using other data." },
            { text: "Close the tab. A real prize wouldn't need my home address.", riskDelta: -20, feedback: "", endsEarly: true, endsEarlyAs: "close" },
        ],
    },
    {
        id: 3,
        heading: "Chapter 3 — The Bank Check",
        narrative:
            '"Identity verified! One last step — to deposit your voucher directly into your Amazon account, we need to verify your bank. Please enter your sort code and account number."\n\nThe site still looks professional. There\'s a testimonial section with five-star reviews.',
        choices: [
            { text: "Enter my sort code and account number.", riskDelta: 40, feedback: "Your bank details have been collected by fraudsters. This is common in advance-fee fraud — they use partial details to sound convincing when calling your bank." },
            { text: "Enter made-up bank details.", riskDelta: 20, feedback: "Your real bank isn't compromised — but you're still on a fraudulent site. Some scammers cross-reference details with data leaks to fill in gaps." },
            { text: "Close and report the site to Action Fraud.", riskDelta: -25, feedback: "", endsEarly: true, endsEarlyAs: "close" },
        ],
    },
    {
        id: 4,
        heading: "Chapter 4 — The Processing Fee",
        narrative:
            '"Almost there! Your £1,000 voucher is ready. To cover the Royal Mail special delivery charge, a one-time fee of £4.99 is required. You can pay by card or PayPal."\n\nThis is the final step, according to the progress bar.',
        choices: [
            { text: "Pay £4.99 by card. I've come this far.", riskDelta: 40, feedback: "Your card details have been captured. Scammers may attempt further transactions or sell your card data. This £4.99 'fee' is the whole point of the scam." },
            { text: "Pay via PayPal — it feels safer.", riskDelta: 20, feedback: "The 'PayPal' button redirected to a fake PayPal login page. Your PayPal credentials may now be compromised." },
            { text: "Stop. Legitimate prizes never charge fees.", riskDelta: -10, feedback: "Correct instinct — but you've already shared data in previous steps. The fee is the final trap in an advance-fee fraud." },
        ],
    },
    {
        id: 5,
        heading: "Chapter 5 — The Aftermath",
        narrative:
            "Weeks later, you notice unfamiliar transactions on your bank statement. A letter arrives from the DVLA — someone has applied for a driving licence in your name. Your email inbox is full of account registration confirmations you didn't create.",
        choices: [
            { text: "Hope it sorts itself out and do nothing.", riskDelta: 30, feedback: "Identity fraud compounds over time. Every day without action gives fraudsters more time to open credit accounts, loans, and subscriptions in your name." },
            { text: "Report to Action Fraud, contact your bank, and use CIFAS protective registration.", riskDelta: -30, feedback: "✅ This is the correct response. CIFAS registration flags your identity as at-risk with all lenders, adding a layer of protection." },
            { text: "Change your main email and bank password only.", riskDelta: 10, feedback: "A partial response. Your bank and email are important, but identity fraud requires reporting to law enforcement and CIFAS for full protection." },
        ],
    },
    ],
},
{
    title: "The Investment Opportunity",
    description: "A sophisticated investment scam unfolds through LinkedIn. Every decision matters.",
    chapters: [
    {
        id: 1,
        heading: "Chapter 1 — The LinkedIn Message",
        narrative: 'You receive a LinkedIn connection request from "James Crawford, Senior Investment Analyst at Goldman Sachs." His profile has 2,300 connections and looks professional. He messages:\n\n**"Hi, I saw your profile and think you\'d be interested in an exclusive investment opportunity we\'re offering to select professionals. 15-20% guaranteed annual returns. No minimum investment. Shall I send details?"**',
        choices: [
            { text: "Yes please, send me the details!", riskDelta: 15, feedback: "Goldman Sachs doesn't recruit retail investors via LinkedIn DMs. 'Guaranteed returns' is illegal for any regulated investment firm to promise." },
            { text: "Check if this person actually works at Goldman Sachs", riskDelta: -5, feedback: "Smart move. A quick check on Goldman Sachs' official website or a call to their office would reveal this person doesn't work there." },
            { text: "Block and report. Guaranteed returns don't exist.", riskDelta: -30, feedback: "✅ Correct. The FCA warns that 'guaranteed returns' is the biggest red flag in investment fraud.", endsEarly: true, endsEarlyAs: "safe" },
        ],
    },
    {
        id: 2,
        heading: "Chapter 2 — The Webinar",
        narrative: 'James sends you a link to an "exclusive webinar" hosted on a professional-looking platform called InvestElite Pro. The webinar features a charismatic presenter showing live trading screens with profits climbing. At the end, attendees are told:\n\n**"Join our VIP trading group for just £500. Members average £5,000/month in passive income. Spots fill fast — only 12 remain."**',
        choices: [
            { text: "Sign up for £500 — the webinar looked convincing", riskDelta: 30, feedback: "The webinar was pre-recorded with fake trading screens. '12 spots remaining' is a manufactured scarcity tactic." },
            { text: "Search for InvestElite Pro reviews online first", riskDelta: 10, feedback: "Some fake review sites are created by the scammers themselves. But searching for '[platform name] scam' often reveals warnings." },
            { text: "A webinar pressuring you to pay immediately is a huge red flag. Exit.", riskDelta: -20, feedback: "✅ Correct. Legitimate investment opportunities never pressure you with countdown timers or limited spots.", endsEarly: true, endsEarlyAs: "close" },
        ],
    },
    {
        id: 3,
        heading: "Chapter 3 — The Initial Success",
        narrative: 'You joined the VIP group. Within a week, your "portfolio" on InvestElite Pro shows a 40% return on your £500 — it now shows £700. James messages:\n\n**"See? I told you it works! Most members are now upgrading to our Platinum tier — £5,000 minimum. The returns scale with your investment."**',
        choices: [
            { text: "Upgrade to Platinum — the returns speak for themselves", riskDelta: 35, feedback: "The numbers on screen are completely fabricated. This is the 'pig butchering' phase — they show fake profits to encourage larger deposits." },
            { text: "Try to withdraw the £700 first to test if it's real", riskDelta: 15, feedback: "Some platforms allow small withdrawals early on to build trust. This is a calculated tactic — they'll let you withdraw £200 to convince you to deposit £5,000." },
            { text: "40% in one week is impossible. This is a Ponzi scheme.", riskDelta: -15, feedback: "✅ Correct. Any legitimate trader would tell you 40% weekly returns are mathematically unsustainable." },
        ],
    },
    {
        id: 4,
        heading: "Chapter 4 — The Withdrawal Problem",
        narrative: 'You try to withdraw your funds. The platform shows a message:\n\n**"Withdrawal request received. Due to anti-money laundering regulations, a verification fee of £250 is required before we can process withdrawals over £500."**\n\nJames messages: "Don\'t worry, everyone has to do this. It\'s a legal requirement. Once verified, you can withdraw everything freely."',
        choices: [
            { text: "Pay the £250 — I need to get my money out", riskDelta: 40, feedback: "SCAM. There is no 'AML verification fee.' Real platforms verify identity for free using documents. This is a second extraction phase." },
            { text: "Ask James why the fee isn't deducted from my balance", riskDelta: 20, feedback: "A logical question. They'll invent a technical reason why it must be a separate payment." },
            { text: "This is advance-fee fraud. Report to Action Fraud and my bank.", riskDelta: -25, feedback: "✅ Correct. 'Pay a fee to unlock your funds' is textbook advance-fee fraud. Report immediately." },
        ],
    },
    {
        id: 5,
        heading: "Chapter 5 — The Final Hook",
        narrative: 'James sends one final message:\n\n**"I understand your concern. As a gesture of goodwill, the company will waive the verification fee if you deposit an additional £2,000 into your Platinum account. This brings your total to over £10,000 which qualifies for our Priority Withdrawal program."**\n\nHe includes a screenshot of another member\'s withdrawal confirmation showing £23,000 received.',
        choices: [
            { text: "Deposit £2,000 — I just want my money back at this point", riskDelta: 40, feedback: "This is the sunk cost trap. Every additional payment goes straight to the scammers. Screenshots are fabricated." },
            { text: "Try contacting InvestElite Pro support directly", riskDelta: 15, feedback: "Their 'support team' is the same scammers. They'll reassure you and encourage more deposits." },
            { text: "Cut losses. Report everything — bank, Action Fraud, FCA.", riskDelta: -30, feedback: "✅ The hardest but correct choice. The £500 is unrecoverable. Reporting to the FCA helps shut down the platform." },
        ],
    },
    ],
},
];

type Screen = "intro" | "playing" | "intermission" | "ended";
const CHOICE_TIME_LIMIT = 25;

type OutcomeLevel = "safe" | "close" | "compromised" | "scammed";

const getOutcome = (risk: number): OutcomeLevel => {
    if (risk <= 0) return "safe";
    if (risk <= 30) return "close";
    if (risk <= 70) return "compromised";
    return "scammed";
};

const outcomeConfig: Record<OutcomeLevel, { title: string; color: string; icon: React.ReactNode; body: string }> = {
    safe: {
        title: "You stayed safe.",
        color: "text-neon-green",
        icon: <CheckCircle size={48} className="text-neon-green" />,
        body: "You recognised red flags early and refused to engage. This is exactly the right approach — scammers rely on curiosity and compliance.",
    },
    close: {
        title: "Close call.",
        color: "text-yellow-400",
        icon: <AlertTriangle size={48} className="text-yellow-400" />,
        body: "Some of your decisions exposed you to risk. No major damage occurred, but earlier exits would have been safer.",
    },
    compromised: {
        title: "Identity compromised.",
        color: "text-orange-400",
        icon: <AlertTriangle size={48} className="text-orange-400" />,
        body: "Your personal data was collected by fraudsters. You should run a credit report, register with CIFAS, and report to Action Fraud (0300 123 2040).",
    },
    scammed: {
        title: "Fully scammed.",
        color: "text-red-400",
        icon: <XCircle size={48} className="text-red-400" />,
        body: "Your data, bank details, and money were taken. This is advance-fee fraud — one of the most common scam types. Report immediately to your bank's fraud team and Action Fraud.",
    },
};

interface PlayedChoice {
    chapterId: number;
    storyIndex: number;
    choice: Choice;
}

interface StoryResult {
    storyIndex: number;
    outcome: OutcomeLevel;
    earlyEnd: "safe" | "close" | null;
    risk: number;
    choices: PlayedChoice[];
}

const scoreForOutcome = (o: OutcomeLevel): number => {
    if (o === "safe") return 30;
    if (o === "close") return 15;
    if (o === "compromised") return 5;
    return 0;
};

export default function DecisionChainPage() {
    const [screen, setScreen] = useState<Screen>("intro");
    const [storyIndex, setStoryIndex] = useState(0);
    const [chapterIndex, setChapterIndex] = useState(0);
    const [risk, setRisk] = useState(0);
    const [played, setPlayed] = useState<PlayedChoice[]>([]);
    const [lastFeedback, setLastFeedback] = useState<string | null>(null);
    const [earlyEnd, setEarlyEnd] = useState<"safe" | "close" | null>(null);
    const [storyResults, setStoryResults] = useState<StoryResult[]>([]);
    const [choiceTimeLeft, setChoiceTimeLeft] = useState(CHOICE_TIME_LIMIT);
    const scoreSyncedRef = useRef(false);

    const story = stories[storyIndex];
    const chapters = story.chapters;
    const chapter = chapters[chapterIndex];
    const outcome = getOutcome(risk);
    const outcomeData = outcomeConfig[earlyEnd ?? outcome];

    const finishStory = (endType: "safe" | "close" | null, currentRisk: number, currentPlayed: PlayedChoice[]) => {
        const finalOutcome = endType ?? getOutcome(currentRisk);
        const result: StoryResult = {
            storyIndex,
            outcome: finalOutcome,
            earlyEnd: endType,
            risk: currentRisk,
            choices: currentPlayed.filter(p => p.storyIndex === storyIndex),
        };
        setStoryResults(prev => [...prev, result]);
        if (storyIndex + 1 < stories.length) {
            setScreen("intermission");
        } else {
            setScreen("ended");
        }
    };

    useEffect(() => {
        if (screen === "ended" && !scoreSyncedRef.current) {
            scoreSyncedRef.current = true;
            const totalPoints = storyResults.reduce((sum, r) => sum + scoreForOutcome(r.outcome), 0);
            if (totalPoints > 0) {
                addTotalScore(totalPoints);
                syncScoreToDb();
            }
        }
    }, [screen, storyResults]);

    useEffect(() => {
        if (screen !== "playing" || !chapter || !!lastFeedback) return;
        setChoiceTimeLeft(CHOICE_TIME_LIMIT);
    }, [screen, storyIndex, chapterIndex, lastFeedback, chapter]);

    useEffect(() => {
        if (screen !== "playing" || !chapter || !!lastFeedback) return;

        if (choiceTimeLeft <= 0) {
            const safest = chapter.choices.reduce((best, current) =>
                current.riskDelta < best.riskDelta ? current : best
            );
            handleChoice(safest);
            return;
        }

        const t = setTimeout(() => setChoiceTimeLeft((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [screen, chapter, lastFeedback, choiceTimeLeft]);

    const handleChoice = (choice: Choice) => {
        const newRisk = Math.max(0, risk + choice.riskDelta);
        setRisk(newRisk);
        const newPlayed = [...played, { chapterId: chapter.id, storyIndex, choice }];
        setPlayed(newPlayed);
        if (choice.endsEarly) {
            setEarlyEnd(choice.endsEarlyAs ?? "safe");
            finishStory(choice.endsEarlyAs ?? "safe", newRisk, newPlayed);
            return;
        }
        setLastFeedback(choice.feedback);
    };

    const advance = () => {
        setLastFeedback(null);
        if (chapterIndex + 1 >= chapters.length) {
            finishStory(null, risk, played);
        } else {
            setChapterIndex((i) => i + 1);
        }
    };

    const nextStory = () => {
        setStoryIndex(i => i + 1);
        setChapterIndex(0);
        setRisk(0);
        setLastFeedback(null);
        setEarlyEnd(null);
        setScreen("playing");
    };

    const restart = () => {
        setScreen("intro");
        setStoryIndex(0);
        setChapterIndex(0);
        setRisk(0);
        setPlayed([]);
        setLastFeedback(null);
        setEarlyEnd(null);
        setStoryResults([]);
        scoreSyncedRef.current = false;
    };

    const riskPercent = Math.min(100, risk);
    const riskColor = riskPercent <= 20 ? "bg-neon-green" : riskPercent <= 50 ? "bg-yellow-400" : riskPercent <= 75 ? "bg-orange-400" : "bg-red-500";

    return (
        <main className="min-h-screen bg-[#0f172a] text-[#e2e8f0] font-mono relative overflow-hidden">
            <nav className="sticky top-0 z-50 border-b border-purple-400/20 bg-[#0f172a]">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-wider group">
                        <Terminal className="text-neon-green group-hover:animate-pulse" />
                        <span>Cyber<span className="text-neon-green">Shield</span> 360</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/puzzles" className="text-sm text-[#94a3b8] hover:text-purple-400 transition-colors">← Puzzle Hub</Link>
                        <AccountScoreBar />
                    </div>
                </div>
            </nav>

            <div className="mx-auto max-w-2xl px-6 py-12">

                {/* INTRO */}
                {screen === "intro" && (
                    <div className="text-center">
                        <BrainCircuit size={48} className="text-purple-400 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold mb-3">Decision <span className="text-purple-400">Chain</span></h1>
                        <p className="text-[#94a3b8] mb-8 text-sm max-w-md mx-auto leading-relaxed">
                            Navigate {stories.length} interactive scam stories. At each step, you choose what to do. Your choices build a risk score — and determine how each story ends.
                        </p>
                        <div className="flex justify-center gap-4 mb-8 text-xs">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-neon-green" /> Safe</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-yellow-400" /> Risky</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-orange-400" /> Compromised</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-500" /> Scammed</div>
                        </div>
                        <button
                            onClick={() => setScreen("playing")}
                            className="px-8 py-3 rounded-lg border border-purple-400/50 bg-purple-400/10 text-purple-400 font-bold hover:bg-purple-400/20 transition-colors"
                        >
                            [ BEGIN STORY ]
                        </button>
                    </div>
                )}

                {/* PLAYING */}
                {screen === "playing" && chapter && (
                    <div>
                        {/* Story indicator */}
                        <div className="text-xs text-purple-400 tracking-widest mb-4">
                            STORY {storyIndex + 1} / {stories.length} — {story.title.toUpperCase()}
                        </div>

                        {!lastFeedback && (
                            <div className="mb-4 inline-flex items-center gap-2 rounded border border-purple-400/30 bg-purple-400/10 px-3 py-1 text-xs text-purple-300">
                                <Clock3 size={12} />
                                {choiceTimeLeft}s remaining
                            </div>
                        )}

                        {/* Risk meter */}
                        <div className="mb-6">
                            <div className="flex justify-between text-xs text-[#64748b] mb-1">
                                <span>RISK LEVEL</span>
                                <span className={riskPercent <= 20 ? "text-neon-green" : riskPercent <= 50 ? "text-yellow-400" : "text-red-400"}>{riskPercent}%</span>
                            </div>
                            <div className="w-full bg-[#1e293b] rounded-full h-2">
                                <div className={`h-2 rounded-full transition-all duration-500 ${riskColor}`} style={{ width: `${riskPercent}%` }} />
                            </div>
                        </div>

                        {/* Chapter progress */}
                        <div className="flex gap-1 mb-6">
                            {chapters.map((_, i) => (
                                <div key={i} className={`h-1 flex-1 rounded-full ${i <= chapterIndex ? "bg-purple-400" : "bg-[#1e293b]"}`} />
                            ))}
                        </div>

                        {/* Chapter card */}
                        <div className="rounded-xl border border-purple-400/30 bg-[#1e293b] p-6 mb-6">
                            <div className="text-xs text-purple-400 tracking-widest mb-3">{chapter.heading}</div>
                            <div className="text-sm text-[#94a3b8] leading-relaxed whitespace-pre-line">
                                {chapter.narrative.split("**").map((part, i) =>
                                    i % 2 === 1 ? <strong key={i} className="text-[#e2e8f0]">{part}</strong> : part
                                )}
                            </div>
                        </div>

                        {/* Feedback after choice */}
                        {lastFeedback && (
                            <div className="rounded-lg border border-purple-400/30 bg-purple-400/5 p-4 mb-4">
                                <p className="text-sm text-[#94a3b8] leading-relaxed">{lastFeedback}</p>
                                <button onClick={advance} className="mt-3 text-sm text-purple-400 font-bold hover:text-purple-300">
                                    Continue →
                                </button>
                            </div>
                        )}

                        {/* Choices */}
                        {!lastFeedback && (
                            <div className="space-y-3">
                                <div className="text-xs text-[#64748b] tracking-widest">CHOOSE_YOUR_ACTION:</div>
                                {chapter.choices.map((choice, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleChoice(choice)}
                                        className="w-full text-left rounded-lg border border-slate-600 bg-[#1e293b] px-4 py-3 text-sm hover:border-purple-400/40 hover:bg-purple-400/5 transition-colors"
                                    >
                                        {choice.text}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* INTERMISSION */}
                {screen === "intermission" && storyResults.length > 0 && (() => {
                    const lastResult = storyResults[storyResults.length - 1];
                    const data = outcomeConfig[lastResult.outcome];
                    return (
                        <div className="text-center">
                            <div className="mb-4 flex justify-center">{data.icon}</div>
                            <div className="text-xs text-purple-400 tracking-widest mb-2">STORY {storyIndex + 1} COMPLETE</div>
                            <h1 className={`text-3xl font-bold mb-3 ${data.color}`}>{data.title}</h1>
                            <p className="text-[#94a3b8] text-sm max-w-md mx-auto leading-relaxed mb-6">{data.body}</p>
                            <div className="text-xs text-[#64748b] mb-8">
                                +{scoreForOutcome(lastResult.outcome)} points earned
                            </div>
                            <button
                                onClick={nextStory}
                                className="px-8 py-3 rounded-lg border border-purple-400/50 bg-purple-400/10 text-purple-400 font-bold hover:bg-purple-400/20 transition-colors"
                            >
                                Next Story: {stories[storyIndex + 1]?.title} →
                            </button>
                        </div>
                    );
                })()}

                {/* ENDED */}
                {screen === "ended" && (
                    <div>
                        <div className="text-center mb-10">
                            <BrainCircuit size={48} className="text-purple-400 mx-auto mb-4" />
                            <h1 className="text-3xl font-bold mb-3">All Stories <span className="text-purple-400">Complete</span></h1>
                            <div className="flex justify-center gap-8 mt-6 mb-6">
                                {storyResults.map((r, i) => {
                                    const data = outcomeConfig[r.outcome];
                                    return (
                                        <div key={i} className="text-center">
                                            <div className="text-xs text-[#64748b] mb-1">{stories[r.storyIndex].title}</div>
                                            <div className={`text-lg font-bold ${data.color}`}>{data.title}</div>
                                            <div className="text-xs text-[#64748b]">+{scoreForOutcome(r.outcome)} pts</div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="text-xs text-[#64748b]">
                                Total: <span className="text-purple-400 font-bold">{storyResults.reduce((s, r) => s + scoreForOutcome(r.outcome), 0)} points</span>
                            </div>
                        </div>

                        {played.length > 0 && (
                            <div className="mb-8">
                                <div className="text-xs text-[#64748b] tracking-widest mb-3">DECISION_LOG:</div>
                                <div className="space-y-3">
                                    {played.map((p, i) => {
                                        const st = stories[p.storyIndex];
                                        const ch = st?.chapters.find((c) => c.id === p.chapterId);
                                        return (
                                            <div key={i} className={`rounded-lg border p-4 ${p.choice.riskDelta > 10 ? "border-red-500/30 bg-red-500/5" : p.choice.riskDelta <= 0 ? "border-neon-green/30 bg-neon-green/5" : "border-yellow-500/30 bg-yellow-500/5"}`}>
                                                <div className="text-xs text-purple-400 mb-1">{st?.title}</div>
                                                <div className="text-xs text-[#64748b] mb-1">{ch?.heading}</div>
                                                <div className="text-sm font-bold mb-1">&ldquo;{p.choice.text}&rdquo;</div>
                                                {p.choice.feedback && <p className="text-xs text-[#94a3b8] leading-relaxed">{p.choice.feedback}</p>}
                                                {p.choice.endsEarly && <p className="text-xs text-neon-green mt-1">✅ You exited safely at this point.</p>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 flex-wrap">
                            <button onClick={restart} className="px-6 py-3 rounded-lg border border-purple-400/50 bg-purple-400/10 text-purple-400 font-bold hover:bg-purple-400/20 transition-colors">
                                Play Again
                            </button>
                            <Link href="/puzzles" className="px-6 py-3 rounded-lg border border-slate-600 text-[#94a3b8] font-bold hover:border-purple-400/40 hover:text-purple-400 transition-colors">
                                Back to Hub
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
