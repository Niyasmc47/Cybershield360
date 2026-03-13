const DEFAULT_BACKEND_PORT = "5000";

function normalizeUrl(rawUrl: string) {
  try {
    return new URL(rawUrl);
  } catch {
    return null;
  }
}

export function getBackendUrl() {
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();

  if (typeof window === "undefined") {
    return envUrl || `http://localhost:${DEFAULT_BACKEND_PORT}`;
  }

  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  const currentHost = window.location.hostname;
  const inferredUrl = `${protocol}//${currentHost}:${DEFAULT_BACKEND_PORT}`;

  if (!envUrl) {
    return inferredUrl;
  }

  const parsedEnvUrl = normalizeUrl(envUrl);
  if (!parsedEnvUrl) {
    return inferredUrl;
  }

  return `${parsedEnvUrl.protocol}//${parsedEnvUrl.host}`;
}