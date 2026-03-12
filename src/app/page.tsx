export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-gray-100">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#" className="flex items-center gap-2 text-xl font-bold">
            <ShieldIcon />
            <span>
              Cyber<span className="text-cyan-400">Shield</span> 360
            </span>
          </a>
          <div className="hidden items-center gap-8 text-sm text-gray-400 md:flex">
            <a href="#features" className="transition hover:text-cyan-400">
              Features
            </a>
            <a href="#extension" className="transition hover:text-cyan-400">
              Extension
            </a>
            <a href="#discord" className="transition hover:text-cyan-400">
              Discord
            </a>
            <a href="#learn" className="transition hover:text-cyan-400">
              Learn
            </a>
          </div>
          <a
            href="#features"
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-cyan-400"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-20 text-center">
        {/* Background grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(6,182,212,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,.4) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Glow */}
        <div className="pointer-events-none absolute top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 text-sm text-cyan-400">
            <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            AI-Powered Cybersecurity Platform
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl">
            Cyber<span className="text-cyan-400">Shield</span>{" "}
            <span className="text-cyan-400">360</span>
          </h1>

          <p className="mx-auto mb-4 max-w-2xl text-lg text-gray-400 sm:text-xl">
            AI-Powered Cybersecurity Awareness and Protection Platform
          </p>

          <p className="mx-auto mb-10 max-w-2xl text-base text-gray-500">
            CyberShield 360 helps you stay safe online through cybersecurity
            awareness, real-time threat detection, and personal data risk
            monitoring — all in one platform.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#"
              className="group rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-black transition hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]"
            >
              Test Your Cyber IQ
              <span className="ml-2 inline-block transition group-hover:translate-x-1">
                →
              </span>
            </a>
            <a
              href="#learn"
              className="rounded-lg border border-slate-700 bg-slate-800/50 px-6 py-3 font-semibold transition hover:border-cyan-500/50 hover:bg-slate-800"
            >
              Explore Awareness Hub
            </a>
            <a
              href="#extension"
              className="rounded-lg border border-slate-700/50 px-6 py-3 text-sm text-gray-400 transition hover:border-cyan-500/30 hover:text-cyan-400"
            >
              ↓ Download Chrome Extension
            </a>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-gray-600">
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              What CyberShield 360{" "}
              <span className="text-cyan-400">Offers</span>
            </h2>
            <p className="mx-auto max-w-xl text-gray-500">
              Everything you need to understand, detect, and defend against
              modern cyber threats.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={<BookIcon />}
              title="Cybersecurity Awareness"
              description="Interactive lessons, scam examples, and guides that help you understand common cyber threats and stay one step ahead."
            />
            <FeatureCard
              icon={<BrainIcon />}
              title="Cyber IQ Test"
              description="A gamified quiz that tests your ability to recognize phishing, scams, and unsafe online behavior. Track your score and improve."
              highlighted
            />
            <FeatureCard
              icon={<ShieldCheckIcon />}
              title="Real-Time Protection"
              description="A browser extension that automatically detects suspicious websites and warns you about potential phishing or scam pages."
            />
          </div>
        </div>
      </section>

      {/* Browser Extension */}
      <section id="extension" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-[#0a0a0f]">
            <div className="grid items-center gap-8 p-8 md:grid-cols-2 md:p-12">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
                  CHROME EXTENSION
                </div>
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                  Stay Protected While You{" "}
                  <span className="text-cyan-400">Browse</span>
                </h2>
                <p className="mb-6 text-gray-400 leading-relaxed">
                  Our Chrome extension analyzes websites in real time and detects
                  phishing domains, suspicious login forms, and risky websites —
                  so you can browse with confidence.
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-black transition hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                >
                  <ChromeIcon />
                  Download Chrome Extension
                </a>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative flex h-64 w-full items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/5 to-transparent" />
                  <div
                    className="relative text-center"
                    style={{ animation: "float 3s ease-in-out infinite" }}
                  >
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                      <ShieldCheckIcon size={32} />
                    </div>
                    <p className="text-sm font-medium text-cyan-400">
                      Real-Time Scanning
                    </p>
                    <p className="text-xs text-gray-600">
                      Phishing &amp; Scam Detection
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discord Bot */}
      <section id="discord" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-[#0d0d1a] to-[#0a0a0f]">
            <div className="grid items-center gap-8 p-8 md:grid-cols-2 md:p-12">
              <div className="flex items-center justify-center md:order-1">
                <div className="relative flex h-64 w-full items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/5 to-transparent" />
                  <div
                    className="relative text-center"
                    style={{ animation: "float 3s ease-in-out infinite 0.5s" }}
                  >
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                      <DiscordIcon />
                    </div>
                    <p className="text-sm font-medium text-indigo-400">
                      CyberShield Bot
                    </p>
                    <p className="text-xs text-gray-600">
                      Tips &amp; Threat Alerts
                    </p>
                  </div>
                </div>
              </div>
              <div className="md:order-0">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400">
                  DISCORD BOT
                </div>
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                  Get Security Alerts on{" "}
                  <span className="text-indigo-400">Discord</span>
                </h2>
                <p className="mb-6 text-gray-400 leading-relaxed">
                  Invite the CyberShield Discord bot to your server. Get
                  cybersecurity tips, threat alerts, and stay updated on the
                  latest scams — right where your community hangs out.
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-400 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
                >
                  <DiscordIcon />
                  Invite Discord Bot
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cyber Awareness / Learn */}
      <section id="learn" className="px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
            AWARENESS HUB
          </div>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Learn Cybersecurity Through{" "}
            <span className="text-cyan-400">Interactive Challenges</span>
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-gray-400 leading-relaxed">
            Master cybersecurity through quizzes, phishing detection games, and
            simulated scam scenarios. Build real-world skills that keep you and
            your data safe.
          </p>

          <div className="mb-10 grid gap-4 text-left sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-cyan-500/30">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 text-lg">
                🎯
              </div>
              <h3 className="mb-1 text-sm font-semibold">Phishing Detection</h3>
              <p className="text-xs text-gray-500">
                Spot fake emails &amp; websites
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-cyan-500/30">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 text-lg">
                🧩
              </div>
              <h3 className="mb-1 text-sm font-semibold">Scam Simulations</h3>
              <p className="text-xs text-gray-500">
                Practice in safe scenarios
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-cyan-500/30">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 text-lg">
                📊
              </div>
              <h3 className="mb-1 text-sm font-semibold">Track Progress</h3>
              <p className="text-xs text-gray-500">
                Monitor your cyber skills
              </p>
            </div>
          </div>

          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-8 py-3 font-semibold text-black transition hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]"
          >
            Start Learning →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="mb-3 flex items-center gap-2 text-lg font-bold">
                <ShieldIcon />
                Cyber<span className="text-cyan-400">Shield</span> 360
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                AI-powered cybersecurity awareness and protection platform.
                Helping users stay safe online.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-300">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <a href="#features" className="transition hover:text-cyan-400">
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#extension"
                    className="transition hover:text-cyan-400"
                  >
                    Chrome Extension
                  </a>
                </li>
                <li>
                  <a href="#discord" className="transition hover:text-cyan-400">
                    Discord Bot
                  </a>
                </li>
                <li>
                  <a href="#learn" className="transition hover:text-cyan-400">
                    Awareness Hub
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-300">
                Connect
              </h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-cyan-400"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-cyan-400">
                    Discord
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-cyan-400">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-slate-800/60 pt-6 text-center text-xs text-gray-600">
            <p>
              © {new Date().getFullYear()} CyberShield 360. Built for the
              hackathon. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ─── Inline SVG Icon Components ─── */

function ShieldIcon() {
  return (
    <svg
      width="28"
      height="28"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      className="text-cyan-400"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg
      width="28"
      height="28"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg
      width="28"
      height="28"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
      <path d="M10 21h4" />
      <path d="M9 9h6" />
      <path d="M12 9v4" />
    </svg>
  );
}

function ShieldCheckIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function ChromeIcon() {
  return (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M21.17 8H12M3.95 6.06l4.5 7.79M9.54 21.94l4.5-7.79"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
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
      className={`group relative rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
        highlighted
          ? "border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-transparent shadow-[0_0_30px_rgba(6,182,212,0.1)]"
          : "border-slate-800 bg-slate-900/40 hover:border-cyan-500/20"
      }`}
      style={highlighted ? { animation: "pulse-glow 4s ease-in-out infinite" } : undefined}
    >
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
          highlighted
            ? "bg-cyan-500/20 text-cyan-400"
            : "bg-slate-800 text-gray-400 group-hover:text-cyan-400"
        } transition`}
      >
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-500">{description}</p>
    </div>
  );
}
