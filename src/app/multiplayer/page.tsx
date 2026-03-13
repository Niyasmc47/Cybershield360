    "use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Terminal, Users } from "lucide-react";
import GameClient from "@/lib/game-client";
import AccountScoreBar from "@/components/account-score-bar";
import { addTotalScore, clearSession, getToken, getUser, refreshSessionFromDb, setSession, syncScoreToDb } from "@/lib/session";

type Mode = "login" | "register";

type AuthState = {
  email: string;
  password: string;
  username: string;
};

type QuestionPayload = {
  question_number: number;
  total_questions: number;
  question_text: string;
  type: string;
  options: string[];
  time_limit: number;
};

type RoomCodePayload = {
  room_code?: string;
  message?: string;
};

type AnswerFeedbackPayload = {
  correct?: boolean;
  points?: number;
  your_score?: number;
  opponent_score?: number;
};

type MatchStartPayload = {
  opponent_name?: string;
  room_code?: string;
};

type MatchEndPayload = {
  player1_score?: number;
  player2_score?: number;
  winner_id?: string | null;
};

type ErrorPayload = {
  message?: string;
};

type MultiplayerClient = {
  disconnect: () => void;
  findMatch: () => void;
  createRoomCode: () => void;
  joinRoomCode: (roomCode: string) => void;
  submitAnswer: (index: number) => void;
};

export default function MultiplayerPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [auth, setAuth] = useState<AuthState>({ email: "", password: "", username: "" });
  const [token, setToken] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "waiting" | "playing" | "ended">("idle");
  const [question, setQuestion] = useState<QuestionPayload | null>(null);
  const [yourScore, setYourScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentName, setOpponentName] = useState<string>("");
  const [matchMessage, setMatchMessage] = useState<string>("");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [createdRoomCode, setCreatedRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const clientRef = useRef<MultiplayerClient | null>(null);

  const isAuthed = useMemo(() => !!token, [token]);

  useEffect(() => {
    const savedToken = getToken();
    const savedUser = getUser();
    const savedUserId = savedUser?._id || localStorage.getItem("userId") || "";
    const savedUsername = savedUser?.username || localStorage.getItem("username") || "";

    if (savedToken) {
      setToken(savedToken);
      setUserId(savedUserId);
      setUsername(savedUsername);
      connectSocket(savedToken, savedUserId);
    }

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, []);

  function connectSocket(jwtToken: string, currentUserId: string) {
    const client = new GameClient();

    client.connect(jwtToken, {
      onMatchStart: (data: MatchStartPayload) => {
        setStatus("playing");
        setQuestion(null);
        setYourScore(0);
        setOpponentScore(0);
        setCreatedRoomCode("");
        setRoomCodeInput("");
        setOpponentName(data.opponent_name || "Opponent");
        setMatchMessage("Match started. First question incoming...");
      },
      onQuestion: (data: QuestionPayload) => {
        setQuestion(data);
        setMatchMessage(`Question ${data.question_number}/${data.total_questions}`);
      },
      onAnswerFeedback: (data: AnswerFeedbackPayload) => {
        const points = data.points ?? 0;
        setYourScore(data.your_score ?? 0);
        setOpponentScore(data.opponent_score ?? 0);
        setMatchMessage(`${data.correct ? "Correct" : "Wrong"} | Points: ${points >= 0 ? "+" : ""}${points}`);
      },
      onWaiting: (data: RoomCodePayload) => {
        setStatus("waiting");
        setMatchMessage(data.message || "Waiting for opponent...");
      },
      onRoomCodeCreated: (data: RoomCodePayload) => {
        setStatus("waiting");
        setCreatedRoomCode(data.room_code || "");
        setMatchMessage(data.message || "Room code created.");
      },
      onMatchEnd: (data: MatchEndPayload) => {
        setStatus("ended");
        setQuestion(null);

        const p1Score = data.player1_score ?? 0;
        const p2Score = data.player2_score ?? 0;
        const winnerId = data.winner_id || null;

        if (!winnerId) {
          setMatchMessage(`Match ended in a draw (${p1Score} - ${p2Score}).`);
        } else if (winnerId === currentUserId) {
          setMatchMessage(`You won! Final score: ${p1Score} - ${p2Score}`);
        } else {
          setMatchMessage(`You lost. Final score: ${p1Score} - ${p2Score}`);
        }

        const yourFinal = winnerId === currentUserId ? Math.max(p1Score, p2Score) : Math.min(p1Score, p2Score);
        addTotalScore(yourFinal);
        syncScoreToDb();
      },
      onError: (data: ErrorPayload) => {
        setError(data?.message || "Something went wrong");
      },
      onDisconnect: () => {
        setMatchMessage("Disconnected from game server.");
      },
    });

    clientRef.current = client;
  }

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result =
        mode === "login"
          ? await GameClient.login(auth.email, auth.password)
          : await GameClient.register(auth.username, auth.email, auth.password);

      const jwtToken = result.token;
      const currentUser = result.user;

      setSession(jwtToken, {
        _id: currentUser._id || "",
        username: currentUser.username || "",
        email: currentUser.email || auth.email,
        total_score: currentUser.total_score ?? 0,
      }, currentUser.total_score ?? 0);

      const refreshedUser = await refreshSessionFromDb(jwtToken);
      const effectiveUser = refreshedUser || currentUser;

      setToken(jwtToken);
      setUserId(effectiveUser._id || "");
      setUsername(effectiveUser.username || "");

      connectSocket(jwtToken, effectiveUser._id || "");
      setMatchMessage("Authenticated. Create a room code or join one from another device.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleCreateRoomCode() {
    if (!clientRef.current) return;
    setError("");
    setStatus("waiting");
    setCreatedRoomCode("");
    setMatchMessage("Creating room code...");
    clientRef.current.createRoomCode();
  }

  function handleJoinRoomCode() {
    if (!clientRef.current) return;
    const normalizedCode = roomCodeInput.trim().toUpperCase();
    if (!normalizedCode) {
      setError("Enter a room code first");
      return;
    }

    setError("");
    setStatus("waiting");
    setMatchMessage(`Joining room ${normalizedCode}...`);
    clientRef.current.joinRoomCode(normalizedCode);
  }

  function handleFindMatch() {
    if (!clientRef.current) return;
    setError("");
    setCreatedRoomCode("");
    setStatus("waiting");
    setMatchMessage("Searching for a player...");
    clientRef.current.findMatch();
  }

  function handleAnswer(index: number) {
    if (!clientRef.current || status !== "playing") return;
    setError("");
    clientRef.current.submitAnswer(index);
  }

  function handleLogout() {
    clearSession();
    if (clientRef.current) clientRef.current.disconnect();
    clientRef.current = null;

    setToken("");
    setUserId("");
    setUsername("");
    setStatus("idle");
    setQuestion(null);
    setYourScore(0);
    setOpponentScore(0);
    setOpponentName("");
    setRoomCodeInput("");
    setCreatedRoomCode("");
    setMatchMessage("");
    setError("");
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20 font-sans relative overflow-hidden">
      <div className="animate-scanline" />

      <nav className="sticky top-0 z-50 border-b border-neon-green/20 bg-[#050505]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 text-xl font-bold font-mono tracking-wider group">
            <Terminal className="text-neon-green group-hover:animate-pulse" />
            <span>
              Cyber<span className="text-neon-green">Shield</span> 360
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/games"
              className="text-sm font-mono font-medium text-secondary transition hover:text-neon-green hover:underline decoration-neon-green/50 underline-offset-4"
            >
              {"<-"} Back to Games
            </Link>
            <AccountScoreBar />
          </div>
        </div>
      </nav>

      <section className="relative px-6 pt-14 pb-8 text-center">
        <div className="pointer-events-none absolute top-0 left-1/2 h-[320px] w-[520px] -translate-x-1/2 rounded-full bg-neon-green/5 blur-[120px]" />
        <div className="relative z-10 mx-auto max-w-3xl font-mono">
          <div className="mb-6 flex justify-center text-neon-green">
            <Users size={42} />
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tighter sm:text-5xl">
            1v1 <span className="text-neon-green">Multiplayer</span>
          </h1>
          <p className="text-secondary text-sm sm:text-base">
            10 questions • Simultaneous answers • +10 correct • -5 wrong • Time penalty applies
          </p>
        </div>
      </section>

      <section className="px-6 max-w-5xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-slate-700 bg-surface/80 p-6 font-mono">
            {!isAuthed ? (
              <>
                <div className="mb-4 flex gap-2">
                  <button
                    onClick={() => setMode("login")}
                    className={`px-4 py-2 rounded text-sm border ${
                      mode === "login"
                        ? "border-neon-green text-neon-green"
                        : "border-slate-700 text-secondary"
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setMode("register")}
                    className={`px-4 py-2 rounded text-sm border ${
                      mode === "register"
                        ? "border-neon-green text-neon-green"
                        : "border-slate-700 text-secondary"
                    }`}
                  >
                    Register
                  </button>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-3">
                  {mode === "register" && (
                    <input
                      className="w-full rounded border border-slate-700 bg-black/40 px-3 py-2 text-sm outline-none focus:border-neon-green"
                      placeholder="Username"
                      value={auth.username}
                      onChange={(e) => setAuth((prev) => ({ ...prev, username: e.target.value }))}
                      required
                    />
                  )}

                  <input
                    type="email"
                    className="w-full rounded border border-slate-700 bg-black/40 px-3 py-2 text-sm outline-none focus:border-neon-green"
                    placeholder="Email"
                    value={auth.email}
                    onChange={(e) => setAuth((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />

                  <input
                    type="password"
                    className="w-full rounded border border-slate-700 bg-black/40 px-3 py-2 text-sm outline-none focus:border-neon-green"
                    placeholder="Password"
                    value={auth.password}
                    onChange={(e) => setAuth((prev) => ({ ...prev, password: e.target.value }))}
                    required
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded border border-neon-green/40 bg-neon-green/10 px-3 py-2 text-sm font-semibold text-neon-green hover:bg-neon-green/20 disabled:opacity-50"
                  >
                    {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
                  </button>
                </form>
              </>
            ) : (
              <div className="space-y-3 text-sm">
                <p>
                  Signed in as <span className="text-neon-green font-semibold">{username || "Player"}</span>
                </p>
                <button
                  onClick={handleCreateRoomCode}
                  className="w-full rounded border border-neon-green/40 bg-neon-green/10 px-3 py-2 font-semibold text-neon-green hover:bg-neon-green/20"
                >
                  Create Room Code
                </button>

                {createdRoomCode && (
                  <div className="rounded border border-neon-green/30 bg-black/30 p-3 text-center">
                    <p className="text-xs text-secondary">Share this code</p>
                    <p className="mt-1 text-2xl font-bold tracking-[0.3em] text-neon-green">{createdRoomCode}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <input
                    className="w-full rounded border border-slate-700 bg-black/40 px-3 py-2 text-sm uppercase outline-none focus:border-neon-green"
                    placeholder="Enter room code"
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    maxLength={6}
                  />
                  <button
                    onClick={handleJoinRoomCode}
                    className="w-full rounded border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 font-semibold text-cyan-300 hover:bg-cyan-500/20"
                  >
                    Join Room Code
                  </button>
                </div>

                <div className="text-center text-xs text-secondary">or</div>
                <button
                  onClick={handleFindMatch}
                  className="w-full rounded border border-slate-600 bg-black/30 px-3 py-2 font-semibold text-secondary hover:text-foreground"
                >
                  Find Random Match
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full rounded border border-slate-700 bg-black/40 px-3 py-2 text-secondary hover:text-foreground"
                >
                  Logout
                </button>
              </div>
            )}

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          </div>

          <div className="rounded-lg border border-slate-700 bg-surface/80 p-6 font-mono">
            <div className="mb-3 text-sm text-secondary">Match Status</div>
            <p className="text-sm text-foreground mb-4">
              {matchMessage || "Login, create a room code, and join it from another device."}
            </p>

            {createdRoomCode && status === "waiting" && (
              <div className="mb-4 rounded border border-neon-green/30 bg-black/30 p-3 text-sm text-secondary">
                Waiting in room <span className="font-semibold tracking-[0.25em] text-neon-green">{createdRoomCode}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="rounded border border-slate-700 p-3">
                <p className="text-xs text-secondary mb-1">You</p>
                <p className="text-xl font-bold text-neon-green">{yourScore}</p>
              </div>
              <div className="rounded border border-slate-700 p-3">
                <p className="text-xs text-secondary mb-1">{opponentName || "Opponent"}</p>
                <p className="text-xl font-bold text-cyan-400">{opponentScore}</p>
              </div>
            </div>

            {question && status === "playing" && (
              <div className="space-y-3">
                <div className="text-xs text-secondary">
                  Q{question.question_number}/{question.total_questions} • {question.type}
                </div>
                <h3 className="text-sm leading-relaxed">{question.question_text}</h3>

                <div className="grid gap-2">
                  {question.options.map((opt, index) => (
                    <button
                      key={`${question.question_number}-${index}`}
                      onClick={() => handleAnswer(index)}
                      className="w-full rounded border border-slate-700 bg-black/30 px-3 py-2 text-left text-sm hover:border-neon-green hover:text-neon-green transition"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 mt-6 text-xs text-secondary font-mono">
        Player ID: {userId || "Not logged in"}
      </div>
    </main>
  );
}
