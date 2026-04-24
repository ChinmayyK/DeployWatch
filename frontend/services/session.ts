import { SESSION_COOKIE, SESSION_STORAGE_KEY } from "@/config/constants";
import type { Session } from "@/types";

export function setSessionCookie() {
  if (typeof document === "undefined") {
    return;
  }

  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  document.cookie = `${SESSION_COOKIE}=active; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
}

export function clearSessionCookie() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${SESSION_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

export function readSessionStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function writeSessionStorage(session: Session | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}
