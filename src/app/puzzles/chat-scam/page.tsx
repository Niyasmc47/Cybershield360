"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquareWarning, Terminal, CheckCircle, AlertTriangle, ChevronRight, Clock3 } from "lucide-react";
import AccountScoreBar from "@/components/account-score-bar";
import { addTotalScore, getUser, syncScoreToDb } from "@/lib/session";

interface ChatMessage {
    from: "scammer" | "user" | "system";
    text: string;
    delay?: number;
}

interface DecisionOption {
    text: string;
    riskDelta: number;
    feedback: string;
}

type StepType = "messages" | "decision" | "outcome";

interface Step {
    type: StepType;
    messages?: ChatMessage[];
    options?: DecisionOption[];
    outcomeTitle?: string;
    outcomeText?: string;
    outcomeType?: "safe" | "scammed" | "close";
}

interface Scenario {
    id: number;
    title: string;
    platform: string;
    platformColor: string;
    contactName: string;
    riskThreshold: number;
    steps: Step[];
}

const scenarios: Scenario[] = [
    {
        id: 1,
        title: "The Job Offer",
        platform: "WhatsApp",
        platformColor: "text-green-400",
        contactName: "Emma Watson (+44 7700 900812)",
        riskThreshold: 50,
        steps: [
            {
                type: "messages",
                messages: [
                    { from: "scammer", text: "Hi! I found your CV on Indeed. We're hiring remote workers — up to £300/day. Flexible hours. Interested?" },
                ],
            },
            {
                type: "decision",
                options: [
                    { text: "Yes! Tell me more 😊", riskDelta: 15, feedback: "You engaged with an unsolicited job offer from an unknown number. Legitimate recruiters contact you through the platform, not random texts." },
                    { text: "Which company is this?", riskDelta: 8, feedback: "Asking for the company name is smart — but engaging at all with unknown numbers risks more messages." },
                    { text: "I don't accept job offers from unknown numbers. Who are you?", riskDelta: -10, feedback: "Good instinct! Unsolicited job offers via WhatsApp are one of the most common employment scam vectors." },
                ],
            },
            {
                type: "messages",
                messages: [
                    { from: "scammer", text: "The company is Global Flex Partners Ltd. We have 12,000 employees worldwide. Your role would be online product reviewing — super easy!" },
                    { from: "scammer", text: "To reserve your position, we just need a £49 registration fee. You'll earn it back in your first hour. PayPal or bank transfer both fine 👍" },
                ],
            },
            {
                type: "decision",
                options: [
                    { text: "Okay, sending the £49 now", riskDelta: 50, feedback: "SCAM. Legitimate employers NEVER ask employees to pay a registration fee. This is a guaranteed loss." },
                    { text: "Can I pay after my first shift?", riskDelta: 25, feedback: "Still risky — you're still negotiating. Any employer asking for upfront fees is a scammer." },
                    { text: "Legitimate companies don't charge fees. I'm blocking this number.", riskDelta: -20, feedback: "✅ Correct. The Employment Agencies Act makes it illegal to charge workers fees. This was a scam." },
                ],
            },
            { type: "outcome" },
        ],
    },
    {
        id: 2,
        title: "The Fake Bank Alert",
        platform: "SMS",
        platformColor: "text-blue-400",
        contactName: "BARCLAYS-BANK",
        riskThreshold: 50,
        steps: [
            {
                type: "messages",
                messages: [
                    { from: "scammer", text: "BARCLAYS ALERT: Suspicious transaction of £892 detected on your account. If this was NOT you, call 0800-137-9921 IMMEDIATELY to freeze your account." },
                ],
            },
            {
                type: "decision",
                options: [
                    { text: "Call 0800-137-9921 right now!", riskDelta: 40, feedback: "That number is controlled by scammers, not Barclays. Always call the number printed on the BACK of your bank card." },
                    { text: "Find my bank card and call the number on it", riskDelta: -15, feedback: "✅ Perfect. The number on your card is verified. Never call a number from a text message." },
                    { text: "Ignore it — probably spam", riskDelta: 5, feedback: "Reasonable response for this message. But if your details are compromised, doing nothing could also be risky. Verifying via your card number would be safer." },
                ],
            },
            {
                type: "messages",
                messages: [
                    { from: "scammer", text: "Thank you for calling Barclays security. We have detected a fraudster attempting to empty your account. You must transfer your balance to a temporary safe account we have set up for you." },
                    { from: "scammer", text: "Transfer £2,400 to: SORT CODE 20-44-19, ACC: 83729101. We will return funds once the threat is resolved. This is time sensitive." },
                ],
            },
            {
                type: "decision",
                options: [
                    { text: "Transfer the money immediately to protect it", riskDelta: 55, feedback: "SCAM. No real bank will ever ask you to transfer money to a 'safe account'. This is the #1 tactic in authorised push payment fraud." },
                    { text: "Ask for the caller's employee ID number", riskDelta: 20, feedback: "Scammers will simply make up an ID. Engaging is still dangerous — hang up and call your bank directly." },
                    { text: "Hang up. No real bank asks you to transfer to a safe account.", riskDelta: -25, feedback: "✅ Exactly right. Banks NEVER ask you to move money to keep it safe. This is authorised push payment (APP) fraud." },
                ],
            },
            { type: "outcome" },
        ],
    },
    {
        id: 3,
        title: "The Crypto DM",
        platform: "Instagram",
        platformColor: "text-pink-400",
        contactName: "crypto_signals_vip99",
        riskThreshold: 50,
        steps: [
            {
                type: "messages",
                messages: [
                    { from: "scammer", text: "Hey! I work with a small team of crypto analysts and we've been crushing it lately. 40-80% monthly returns. Interested in joining? No experience needed 🚀" },
                ],
            },
            {
                type: "decision",
                options: [
                    { text: "40-80% monthly?? Tell me more!", riskDelta: 20, feedback: "40-80% monthly returns would make someone a billionaire in under 2 years. These numbers are fabricated." },
                    { text: "Sounds too good to be true. What's the catch?", riskDelta: 5, feedback: "Good scepticism — but continuing the conversation is still risky. Scammers are trained to handle this question." },
                    { text: "Block this account. Unsolicited investment DMs are always scams.", riskDelta: -15, feedback: "✅ Correct. Legitimate investment firms don't recruit via Instagram DMs. This is a pig butchering scam." },
                ],
            },
            {
                type: "messages",
                messages: [
                    { from: "scammer", text: "Here's my statement from last month 📊" },
                    { from: "scammer", text: "[screenshot of £14,200 profit in 30 days]" },
                    { from: "scammer", text: "We use a private platform — TradexElite. You can start with just £100. I'll guide you through every step personally." },
                ],
            },
            {
                type: "decision",
                options: [
                    { text: "£100 to start? I'll try it!", riskDelta: 50, feedback: "SCAM. 'TradexElite' is a fake platform. Once you deposit, they'll show fake profits to encourage more deposits — then vanish. This is pig butchering fraud." },
                    { text: "Show me more proof first", riskDelta: 20, feedback: "Screenshots can be completely fabricated. More 'proof' won't make this real. The platform doesn't exist." },
                    { text: "This is a pig butchering scam. Reporting your account.", riskDelta: -20, feedback: "✅ Exactly. Pig butchering scams work by building trust first, then encouraging larger and larger investments before disappearing." },
                ],
            },
            { type: "outcome" },
            ],
            },
            {
            id: 4,
            title: "The Romance Scam",
            platform: "Tinder",
            platformColor: "text-rose-400",
            contactName: "Alex M. (Verified ✓)",
            riskThreshold: 50,
            steps: [
                {
                    type: "messages",
                    messages: [
                        { from: "scammer", text: "Hey! I noticed we matched. You seem really interesting. I'm actually overseas right now for military deployment but I'd love to get to know you better 💕" },
                    ],
                },
                {
                    type: "decision",
                    options: [
                        { text: "Aww that's sweet! Tell me more about yourself", riskDelta: 10, feedback: "Engaging with profiles that quickly mention being overseas/military is risky — this is a common romance scam opener." },
                        { text: "Why are you on Tinder if you're deployed?", riskDelta: 5, feedback: "Good question. Military romance scams are extremely common, but continued conversation still puts you at risk." },
                        { text: "Military deployment romance? Classic scam setup. Unmatching.", riskDelta: -15, feedback: "✅ Correct. Romance scams involving military deployment are the #1 reported format. Smart to disengage." },
                    ],
                },
                {
                    type: "messages",
                    messages: [
                        { from: "scammer", text: "I know it sounds crazy but I feel a real connection already. Listen, I'm having trouble accessing my bank from here. Could you send me a £200 Google Play gift card? I'll pay you back double when I'm home next month 🙏" },
                    ],
                },
                {
                    type: "decision",
                    options: [
                        { text: "Sure, sending the gift card code now", riskDelta: 50, feedback: "SCAM. Gift cards are untraceable currency for scammers. No legitimate person asks a stranger for gift cards. You'll never see that money again." },
                        { text: "Can I just transfer money to your bank instead?", riskDelta: 30, feedback: "Also dangerous — transferring money to a stranger's account is equally risky. The method of payment doesn't make the scam legitimate." },
                        { text: "Nobody who's real asks for gift cards. Reporting this profile.", riskDelta: -20, feedback: "✅ Correct. Gift card requests are a guaranteed scam indicator. The FTC says gift cards are the #1 payment method used in scams." },
                    ],
                },
                { type: "outcome" },
            ],
            },
            {
            id: 5,
            title: "The Tech Support Scam",
            platform: "Phone Call",
            platformColor: "text-violet-400",
            contactName: "Microsoft Support (+1-800-555-0199)",
            riskThreshold: 50,
            steps: [
                {
                    type: "messages",
                    messages: [
                        { from: "scammer", text: "[Automated voice] This is Microsoft Security Center. We have detected a virus on your computer that is stealing your banking information. Press 1 to speak with a technician immediately." },
                    ],
                },
                {
                    type: "decision",
                    options: [
                        { text: "Press 1 — this sounds serious", riskDelta: 20, feedback: "Microsoft never makes unsolicited calls about viruses. This is a tech support scam designed to gain remote access to your computer." },
                        { text: "I don't think Microsoft calls people. Let me verify.", riskDelta: 0, feedback: "Good instinct. Microsoft confirms they NEVER make unsolicited tech support calls." },
                        { text: "Hang up immediately. Microsoft doesn't call you.", riskDelta: -15, feedback: "✅ Correct. Microsoft states clearly: they will never proactively call you about computer problems. This is always a scam." },
                    ],
                },
                {
                    type: "messages",
                    messages: [
                        { from: "scammer", text: "Hello, I am David from Microsoft Windows Technical Department. Your IP address has been flagged for suspicious activity. I need you to open TeamViewer so I can show you the infected files. This is urgent — hackers are accessing your banking right now." },
                    ],
                },
                {
                    type: "decision",
                    options: [
                        { text: "Download TeamViewer and give them access", riskDelta: 55, feedback: "SCAM. Giving remote access lets scammers install malware, steal passwords, and access your bank accounts. Never give remote access to unsolicited callers." },
                        { text: "What's my IP address then?", riskDelta: 15, feedback: "Testing them is slightly better, but engaging with scammers wastes time and they may have partial data from leaks." },
                        { text: "No legitimate tech company asks for remote access via cold calls. Hanging up.", riskDelta: -20, feedback: "✅ Exactly right. The FTC received 70,000+ tech support scam complaints in 2023 alone. Always hang up." },
                    ],
                },
                { type: "outcome" },
            ],
            },
            {
            id: 6,
            title: "The Delivery Fee Trap",
            platform: "Email",
            platformColor: "text-amber-400",
            contactName: "Royal Mail Customer Service",
            riskThreshold: 50,
            steps: [
                {
                    type: "messages",
                    messages: [
                        { from: "scammer", text: "Dear Customer, We attempted to deliver your parcel (REF: RM-482910) but could not access your property. To reschedule delivery, please pay the £1.99 redelivery fee at: royalmail-redelivery.co.net" },
                    ],
                },
                {
                    type: "decision",
                    options: [
                        { text: "Pay £1.99 — it's only a small amount", riskDelta: 30, feedback: "The £1.99 is bait to harvest your card details. Scammers will then make larger transactions. 'royalmail-redelivery.co.net' is not Royal Mail's domain (royalmail.com)." },
                        { text: "Check Royal Mail's official website for the tracking number", riskDelta: -5, feedback: "Good approach — checking the official tracking system at royalmail.com would reveal no such parcel exists." },
                        { text: "This domain isn't royalmail.com. It's a scam.", riskDelta: -15, feedback: "✅ Correct. Royal Mail's domain is royalmail.com. 'royalmail-redelivery.co.net' is a scam domain. Royal Mail leaves physical cards, not emails." },
                    ],
                },
                {
                    type: "messages",
                    messages: [
                        { from: "scammer", text: "Thank you for your payment. For security, please also verify your identity by entering your full name, date of birth, and the last 4 digits of your bank card." },
                    ],
                },
                {
                    type: "decision",
                    options: [
                        { text: "Enter my details — I already paid, might as well verify", riskDelta: 50, feedback: "SCAM ESCALATION. They've now collected your card details AND personal identity information. This is enough for identity theft and card fraud." },
                        { text: "Why do you need my DOB for a parcel?", riskDelta: 15, feedback: "Good question but you've already shared card details. The damage is partially done." },
                        { text: "Close immediately and call my bank to freeze the card used.", riskDelta: -20, feedback: "✅ Critical response. Contact your bank immediately to report the card as compromised. Change any passwords used on similar sites." },
                    ],
                },
                { type: "outcome" },
            ],
            },
            ];

type GameState = "start" | "playing" | "summary";
const DECISION_TIME_LIMIT = 20;

interface Choice {
    scenarioId: number;
    name: string;
    option: DecisionOption;
}

const outcomeFor = (risk: number, threshold: number): "safe" | "close" | "scammed" => {
    if (risk >= threshold) return "scammed";
    if (risk >= threshold * 0.6) return "close";
    return "safe";
};

const outcomeText = (outcome: "safe" | "close" | "scammed"): { title: string; body: string } => {
    if (outcome === "scammed") return { title: "You got scammed.", body: "Your decisions led you deeper into the trap. Scammers are professionals — they know exactly how to keep you engaged. Review which choices raised your risk." };
    if (outcome === "close") return { title: "Close call.", body: "You avoided the worst outcome but some of your decisions put you at risk. A more cautious approach earlier would have kept you safer." };
    return { title: "You stayed safe.", body: "Great instincts. You recognised the red flags and refused to engage on the scammer's terms. This is exactly how you beat them." };
};

export default function ChatScamPage() {
    const [gameState, setGameState] = useState<GameState>("start");
    const [scenarioIndex, setScenarioIndex] = useState(0);
    const [stepIndex, setStepIndex] = useState(0);
    const [visibleMessages, setVisibleMessages] = useState<number>(0);
    const [risk, setRisk] = useState(0);
    const [allChoices, setAllChoices] = useState<Choice[]>([]);
    const [lastFeedback, setLastFeedback] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [decisionTimeLeft, setDecisionTimeLeft] = useState(DECISION_TIME_LIMIT);

    const scenario = scenarios[scenarioIndex];
    const step = scenario?.steps[stepIndex];

    // Show messages one at a time
    useEffect(() => {
        if (gameState !== "playing" || !step || step.type !== "messages") return;
        if (visibleMessages >= (step.messages?.length ?? 0)) return;
        const t = setTimeout(() => setVisibleMessages((v) => v + 1), 800);
        return () => clearTimeout(t);
    }, [gameState, step, visibleMessages]);

    useEffect(() => {
        if (gameState !== "playing" || !step || step.type !== "decision" || showFeedback) return;
        setDecisionTimeLeft(DECISION_TIME_LIMIT);
    }, [gameState, scenarioIndex, stepIndex, showFeedback, step]);

    useEffect(() => {
        if (gameState !== "playing" || !step || step.type !== "decision" || showFeedback) return;

        if (decisionTimeLeft <= 0) {
            const safest = step.options?.reduce((best, current) =>
                current.riskDelta < best.riskDelta ? current : best
            );
            if (safest) {
                handleChoice(safest);
            }
            return;
        }

        const t = setTimeout(() => setDecisionTimeLeft((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [gameState, step, showFeedback, decisionTimeLeft]);

    const handleChoice = (option: DecisionOption) => {
        if (showFeedback) return;
        const newRisk = risk + option.riskDelta;
        setRisk(newRisk);
        setAllChoices((prev) => [...prev, { scenarioId: scenario.id, name: scenario.title, option }]);
        setLastFeedback(option.feedback);
        setShowFeedback(true);
    };

    const moveToNextScenario = () => {
        if (scenarioIndex + 1 < scenarios.length) {
            setScenarioIndex((i) => i + 1);
            setStepIndex(0);
            setVisibleMessages(0);
            setRisk(0);
        } else {
            const outcome = totalOutcome();
            const points = outcome === "safe" ? 25 : outcome === "close" ? 10 : 0;
            if (points > 0) addTotalScore(points);
            syncScoreToDb();
            setGameState("summary");
        }
    };

    const advanceStep = () => {
        setShowFeedback(false);
        setLastFeedback(null);
        const nextStep = scenario.steps[stepIndex + 1];
        if (!nextStep || nextStep.type === "outcome") {
            moveToNextScenario();
        } else {
            setStepIndex((i) => i + 1);
            if (nextStep.type === "messages") setVisibleMessages(0);
        }
    };

    const messagesReady = step?.type === "messages" && visibleMessages >= (step.messages?.length ?? 0);

    const totalOutcome = (): "safe" | "close" | "scammed" => {
        const badChoices = allChoices.filter((c) => c.option.riskDelta > 0).length;
        if (badChoices >= 4) return "scammed";
        if (badChoices >= 2) return "close";
        return "safe";
    };

    return (
        <main className="min-h-screen bg-[#0f172a] text-[#e2e8f0] font-mono relative overflow-hidden">
            <nav className="sticky top-0 z-50 border-b border-cyan-400/20 bg-[#0f172a]">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-wider group">
                        <Terminal className="text-neon-green group-hover:animate-pulse" />
                        <span>Cyber<span className="text-neon-green">Shield</span> 360</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/puzzles" className="text-sm text-[#94a3b8] hover:text-cyan-400 transition-colors">← Puzzle Hub</Link>
                        <AccountScoreBar />
                    </div>
                </div>
            </nav>

            <div className="mx-auto max-w-2xl px-6 py-12">

                {/* START */}
                {gameState === "start" && (
                    <div className="text-center">
                        <MessageSquareWarning size={48} className="text-cyan-400 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold mb-3">Chat Scam <span className="text-cyan-400">Simulator</span></h1>
                        <p className="text-[#94a3b8] mb-8 text-sm max-w-md mx-auto leading-relaxed">
                            Navigate 6 realistic scam conversations across WhatsApp, SMS, and Instagram. Your choices determine whether you stay safe or get scammed.
                        </p>
                        <div className="grid grid-cols-3 gap-3 mb-10 text-xs">
                            {scenarios.map((s) => (
                                <div key={s.id} className="rounded-lg border border-slate-700 bg-[#1e293b] p-3">
                                    <div className={`font-bold mb-1 ${s.platformColor}`}>{s.platform}</div>
                                    <div className="text-[#94a3b8]">{s.title}</div>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setGameState("playing")}
                            className="px-8 py-3 rounded-lg border border-cyan-400/50 bg-cyan-400/10 text-cyan-400 font-bold hover:bg-cyan-400/20 transition-colors"
                        >
                            [ START SCENARIOS ]
                        </button>
                    </div>
                )}

                {/* PLAYING */}
                {gameState === "playing" && scenario && (
                    <div>
                        {/* Scenario header */}
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <div className={`text-xs tracking-widest ${scenario.platformColor}`}>{scenario.platform}</div>
                                <div className="text-sm font-bold">{scenario.contactName}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-[#64748b]">
                                    SCENARIO {scenarioIndex + 1} / {scenarios.length}
                                </div>
                                {step?.type === "decision" && !showFeedback && (
                                    <div className="mt-1 inline-flex items-center gap-1 text-xs text-cyan-400">
                                        <Clock3 size={12} />
                                        {decisionTimeLeft}s
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chat window */}
                        <div className="rounded-xl border border-slate-700 bg-[#1e293b] overflow-hidden mb-4" style={{ minHeight: 200 }}>
                            <div className={`px-4 py-3 border-b border-slate-700 text-xs font-bold ${scenario.platformColor}`}>
                                {scenario.platform} — {scenario.contactName}
                            </div>
                            <div className="p-4 space-y-3 min-h-[200px]">
                                {/* Show all previous steps' messages */}
                                {scenario.steps.slice(0, stepIndex).map((s, si) =>
                                    s.type === "messages"
                                        ? s.messages?.map((m, mi) => (
                                            <ChatBubble key={`${si}-${mi}`} msg={m} />
                                        ))
                                        : null
                                )}
                                {/* Show current step messages up to visibleMessages */}
                                {step?.type === "messages" &&
                                    step.messages?.slice(0, visibleMessages).map((m, mi) => (
                                        <ChatBubble key={`cur-${mi}`} msg={m} />
                                    ))
                                }
                                {step?.type === "messages" && !messagesReady && (
                                    <div className="text-xs text-[#64748b] animate-pulse">typing...</div>
                                )}
                            </div>
                        </div>

                        {/* Feedback after choice */}
                        {showFeedback && lastFeedback && (
                            <div className="rounded-lg border border-cyan-400/30 bg-cyan-400/5 p-4 mb-4">
                                <p className="text-sm text-[#94a3b8] leading-relaxed">{lastFeedback}</p>
                                <button
                                    onClick={advanceStep}
                                    className="mt-3 flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 font-bold"
                                >
                                    Continue <ChevronRight size={14} />
                                </button>
                            </div>
                        )}

                        {/* Decision options */}
                        {step?.type === "decision" && !showFeedback && (
                            <div>
                                <div className="text-xs text-[#64748b] mb-3 tracking-widest">YOUR_RESPONSE:</div>
                                <div className="space-y-3">
                                    {step.options?.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleChoice(opt)}
                                            className="w-full text-left rounded-lg border border-slate-600 bg-[#1e293b] px-4 py-3 text-sm hover:border-cyan-400/40 hover:bg-cyan-400/5 transition-colors"
                                        >
                                            {opt.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Advance after messages shown */}
                        {step?.type === "messages" && messagesReady && !showFeedback && (
                            <button
                                onClick={advanceStep}
                                className="w-full py-3 rounded-lg border border-slate-600 text-[#94a3b8] text-sm font-bold hover:border-cyan-400/40 hover:text-cyan-400 transition-colors flex items-center justify-center gap-2"
                            >
                                Continue <ChevronRight size={14} />
                            </button>
                        )}
                    </div>
                )}

                {/* SUMMARY */}
                {gameState === "summary" && (
                    <div>
                        {(() => {
                            const outcome = totalOutcome();
                            const { title, body } = outcomeText(outcome);
                            return (
                                <div className="text-center mb-8">
                                    {outcome === "safe"
                                        ? <CheckCircle size={48} className="text-neon-green mx-auto mb-4" />
                                        : <AlertTriangle size={48} className={outcome === "scammed" ? "text-red-400 mx-auto mb-4" : "text-yellow-400 mx-auto mb-4"} />
                                    }
                                    <h1 className="text-3xl font-bold mb-3">{title}</h1>
                                    <p className="text-[#94a3b8] text-sm max-w-md mx-auto leading-relaxed">{body}</p>
                                </div>
                            );
                        })()}

                        <div className="space-y-3 mb-8">
                            <div className="text-xs text-[#64748b] tracking-widest mb-2">DECISION_REVIEW:</div>
                            {allChoices.map((c, i) => (
                                <div key={i} className={`rounded-lg border p-4 ${c.option.riskDelta > 10 ? "border-red-500/30 bg-red-500/5" : c.option.riskDelta <= 0 ? "border-neon-green/30 bg-neon-green/5" : "border-yellow-500/30 bg-yellow-500/5"}`}>
                                    <div className="text-xs text-[#64748b] mb-1">Scenario: {c.name}</div>
                                    <div className="text-sm font-bold mb-2">&ldquo;{c.option.text}&rdquo;</div>
                                    <p className="text-xs text-[#94a3b8] leading-relaxed">{c.option.feedback}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 flex-wrap">
                            <button
                                onClick={() => { setGameState("start"); setScenarioIndex(0); setStepIndex(0); setVisibleMessages(0); setRisk(0); setAllChoices([]); setLastFeedback(null); setShowFeedback(false); }}
                                className="px-6 py-3 rounded-lg border border-cyan-400/50 bg-cyan-400/10 text-cyan-400 font-bold hover:bg-cyan-400/20 transition-colors"
                            >
                                Play Again
                            </button>
                            <Link href="/puzzles" className="px-6 py-3 rounded-lg border border-slate-600 text-[#94a3b8] font-bold hover:border-cyan-400/40 hover:text-cyan-400 transition-colors">
                                Back to Hub
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

function ChatBubble({ msg }: { msg: ChatMessage }) {
    if (msg.from === "system") {
        return <div className="text-xs text-center text-[#64748b]">{msg.text}</div>;
    }
    return (
        <div className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-[80%] rounded-xl px-4 py-2 text-sm leading-relaxed ${
                    msg.from === "user"
                        ? "bg-cyan-400/20 text-[#e2e8f0] rounded-br-none"
                        : "bg-[#0f172a] text-[#94a3b8] border border-slate-700 rounded-bl-none"
                }`}
            >
                {msg.text}
            </div>
        </div>
    );
}
