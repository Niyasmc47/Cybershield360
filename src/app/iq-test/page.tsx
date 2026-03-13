"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MailWarning, ShieldAlert, MonitorCheck, HardDrive, Wifi, Fingerprint, Lock, ShieldCheck, Database, RefreshCw } from "lucide-react";
import AccountScoreBar from "@/components/account-score-bar";
import { addTotalScore, getUser, syncScoreToDb } from "@/lib/session";

// --- Types ---
type GameState = "intro" | "playing" | "result";

interface Question {
    id: number;
    text: string;
    options: {
        label: string;
        text: string;
        isCorrect: boolean;
    }[];
    threatLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    icon: React.ReactNode;
    category: string;
}

// --- Questions Database ---
const QUESTIONS: Question[] = [
    {
        id: 1,
        category: "PHISHING ALERT",
        threatLevel: "LOW",
        icon: <MailWarning className="text-blue-400" size={24} />,
        text: "You receive an email claiming to be from your bank asking you to 'verify your account.' The link looks slightly off. What do you do?",
        options: [
            { label: "A", text: "Click the link and verify your account", isCorrect: false },
            { label: "B", text: "Report the email as phishing and delete it", isCorrect: true },
            { label: "C", text: "Reply asking for more information", isCorrect: false },
        ],
    },
    {
        id: 2,
        category: "MALWARE DETECTED",
        threatLevel: "HIGH",
        icon: <ShieldAlert className="text-red-400" size={24} />,
        text: "Your computer suddenly slows down dramatically and unknown pop-ups start appearing, even when the browser is closed. What is the immediate first step?",
        options: [
            { label: "A", text: "Disconnect the device from the internet network", isCorrect: true },
            { label: "B", text: "Click the pop-ups to see what they want you to download", isCorrect: false },
            { label: "C", text: "Restart the computer normally", isCorrect: false },
        ],
    },
    {
        id: 3,
        category: "PASSWORD SECURITY",
        threatLevel: "MEDIUM",
        icon: <Lock className="text-yellow-400" size={24} />,
        text: "Which of the following is considered the most secure way to manage credentials across multiple accounts?",
        options: [
            { label: "A", text: "Using one highly complex password for every site", isCorrect: false },
            { label: "B", text: "Writing them down in a physical notebook hidden in a desk", isCorrect: false },
            { label: "C", text: "Using a dedicated Password Manager with Multi-Factor Authentication", isCorrect: true },
        ],
    },
    {
        id: 4,
        category: "NETWORK INTRUSION",
        threatLevel: "CRITICAL",
        icon: <Wifi className="text-rose-500" size={24} />,
        text: "You are working remotely from a coffee shop with Public Wi-Fi. You need to access a sensitive company database. How should you proceed?",
        options: [
            { label: "A", text: "Connect to the Public Wi-Fi normally; it has a password on the wall", isCorrect: false },
            { label: "B", text: "Connect using a verified Virtual Private Network (VPN)", isCorrect: true },
            { label: "C", text: "Use the browser's Incognito mode so the traffic isn't saved", isCorrect: false },
        ],
    },
    {
        id: 5,
        category: "SOCIAL ENGINEERING",
        threatLevel: "MEDIUM",
        icon: <Fingerprint className="text-orange-400" size={24} />,
        text: "Someone dressed as an IT technician walks into your office and asks to use your unlocked terminal to 'run a quick diagnostic update'. What do you do?",
        options: [
            { label: "A", text: "Lock the terminal and ask to see their verified badge/authorization", isCorrect: true },
            { label: "B", text: "Step aside and let them run the update, as keeping systems updated is important", isCorrect: false },
            { label: "C", text: "Ask them what department they are from before letting them on", isCorrect: false },
        ],
    },
    {
        id: 6,
        category: "DATA BACKUP",
        threatLevel: "LOW",
        icon: <HardDrive className="text-green-400" size={24} />,
        text: "What does the 3-2-1 rule refer to in the context of data backups?",
        options: [
            { label: "A", text: "3 backups, 2 days a week, 1 cloud provider", isCorrect: false },
            { label: "B", text: "3 copies of data, 2 different media types, 1 offsite/offline copy", isCorrect: true },
            { label: "C", text: "3 passwords, 2-factor authentication, 1 admin account", isCorrect: false },
        ],
    },
    {
        id: 7,
        category: "DEVICE SECURITY",
        threatLevel: "MEDIUM",
        icon: <MonitorCheck className="text-cyan-400" size={24} />,
        text: "You find a USB drive labeled 'Q3 Salary Bonuses' in the company parking lot. What is the safest action?",
        options: [
            { label: "A", text: "Plug it into a spare computer to see who it belongs to", isCorrect: false },
            { label: "B", text: "Plug it into your main work terminal but do not open any files", isCorrect: false },
            { label: "C", text: "Hand it directly to the IT or Security department without plugging it in", isCorrect: true },
        ],
    },
    {
        id: 8,
        category: "AUTHENTICATION PROTOCOL",
        threatLevel: "HIGH",
        icon: <ShieldCheck className="text-purple-400" size={24} />,
        text: "Which of these forms of Multi-Factor Authentication (MFA) is generally considered the most resistant to interception (Man-in-the-Middle attacks)?",
        options: [
            { label: "A", text: "SMS Text Message Codes", isCorrect: false },
            { label: "B", text: "Physical Hardware Security Keys (e.g., YubiKey)", isCorrect: true },
            { label: "C", text: "Email Verification links", isCorrect: false },
        ],
    },
    {
        id: 9,
        category: "SOFTWARE COMPROMISE",
        threatLevel: "CRITICAL",
        icon: <Database className="text-rose-500" size={24} />,
        text: "A zero-day vulnerability refers to:",
        options: [
            { label: "A", text: "A flaw unknown to the software creator, meaning there are zero days to fix it before exploitation", isCorrect: true },
            { label: "B", text: "A virus that deletes all your data in zero days", isCorrect: false },
            { label: "C", text: "A patching cycle that occurs at midnight (zero hour)", isCorrect: false },
        ],
    },
    {
        id: 10,
        category: "INCIDENT RESPONSE",
        threatLevel: "HIGH",
        icon: <ShieldAlert className="text-red-500" size={24} />,
        text: "You accidentally click a suspicious link in an email and a file begins downloading. What is your immediate response?",
        options: [
            { label: "A", text: "Wait to see if the antivirus catches it", isCorrect: false },
            { label: "B", text: "Delete the file, empty the recycle bin, and keep working", isCorrect: false },
            { label: "C", text: "Disconnect from the network immediately and report to IT/Security", isCorrect: true },
        ],
    },
    {
        id: 11,
        category: "DATA ENCRYPTION",
        threatLevel: "MEDIUM",
        icon: <Lock className="text-yellow-400" size={24} />,
        text: "You are setting up a Wi-Fi router for your home office. Which encryption standard should you choose for the best security?",
        options: [
            { label: "A", text: "WEP", isCorrect: false },
            { label: "B", text: "WPA2 or WPA3", isCorrect: true },
            { label: "C", text: "No encryption / Open Network", isCorrect: false },
        ],
    },
    {
        id: 12,
        category: "PHISHING ALERT",
        threatLevel: "HIGH",
        icon: <MailWarning className="text-blue-400" size={24} />,
        text: "You receive a text message from a known delivery service saying your package is delayed, with a link to 'reschedule delivery'. You recently ordered a package. Choose the safest action:",
        options: [
            { label: "A", text: "Click the link immediately to check the status", isCorrect: false },
            { label: "B", text: "Go directly to the delivery service's official app or website and track the original tracking number", isCorrect: true },
            { label: "C", text: "Reply to the text asking for more details", isCorrect: false },
        ],
    },
    {
        id: 13,
        category: "ENDPOINT SECURITY",
        threatLevel: "MEDIUM",
        icon: <MonitorCheck className="text-cyan-400" size={24} />,
        text: "Why is it important to keep your operating system and software updated?",
        options: [
            { label: "A", text: "Updates patch known security vulnerabilities that hackers can exploit", isCorrect: true },
            { label: "B", text: "Updates prevent the computer from running out of storage space", isCorrect: false },
            { label: "C", text: "Updates ensure the computer runs silently", isCorrect: false },
        ],
    },
    {
        id: 14,
        category: "CLOUD SECURITY",
        threatLevel: "HIGH",
        icon: <Database className="text-rose-500" size={24} />,
        text: "When sharing a sensitive document via a cloud service (like Google Drive or OneDrive), what is the most secure sharing setting?",
        options: [
            { label: "A", text: "Anyone with the link can view", isCorrect: false },
            { label: "B", text: "Anyone with the link can edit", isCorrect: false },
            { label: "C", text: "Restricted access to specific email addresses only", isCorrect: true },
        ],
    },
    {
        id: 15,
        category: "PHYSICAL SECURITY",
        threatLevel: "LOW",
        icon: <Lock className="text-green-400" size={24} />,
        text: "You are stepping away from your desk for a quick coffee break. Your computer is fully logged in to sensitive systems. What should you do?",
        options: [
            { label: "A", text: "Leave it as is; it's only a quick break", isCorrect: false },
            { label: "B", text: "Lock your computer screen (e.g., Win+L or Cmd+Ctrl+Q)", isCorrect: true },
            { label: "C", text: "Turn off the monitor, so it looks like it's off", isCorrect: false },
        ],
    },
    {
        id: 16,
        category: "PASSWORD SECURITY",
        threatLevel: "MEDIUM",
        icon: <Lock className="text-yellow-400" size={24} />,
        text: "Which of these is the defining characteristic of a 'dictionary attack'?",
        options: [
            { label: "A", text: "Hackers manually guess your password based on your social media", isCorrect: false },
            { label: "B", text: "An automated program tries every word in a database/dictionary to guess your password", isCorrect: true },
            { label: "C", text: "A hacker intercepts a password while it's being sent over a network", isCorrect: false },
        ],
    },
    {
        id: 17,
        category: "MALWARE DETECTED",
        threatLevel: "HIGH",
        icon: <ShieldAlert className="text-red-400" size={24} />,
        text: "What is 'Ransomware'?",
        options: [
            { label: "A", text: "A virus that physically damages computer hardware", isCorrect: false },
            { label: "B", text: "Malware that encrypts your files and demands payment for the decryption key", isCorrect: true },
            { label: "C", text: "A program that secretly records your keystrokes", isCorrect: false },
        ],
    },
    {
        id: 18,
        category: "SOCIAL ENGINEERING",
        threatLevel: "CRITICAL",
        icon: <Fingerprint className="text-orange-400" size={24} />,
        text: "What is 'Spear Phishing'?",
        options: [
            { label: "A", text: "A mass email sent to thousands of random people", isCorrect: false },
            { label: "B", text: "A highly targeted phishing attack aimed at a specific individual or organization using personalized information", isCorrect: true },
            { label: "C", text: "A physical attack involving theft of computer hardware", isCorrect: false },
        ],
    },
    {
        id: 19,
        category: "NETWORK SECURITY",
        threatLevel: "MEDIUM",
        icon: <Wifi className="text-cyan-400" size={24} />,
        text: "What is the primary function of a Firewall?",
        options: [
            { label: "A", text: "To increase internet speed", isCorrect: false },
            { label: "B", text: "To monitor and control incoming and outgoing network traffic based on security rules", isCorrect: true },
            { label: "C", text: "To permanently store backup data", isCorrect: false },
        ],
    },
    {
        id: 20,
        category: "AUTHENTICATION PROTOCOL",
        threatLevel: "LOW",
        icon: <ShieldCheck className="text-purple-400" size={24} />,
        text: "What is 'Single Sign-On' (SSO)?",
        options: [
            { label: "A", text: "An authentication property that allows a user to access multiple applications with one set of login credentials", isCorrect: true },
            { label: "B", text: "A security measure where you must sign in once every 24 hours", isCorrect: false },
            { label: "C", text: "Using the same password for all accounts without a management tool", isCorrect: false },
        ],
    },
    {
        id: 21,
        category: "DATA PROTECTION",
        threatLevel: "HIGH",
        icon: <HardDrive className="text-green-400" size={24} />,
        text: "What does PII stand for in the context of data security?",
        options: [
            { label: "A", text: "Public Internet Information", isCorrect: false },
            { label: "B", text: "Personally Identifiable Information", isCorrect: true },
            { label: "C", text: "Private internal Infrastructure", isCorrect: false },
        ],
    },
    {
        id: 22,
        category: "SOCIAL ENGINEERING",
        threatLevel: "MEDIUM",
        icon: <Fingerprint className="text-orange-400" size={24} />,
        text: "What is 'Tailgating' in physical security terms?",
        options: [
            { label: "A", text: "Following closely behind an authorized person into a restricted area without proper authentication", isCorrect: true },
            { label: "B", text: "Using someone else's computer while they are actively typing", isCorrect: false },
            { label: "C", text: "Tracking a user's location via their mobile device", isCorrect: false },
        ],
    },
    {
        id: 23,
        category: "SOFTWARE SECURITY",
        threatLevel: "CRITICAL",
        icon: <Database className="text-rose-500" size={24} />,
        text: "What is a 'Botnet'?",
        options: [
            { label: "A", text: "A harmless network of automated chatbots", isCorrect: false },
            { label: "B", text: "A network of private computers infected with malicious software and controlled as a group without the owners' knowledge", isCorrect: true },
            { label: "C", text: "A dedicated server used for storing secure passwords", isCorrect: false },
        ],
    },
    {
        id: 24,
        category: "BROWSER SECURITY",
        threatLevel: "LOW",
        icon: <MonitorCheck className="text-cyan-400" size={24} />,
        text: "What does the 's' in HTTPS stand for when viewing a website URL?",
        options: [
            { label: "A", text: "System", isCorrect: false },
            { label: "B", text: "Server", isCorrect: false },
            { label: "C", text: "Secure", isCorrect: true },
        ],
    },
    {
        id: 25,
        category: "INCIDENT RESPONSE",
        threatLevel: "MEDIUM",
        icon: <ShieldAlert className="text-red-500" size={24} />,
        text: "If you suspect your work email password has been compromised, what is the best first step?",
        options: [
            { label: "A", text: "Change the password immediately from a secure device", isCorrect: true },
            { label: "B", text: "Send an email to all your contacts warning them", isCorrect: false },
            { label: "C", text: "Wait to see if any unauthorized emails are sent", isCorrect: false },
        ],
    }
];

const TIME_PER_QUESTION = 30;

export default function CyberIQTest() {
    const [gameState, setGameState] = useState<GameState>("intro");
    const [codename, setCodename] = useState("");
    const [sessionUsername, setSessionUsername] = useState("");
    const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
    const [scoreRecorded, setScoreRecorded] = useState(false);

    useEffect(() => {
        const syncUser = () => {
            const username = getUser()?.username || "";
            setSessionUsername(username);
            if (username) {
                setCodename(username);
            }
        };

        syncUser();
        window.addEventListener("storage", syncUser);
        window.addEventListener("cybershield-session-updated", syncUser);

        return () => {
            window.removeEventListener("storage", syncUser);
            window.removeEventListener("cybershield-session-updated", syncUser);
        };
    }, []);

    const displayName = (sessionUsername || codename).trim();

    // Timer Effect
    useEffect(() => {
        if (gameState !== "playing") return;

        if (timeLeft <= 0) {
            handleAnswer(false); // Time out counts as wrong
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, gameState]);

    const handleStart = (e: React.FormEvent) => {
        e.preventDefault();
        if (!displayName) return;

        // Select 10 random questions from the pool
        const shuffled = [...QUESTIONS].sort(() => 0.5 - Math.random());
        const selected10 = shuffled.slice(0, 10);

        setActiveQuestions(selected10);
        setGameState("playing");
        setCurrentIdx(0);
        setScore(0);
        setTimeLeft(TIME_PER_QUESTION);
    };

    const handleAnswer = (isCorrect: boolean) => {
        if (isCorrect) setScore((prev) => prev + 1);

        const nextIdx = currentIdx + 1;
        if (nextIdx < activeQuestions.length) {
            setCurrentIdx(nextIdx);
            setTimeLeft(TIME_PER_QUESTION);
        } else {
            setGameState("result");
        }
    };

    const handleRestart = () => {
        setGameState("intro");
        setCodename(sessionUsername || "");
        setScoreRecorded(false);
    };

    useEffect(() => {
        if (gameState === "result" && !scoreRecorded) {
            addTotalScore(score);
            syncScoreToDb();
            setScoreRecorded(true);
        }
    }, [gameState, score, scoreRecorded]);

    const getRank = () => {
        if (score === 10) return "ELITE CYBER COMMANDER";
        if (score >= 7) return "ADVANCED ANALYST";
        if (score >= 4) return "SECURITY SPECIALIST";
        return "CYBER ROOKIE";
    };

    // --- Render intro ---
    if (gameState === "intro") {
        return (
            <main className="min-h-screen bg-[#0f172a] text-[#e2e8f0] font-mono flex flex-col items-center justify-center p-6 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05),transparent_50%)] pointer-events-none" />
                <div className="absolute top-6 right-6 z-20">
                    <AccountScoreBar />
                </div>

                <div className="max-w-md w-full border border-cyan-500/30 bg-[#1e293b]/80 p-8 rounded shadow-[0_0_30px_rgba(6,182,212,0.1)] relative z-10">
                    <div className="mb-6 flex justify-center">
                        <ShieldCheck size={48} className="text-cyan-400 animate-pulse" />
                    </div>
                    <h1 className="text-2xl font-bold text-center text-cyan-400 mb-2">CYBER IQ EVALUATION</h1>
                    <p className="text-xs text-slate-400 text-center mb-8 border-b border-slate-700 pb-4">
                        Initialize test sequence. 10 simulated threat scenarios.
                    </p>

                    <form onSubmit={handleStart} className="space-y-6">
                        {sessionUsername ? (
                            <div className="rounded border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
                                Logged in as <span className="font-bold text-cyan-300">{sessionUsername}</span>
                            </div>
                        ) : (
                            <div>
                                <label htmlFor="codename" className="block text-xs text-cyan-500 mb-2 tracking-widest">ENTER CYBER CODENAME</label>
                                <input
                                    id="codename"
                                    type="text"
                                    autoFocus
                                    required
                                    maxLength={20}
                                    value={codename}
                                    onChange={(e) => setCodename(e.target.value)}
                                    className="w-full bg-[#0f172a] border border-cyan-500/50 rounded px-4 py-3 text-cyan-100 outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all font-mono"
                                    placeholder="e.g. Neo, Trinity, ZeroCool..."
                                />
                            </div>
                        )}
                        <button
                            type="submit"
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]"
                        >
                            [ START_MISSION ]
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/" className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">
                            {"<-"} ABORT SEQUENCE (RETURN HOME)
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    // --- Render Result ---
    if (gameState === "result") {
        return (
            <main className="min-h-screen bg-[#0f172a] text-[#e2e8f0] font-mono flex flex-col items-center justify-center p-6 relative">
                <div className="absolute top-6 right-6 z-20">
                    <AccountScoreBar />
                </div>
                <div className="max-w-md w-full border border-neon-green/30 bg-[#1e293b]/80 p-8 rounded shadow-[0_0_30px_rgba(13,242,89,0.1)] relative z-10 text-center">
                    <h2 className="text-neon-green text-sm tracking-widest mb-2">EVALUATION COMPLETE</h2>
                    <h1 className="text-3xl font-bold text-white mb-6">OP. {displayName.toUpperCase()}</h1>

                    <div className="py-6 border-y border-slate-700 mb-6">
                        <div className="text-6xl font-black text-neon-green text-shadow-[0_0_20px_rgba(13,242,89,0.4)] mb-2">
                            {score} <span className="text-2xl text-slate-500">/ 10</span>
                        </div>
                        <p className="text-xs text-slate-400 tracking-wider">THREATS NEUTRALIZED</p>
                    </div>

                    <div className="mb-8">
                        <p className="text-xs text-slate-500 mb-1">ASSIGNED RANKING:</p>
                        <p className="text-lg font-bold text-cyan-400 uppercase tracking-widest shadow-cyan-400/50 drop-shadow-md">{getRank()}</p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleRestart}
                            className="w-full border border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-400 font-bold py-3 rounded transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={16} /> RESTART_SIMULATION
                        </button>
                        <Link
                            href="/"
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded transition-colors block text-center border border-slate-600"
                        >
                            RETURN TO DASHBOARD
                        </Link>
                    </div>
                </div>
            </main>
        )
    }

    // --- Render Playing ---
    const q = activeQuestions[currentIdx];

    return (
        <main className="min-h-screen bg-[#0f172a] text-[#e2e8f0] font-mono flex flex-col">
            {/* Top HUD */}
            <header className="px-6 py-4 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h1 className="text-cyan-400 font-bold tracking-widest text-lg md:text-xl drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">MISSION ACTIVE</h1>
                        <p className="text-xs text-cyan-600 mt-1">Defender Mode: <span className="text-cyan-300">{displayName.toUpperCase()}</span></p>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="text-right">
                            <p className="text-xs text-slate-400">Score</p>
                            <p className="text-2xl font-bold text-neon-green">{score}</p>
                        </div>
                        <AccountScoreBar />
                    </div>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full bg-slate-800 h-1 mt-2">
                    <div
                        className="bg-gradient-to-r from-cyan-500 to-neon-green h-full transition-all duration-300 ease-out"
                        style={{ width: `${((currentIdx) / activeQuestions.length) * 100}%` }}
                    />
                </div>
                <p className="text-[10px] text-slate-500 mt-2">{currentIdx + 1} / {activeQuestions.length} Threats Encountered</p>
            </header>

            {/* Main Quiz Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full">

                {/* Threat Header Card */}
                <div className="w-full max-w-2xl border border-blue-500/40 bg-blue-950/20 p-6 rounded relative mb-8 flex flex-col items-center text-center shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                    {/* Decorative Corner Borders */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-400"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-blue-400"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-blue-400"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-400"></div>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-white p-1">
                            {q.icon}
                        </div>
                        <div className="text-left">
                            <h2 className="text-xl font-bold text-blue-400 tracking-wider shadow-blue-400/50 drop-shadow-sm">{q.category}</h2>
                            <p className="text-xs text-slate-400">THREAT LEVEL: <span className={q.threatLevel === 'CRITICAL' || q.threatLevel === 'HIGH' ? 'text-red-400' : 'text-slate-300'}>{q.threatLevel}</span></p>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 bg-black/50 border border-slate-700 rounded-full px-4 py-1">
                        <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></span>
                        <span className={`font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-neon-green'}`}>{timeLeft}s</span>
                    </div>
                </div>

                {/* Question Text */}
                <h3 className="text-sm md:text-base text-slate-300 max-w-2xl text-left mb-8 leading-relaxed">
                    {q.text}
                </h3>

                {/* Options */}
                <div className="w-full max-w-2xl space-y-4">
                    {q.options.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => handleAnswer(opt.isCorrect)}
                            className="w-full flex items-center text-left p-4 border border-blue-900 bg-[#162032] hover:bg-[#1e2b42] hover:border-blue-500/50 transition-all group"
                        >
                            <span className="text-neon-green font-bold mr-4 text-lg w-6 flex-shrink-0">{opt.label}</span>
                            <span className="text-sm text-slate-400 group-hover:text-blue-300 transition-colors">{opt.text}</span>
                        </button>
                    ))}
                </div>

            </div>

            {/* Bottom Nav */}
            <footer className="p-6">
                <Link href="/" className="inline-flex bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-400 text-xs px-6 py-3 transition-colors">
                    Back to Home
                </Link>
            </footer>

        </main>
    );
}
