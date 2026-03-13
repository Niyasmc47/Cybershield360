export interface SessionUser {
  _id?: string;
  username: string;
  email: string;
  total_score?: number;
}

import { getBackendUrl } from "./backend-url";

const TOKEN_KEY = "token";
const USER_KEY = "cybershield_user";
const SCORE_KEY = "cybershield_total_score";

function isBrowser() {
  return typeof window !== "undefined";
}

export function setSession(token: string, user: SessionUser, initialScore = 0) {
  if (!isBrowser()) return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem("userId", user._id || "");
  localStorage.setItem("username", user.username || "");
  // Always reset score to the value from DB (or 0 for brand-new accounts)
  localStorage.setItem(SCORE_KEY, String(initialScore));
  window.dispatchEvent(new Event("cybershield-session-updated"));
}

export function getToken(): string {
  if (!isBrowser()) return "";
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function getUser(): SessionUser | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
  localStorage.removeItem(SCORE_KEY);
  window.dispatchEvent(new Event("cybershield-session-updated"));
}

function isLoggedIn(): boolean {
  if (!isBrowser()) return false;
  return !!localStorage.getItem(TOKEN_KEY);
}

export function getTotalScore(): number {
  if (!isBrowser()) return 0;
  const storage = isLoggedIn() ? localStorage : sessionStorage;
  const raw = storage.getItem(SCORE_KEY);
  const value = Number(raw || "0");
  return Number.isFinite(value) ? value : 0;
}

export function setTotalScore(value: number) {
  if (!isBrowser()) return;
  const storage = isLoggedIn() ? localStorage : sessionStorage;
  storage.setItem(SCORE_KEY, String(value));
  window.dispatchEvent(new Event("cybershield-session-updated"));
}

export function addTotalScore(delta: number) {
  const next = getTotalScore() + delta;
  setTotalScore(next);
  return next;
}

/** Refresh local session user + score from database profile */
export async function refreshSessionFromDb(tokenOverride?: string): Promise<SessionUser | null> {
  if (!isBrowser()) return null;
  const token = tokenOverride || localStorage.getItem(TOKEN_KEY) || "";
  if (!token) return null;

  try {
    const response = await fetch(`${getBackendUrl()}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return null;

    const profile = (await response.json()) as SessionUser;
    const user: SessionUser = {
      _id: profile._id,
      username: profile.username,
      email: profile.email,
      total_score: profile.total_score ?? 0,
    };

    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem("userId", user._id || "");
    localStorage.setItem("username", user.username || "");
    localStorage.setItem(SCORE_KEY, String(user.total_score ?? 0));
    window.dispatchEvent(new Event("cybershield-session-updated"));
    return user;
  } catch {
    return null;
  }
}

/** Persist the current total score to the database */
export async function syncScoreToDb(): Promise<void> {
  if (!isBrowser()) return;
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    await fetch(`${getBackendUrl()}/api/user/score`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ total_score: getTotalScore() }),
    });
  } catch {
    // Silently fail — score is still in localStorage
  }
}