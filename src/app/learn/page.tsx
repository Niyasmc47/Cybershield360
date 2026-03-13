"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldAlert, ServerCrash, KeyRound, Wifi, Smartphone, MailWarning, Terminal, ShieldCheck, Youtube, X, ZoomIn } from "lucide-react";
import AccountScoreBar from "@/components/account-score-bar";

export default function AwarenessHub() {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setExpandedId(null); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const topics = [
        {
            id: "phishing",
            title: "Phishing",
            icon: <MailWarning className="h-6 w-6 text-neon-green" />,
            description: "Deceptive communications disguised as legitimate entities to steal sensitive data.",
            image: "/images/phishing-example.jpg",
            videoUrl: "https://youtu.be/Y7zNlEMDmI4?si=NgykKyvEYg8Qsj6g",
            details: [
                "Analyzes urgent requests for passwords or financial info.",
                "Detects fake login pages spoofing legitimate domains.",
                "Identifies spear-phishing targeting specific individuals."
            ],
            prevention: "> VERIFY SENDER DNS RECORDS.\n> ALWAYS INSPECT URL STRINGS.\n> IMPLEMENT HARDWARE 2FA.",
            stat: { value: "3.4 billion", label: "phishing emails sent every single day worldwide" },
            redFlags: [
                "Email address domain doesn't match the company name",
                "Generic greeting like 'Dear Customer' instead of your real name",
                "Urgent language — 'Act within 24 hours or your account will be closed'",
                "Links that show a different URL when you hover over them",
                "Requests for passwords, card numbers, or personal info via email",
            ],
            realWorldExample: {
                title: "Google & Facebook Wire Fraud (2013–2015)",
                body: "Lithuanian hacker Evaldas Rimasauskas sent fake invoices impersonating Quanta Computer — a real supplier used by both companies. Over two years, he tricked employees into wiring $123 million. Both companies eventually recovered the funds, but only after FBI intervention. The attack used nothing more than convincing email formatting and business knowledge."
            }
        },
        {
            id: "ddos",
            title: "DDoS Attacks",
            icon: <ServerCrash className="h-6 w-6 text-neon-green" />,
            description: "Overwhelming a server or network with traffic to make it unavailable.",
            image: "/images/ddos-example.jpg",
            videoUrl: "https://www.youtube.com/watch?v=z5nc9KMcGEc",
            details: [
                "Involves decentralized botnets sending massive traffic volumes.",
                "Targets Layer 7 APIs or volumetric network layers.",
                "Often deployed as a smokescreen for data exfiltration."
            ],
            prevention: "> DEPLOY CONTENT DELIVERY NETWORKS (CDNs).\n> ENACT STRICT RATE LIMITING.\n> UTILIZE DDOS MITIGATION SHIELDS.",
            stat: { value: "17 million+", label: "DDoS attacks recorded in 2020 alone (NETSCOUT)" },
            redFlags: [
                "Sudden extreme slowdown of a website or service for all users",
                "Specific pages or endpoints become unreachable without warning",
                "Massive spike in inbound traffic from unknown or distributed IPs",
                "Server logs show thousands of identical repeated requests",
                "Attack often coincides with a ransom demand or political event",
            ],
            realWorldExample: {
                title: "GitHub DDoS Attack (2018)",
                body: "In February 2018, GitHub was hit with a peak of 1.35 terabits per second of traffic — the largest DDoS attack ever recorded at the time. Attackers exploited misconfigured Memcached servers to amplify traffic by a factor of 51,000x. GitHub was fully offline for 10 minutes before Akamai's DDoS mitigation service absorbed the attack."
            }
        },
        {
            id: "ransomware",
            title: "Ransomware",
            icon: <ShieldAlert className="h-6 w-6 text-neon-green" />,
            description: "Malicious software that encrypts your files or locks your device until a ransom is paid.",
            image: "/images/ransomware-example.jpg",
            videoUrl: "https://www.youtube.com/watch?v=7GrmoIhmLqQ",
            details: [
                "Executes AES-256 encryption on target file directories.",
                "Spreads autonomously across internal network via zero-day exploits.",
                "Ransom payment yields no decryption guarantee."
            ],
            prevention: "> MAINTAIN ISOLATED OFFLINE BACKUPS.\n> KEEP OS/AV SIGNATURES UPDATED.\n> DISABLE RDP EXPOSURE.",
            stat: { value: "$1.1 billion", label: "paid in ransomware ransoms globally in 2023 (Chainalysis)" },
            redFlags: [
                "Files suddenly renamed with a strange extension (e.g. .locked, .encrypted)",
                "Desktop wallpaper replaced with a ransom note",
                "A text or HTML ransom demand file appearing in every folder",
                "Antivirus suddenly disabled or uninstalled without your action",
                "Unusual CPU, disk, or network activity from unknown processes",
            ],
            realWorldExample: {
                title: "WannaCry Global Attack (2017)",
                body: "WannaCry ransomware spread to over 200,000 computers in 150 countries in a single day, exploiting a Windows vulnerability called EternalBlue — originally developed by the NSA and later leaked. The UK's NHS was severely impacted: thousands of appointments and operations were cancelled as systems went offline. Total global damages exceeded £6 billion."
            }
        },
        {
            id: "social-engineering",
            title: "Social Engineering",
            icon: <Smartphone className="h-6 w-6 text-neon-green" />,
            description: "Psychological manipulation tricking users into making security mistakes or giving away sensitive info.",
            image: "/images/social-engineering-example.jpg",
            videoUrl: "https://www.youtube.com/watch?v=XQzve15YdWM",
            details: [
                "Baiting: Deploying infected USB drives in physical locations.",
                "Pretexting: Fabricated IT support or authority scenarios.",
                "Tailgating: Bypassing physical security via authorized personnel."
            ],
            prevention: "> VERIFY ALL AUTHORITY CLAIMS.\n> IMPLEMENT ZERO-TRUST PROTOCOLS.\n> ENACT STRICT PHYSICAL ACCESS POLICIES.",
            stat: { value: "98%", label: "of cyberattacks rely on social engineering at some stage (Purplesec)" },
            redFlags: [
                "Caller or emailer creates urgency — 'We need this now or the account closes'",
                "Request comes via an unexpected channel (WhatsApp, personal email)",
                "Someone claims authority but can't verify their identity through official channels",
                "You're asked to bypass normal procedures 'just this once'",
                "Someone follows you into a secure area without badging in",
            ],
            realWorldExample: {
                title: "Twitter Bitcoin Scam (2020)",
                body: "Attackers used phone-based social engineering to convince Twitter employees to hand over admin credentials. Once inside, they hijacked the accounts of Barack Obama, Elon Musk, Apple, Jeff Bezos, and others — posting fake Bitcoin giveaway messages. The attackers collected over $120,000 in Bitcoin within hours. The breach was entirely human, not technical."
            }
        },
        {
            id: "pwd-attacks",
            title: "Password Attacks",
            icon: <KeyRound className="h-6 w-6 text-neon-green" />,
            description: "Automated methods used by threat actors to compromise authentication portals.",
            image: "/images/password-attacks-example.jpg",
            videoUrl: "https://www.youtube.com/watch?v=1xmROGFzLLg",
            details: [
                "Brute Force: High-speed permutation testing.",
                "Dictionary Attack: Iterating through known breached credential lists.",
                "Credential Stuffing: Reusing stolen hashes across diverse endpoints."
            ],
            prevention: "> ENFORCE 16+ CHAR ENTROPY COMPLEXITY.\n> UTILIZE SECURE HASH VAULTS (PWD MANAGERS).\n> MANDATE MFA ACROSS ALL NODES.",
            stat: { value: "24 billion", label: "username/password combos available on dark web markets in 2022" },
            redFlags: [
                "Login notifications from unfamiliar locations or devices",
                "Account locked out after you didn't attempt to log in",
                "Password reset emails you didn't request",
                "Unfamiliar activity in account logs or sent items",
                "Security question answers changed without your knowledge",
            ],
            realWorldExample: {
                title: "RockYou2021 Credential Dump",
                body: "In June 2021, a file containing 8.4 billion plaintext passwords was posted on a popular hacker forum — the largest credential leak ever recorded. Named after the original RockYou breach, it compiled years of prior leaks into a single masterlists used for credential stuffing attacks. Any account reusing a previously leaked password was immediately at risk."
            }
        },
        {
            id: "mitm",
            title: "Man-In-The-Middle",
            icon: <Wifi className="h-6 w-6 text-neon-green" />,
            description: "Covert interception and potential alteration of communication pathways between two nodes.",
            image: "/images/mitm-example.jpg",
            videoUrl: "https://youtu.be/83LOa-dYi_A?si=2LH6pZP34T-X33SX",
            details: [
                "Dominant vector on unsecured / public 802.11 networks.",
                "Facilitates session cookie theft and payload injection.",
                "Relies on ARP spoofing or rogue access points."
            ],
            prevention: "> ENCRYPT TUNNELS VIA VPN.\n> MANDATE HSTS (HTTP STRICT TRANSPORT SECURITY).\n> VERIFY SSL/TLS CERTIFICATE CHAINS.",
            stat: { value: "35%", label: "of all exploitation activity involves MITM attacks (IBM X-Force)" },
            redFlags: [
                "Browser warns 'Your connection is not private' on a site you usually trust",
                "SSL certificate doesn't match the expected domain",
                "Unexpected disconnections or slowness on public Wi-Fi",
                "Browser redirects you to an HTTP version of an HTTPS site",
                "Wi-Fi access point name looks like a legitimate venue but isn't verified",
            ],
            realWorldExample: {
                title: "Superfish Adware (Lenovo, 2015)",
                body: "Lenovo pre-installed 'Superfish' software on consumer laptops that injected ads into web sessions by acting as a self-signed MITM proxy. The software installed its own root certificate, allowing it to intercept HTTPS traffic. Security researchers found that any third party could exploit the weak certificate to intercept traffic from all affected Lenovo laptops on any network."
            }
        },
        {
            id: "smishing",
            title: "SMS Scams (Smishing)",
            icon: <Smartphone className="h-6 w-6 text-neon-green" />,
            description: "Fake text messages that trick you into clicking bad links, sharing OTPs, or installing malware.",
            image: "/images/phishing-example.jpg",
            videoUrl: "https://www.youtube.com/watch?v=4QKf2o6gS3Q",
            details: [
                "Message pretends to be from a bank, courier, or government service.",
                "It creates urgency: 'Your account will be blocked today'.",
                "Link opens a fake page that steals credentials or card details."
            ],
            prevention: "> NEVER TAP UNKNOWN LINKS IN SMS.\n> VERIFY IN THE OFFICIAL APP OR WEBSITE.\n> NEVER SHARE OTP OR UPI PIN.",
            stat: { value: "67%", label: "of reported mobile fraud starts with a suspicious message or call" },
            redFlags: [
                "Shortened links (bit.ly or random URL) in urgent messages",
                "Text says your KYC/payment/account will expire immediately",
                "Unknown sender asks you to 'confirm OTP'",
                "Poor grammar but very urgent tone",
                "Message asks to install an APK or unknown app",
            ],
            realWorldExample: {
                title: "Fake Delivery SMS Campaigns",
                body: "Attackers sent package-delivery texts with tracking links. Victims opened fake courier pages and entered card details or installed malicious apps. These campaigns spread quickly because delivery alerts are common and trusted."
            }
        },
        {
            id: "vishing",
            title: "Phone Call Scams (Vishing)",
            icon: <ShieldAlert className="h-6 w-6 text-neon-green" />,
            description: "Scammers call pretending to be bank staff, police, support teams, or recruiters to pressure you into sharing secrets.",
            image: "/images/ransomware-example.jpg",
            videoUrl: "https://www.youtube.com/watch?v=4QKf2o6gS3Q",
            details: [
                "Caller claims a problem with your bank, SIM, tax, or loan account.",
                "They try to keep you on call so you panic and act fast.",
                "They ask for OTP, card CVV, remote access, or UPI approval."
            ],
            prevention: "> HANG UP AND CALL THE OFFICIAL NUMBER YOURSELF.\n> NEVER SHARE OTP, CVV, OR SCREEN ACCESS.\n> DO NOT APPROVE UNKNOWN UPI REQUESTS.",
            stat: { value: "1 call", label: "is often enough for scammers to steal account access if OTP is shared" },
            redFlags: [
                "Caller asks for OTP, PIN, CVV, or full card number",
                "Threats like 'account freeze' or 'police case today'",
                "Asks you to install AnyDesk/TeamViewer quickly",
                "Spoofed caller ID looks like your bank or support",
                "Refuses to let you disconnect and verify",
            ],
            realWorldExample: {
                title: "Fake Bank Verification Calls",
                body: "Victims received calls claiming suspicious transactions. Scammers asked for OTP 'to block fraud'. OTP was used to complete real transactions from the victim's account within minutes."
            }
        },
        {
            id: "qr-scams",
            title: "QR Code Scams (Quishing)",
            icon: <MailWarning className="h-6 w-6 text-neon-green" />,
            description: "Malicious QR codes lead to fake payment or login pages and are often pasted over genuine codes.",
            image: "/images/ddos-example.jpg",
            videoUrl: "https://www.youtube.com/watch?v=4QKf2o6gS3Q",
            details: [
                "Scammer replaces a real payment QR at shops or parking spots.",
                "You scan and pay into the attacker's account.",
                "Some QR links open phishing pages to capture passwords."
            ],
            prevention: "> CHECK PAYEE NAME BEFORE PAYMENT.\n> AVOID QR CODES FROM STICKERS OR UNKNOWN POSTS.\n> TYPE OFFICIAL WEBSITES DIRECTLY WHEN POSSIBLE.",
            stat: { value: "Rising fast", label: "QR fraud is increasing as digital payments become common" },
            redFlags: [
                "QR sticker looks pasted on top of another code",
                "Payment receiver name is unrelated to merchant",
                "QR opens a strange login page",
                "Code shared in random social posts/promotions",
                "Unexpected request to scan code for refund",
            ],
            realWorldExample: {
                title: "Parking Meter QR Fraud",
                body: "Scammers placed fake QR stickers on public parking meters. Drivers scanned and entered card details on fake payment pages, sending money and data to attackers instead of the service provider."
            }
        },
        {
            id: "shopping-job-scams",
            title: "Online Shopping & Job Scams",
            icon: <KeyRound className="h-6 w-6 text-neon-green" />,
            description: "Very common scams that use fake product offers or fake job opportunities to steal money and personal data.",
            image: "/images/phishing-example.jpg",
            videoUrl: "https://www.youtube.com/watch?v=4QKf2o6gS3Q",
            details: [
                "Too-good-to-be-true deals push advance payment.",
                "Fake recruiters ask for 'registration fees' or ID copies.",
                "After payment or data sharing, seller/recruiter disappears."
            ],
            prevention: "> USE TRUSTED MARKETPLACES AND VERIFIED RECRUITERS.\n> NEVER PAY TO GET A JOB INTERVIEW.\n> CHECK REVIEWS, DOMAIN AGE, AND COMPANY CONTACTS.",
            stat: { value: "Top category", label: "shopping and job scams are among the most reported consumer fraud types" },
            redFlags: [
                "Huge discounts with payment-only-by-bank-transfer",
                "No return policy or real customer support",
                "Job offer without interview from free email address",
                "Asks for upfront training/security deposit",
                "Pressures you to pay 'now to secure slot'",
            ],
            realWorldExample: {
                title: "Fake Work-From-Home Recruitment",
                body: "Fraud pages posted remote-job ads and sent instant offer letters. Candidates were asked to pay onboarding fees and submit identity documents. Money was lost and identity data was later reused in additional fraud attempts."
            }
        },
        {
            id: "malware",
            title: "Malware",
            icon: <ShieldAlert className="h-6 w-6 text-neon-green" />,
            description: "Malicious software designed to infiltrate, damage, or gain unauthorized access to systems without the user's knowledge.",
            image: "/images/malware-example.jpg",
            videoUrl: "https://youtu.be/NMYbkzjI5EY?si=pKqDdFhMspDpNpst",
            details: [
                "Delivered via infected email attachments, malicious downloads, or compromised websites.",
                "Operates silently in the background — stealing data, logging keystrokes, or encrypting files.",
                "Can spread laterally across networks, compromising entire organizations."
            ],
            prevention: "> KEEP OS AND SOFTWARE FULLY PATCHED AND UPDATED.\n> USE REPUTABLE ANTIVIRUS WITH REAL-TIME SCANNING.\n> NEVER RUN UNKNOWN EXECUTABLES OR MACROS.\n> RESTRICT USER PRIVILEGES — AVOID RUNNING AS ADMIN.",
            stat: { value: "560,000+", label: "new malware samples detected every single day globally (AV-TEST)" },
            redFlags: [
                "System becomes suddenly slow or unresponsive for no clear reason",
                "Unexpected pop-ups, browser redirects, or new toolbars appear",
                "Files are missing, renamed, or encrypted without your action",
                "Antivirus is disabled or cannot be updated",
                "Unknown processes using high CPU or network in Task Manager",
            ],
            realWorldExample: {
                title: "NotPetya Global Attack (2017)",
                body: "NotPetya malware initially spread via a compromised Ukrainian accounting software update. It rapidly propagated across global networks — encrypting master boot records and making machines completely unbootable. Estimated damages exceeded $10 billion, crippling shipping giant Maersk, pharma company Merck, and scores of other multinationals within hours."
            }
        }
    ];

    const activeTopicData = topics.find((t) => t.id === expandedId) ?? null;

    return (
        <main className="min-h-screen bg-background text-foreground pb-20 font-sans relative overflow-hidden">

            {/* Expanded Modal */}
            {activeTopicData && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85"
                    onClick={() => setExpandedId(null)}
                >
                    <div
                        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl border border-neon-green/40 bg-[#0f172a] shadow-[0_0_60px_rgba(13,242,89,0.15)] font-mono"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neon-green/20 bg-[#0f172a] px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="inline-flex h-10 w-10 items-center justify-center rounded border border-neon-green/30 bg-neon-green/10">
                                    {activeTopicData.icon}
                                </div>
                                <h2 className="text-xl font-bold tracking-tight text-foreground">{activeTopicData.title}</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <a
                                    href={activeTopicData.videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 rounded border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition"
                                >
                                    <Youtube size={14} />
                                    Watch Video
                                </a>
                                <button
                                    onClick={() => setExpandedId(null)}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-700 text-[#64748b] hover:border-neon-green/40 hover:text-neon-green transition"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 md:p-8 space-y-8">
                            {/* Stat callout */}
                            <div className="rounded-lg border border-neon-green/20 bg-neon-green/5 px-6 py-4 flex items-center gap-5">
                                <div className="text-3xl font-bold text-neon-green shrink-0">{activeTopicData.stat.value}</div>
                                <div className="text-sm text-secondary leading-relaxed">{activeTopicData.stat.label}</div>
                            </div>

                            {/* Description */}
                            <p className="text-base text-secondary leading-relaxed border-l-2 border-neon-green/40 pl-4">
                                {activeTopicData.description}
                            </p>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* How it works */}
                                <div>
                                    <h4 className="mb-4 text-xs font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1 h-3 bg-neon-green rounded-full" />
                                        How It Works
                                    </h4>
                                    <ul className="space-y-4">
                                        {activeTopicData.details.map((detail, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-sm text-secondary leading-relaxed">
                                                <span className="mt-0.5 text-neon-green opacity-70 shrink-0">&gt;</span>
                                                <span>{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Prevention */}
                                <div>
                                    <h4 className="mb-4 text-xs font-bold text-neon-green uppercase tracking-widest flex items-center gap-2">
                                        <ShieldCheck size={14} />
                                        How to Protect Yourself
                                    </h4>
                                    <div className="rounded border border-neon-green/30 bg-black p-5 shadow-[inset_0_0_15px_rgba(13,242,89,0.05)]">
                                        <pre className="text-neon-green/90 text-sm leading-relaxed font-mono whitespace-pre-wrap">
                                            {activeTopicData.prevention}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            {/* Red Flags */}
                            <div>
                                <h4 className="mb-4 text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
                                    Warning Signs to Watch For
                                </h4>
                                <ul className="grid sm:grid-cols-2 gap-3">
                                    {activeTopicData.redFlags.map((flag, idx) => (
                                        <li key={idx} className="flex items-start gap-3 rounded border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-secondary leading-relaxed">
                                            <span className="mt-0.5 text-red-400 shrink-0">⚑</span>
                                            <span>{flag}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Real World Example */}
                            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-6">
                                <h4 className="mb-3 text-xs font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="inline-block w-2 h-2 rounded-full bg-yellow-400" />
                                    Real-World Incident
                                </h4>
                                <div className="font-bold text-foreground mb-2">{activeTopicData.realWorldExample.title}</div>
                                <p className="text-sm text-secondary leading-relaxed">{activeTopicData.realWorldExample.body}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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

            {/* Hero Section */}
            <section className="relative px-6 pt-20 pb-16 text-center">
                <div className="pointer-events-none absolute top-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-neon-green/5 blur-[120px]" />

                <div className="relative z-10 mx-auto max-w-3xl">
                    <div className="mb-6 inline-flex items-center gap-2 rounded border border-neon-green/30 bg-neon-green/5 px-3 py-1 font-mono text-xs font-medium text-neon-green tracking-widest uppercase">
                        <span className="inline-block h-2 w-2 rounded-full bg-neon-green animate-blink" />
                        Awareness Hub
                    </div>
                    <h1 className="mb-6 font-mono text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-foreground">
                        Cyber <span className="text-neon-green">Threats</span>
                    </h1>
                    <p className="text-lg text-secondary mb-8 font-mono">
                        <span className="text-neon-green opacity-50">{">"} </span>
                        Learn the most common scams in simple terms, with clear warning signs and easy safety steps.
                    </p>

                    
                </div>
            </section>

            {/* Threat Grid */}
            <section className="px-6 relative z-10">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col gap-12 font-mono">
                        {topics.map((topic, index) => (
                            <div
                                key={topic.id}
                                onClick={() => setExpandedId(topic.id)}
                                className="group relative flex flex-col md:flex-row overflow-hidden rounded border border-slate-800 bg-surface/80 p-0 transition-colors duration-200 hover:border-neon-green/50 cursor-pointer"
                            >
                                {/* Content Section */}
                                <div className="flex flex-col p-8 md:p-10 flex-1 z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="inline-flex h-12 w-12 items-center justify-center rounded border border-neon-green/20 bg-neon-green/10 shadow-[inner_0_0_10px_rgba(13,242,89,0.1)] text-neon-green">
                                                {topic.icon}
                                            </div>
                                            <h3 className="text-2xl font-bold tracking-tighter text-foreground">{topic.title}</h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={topic.videoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-2 rounded border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500/20 hover:border-red-500/60"
                                            >
                                                <Youtube size={16} />
                                                <span className="hidden sm:inline">Watch Video</span>
                                            </a>
                                            <div className="flex items-center gap-1 rounded border border-neon-green/20 bg-neon-green/5 px-3 py-2 text-xs text-neon-green/60 group-hover:text-neon-green group-hover:border-neon-green/40 transition">
                                                <ZoomIn size={14} />
                                                <span className="hidden sm:inline ml-1">Expand</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="mb-8 text-sm text-secondary leading-relaxed border-l-2 border-neon-green/30 pl-4">{topic.description}</p>

                                    <div className="mt-auto grid md:grid-cols-2 gap-8">
                                        <div>
                                            <h4 className="mb-3 text-xs font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
                                                <span className="w-1 h-3 bg-neon-green rounded-full"></span>
                                                How It Works
                                            </h4>
                                            <ul className="space-y-3 text-secondary text-sm">
                                                {topic.details.map((detail, idx) => (
                                                    <li key={idx} className="flex items-start gap-3">
                                                        <span className="mt-1 text-neon-green opacity-70">{">"}</span>
                                                        <span className="leading-snug">{detail}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="mb-3 text-xs font-bold text-neon-green uppercase tracking-widest flex items-center gap-2">
                                                <ShieldCheck size={14} />
                                                How to Protect Yourself
                                            </h4>
                                            <div className="rounded border border-neon-green/30 bg-black p-4 h-[calc(100%-2rem)] shadow-[inset_0_0_15px_rgba(13,242,89,0.05)] overflow-x-auto">
                                                <pre className="text-neon-green/90 text-xs leading-relaxed font-mono whitespace-pre-wrap">
                                                    {topic.prevention}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
