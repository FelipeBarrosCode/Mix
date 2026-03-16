"use client";

import { useEffect, useState } from "react";

const SESSION_PREFIX = "mix-session-";
const STORAGE_PREFIX = "mix:splash:session:";
const MAX_ENTRY_AGE_MS = 1000 * 60 * 60 * 12;
const SPLASH_DURATION_MS = 6000;

function resolveSessionId() {
  if (!window.name || !window.name.startsWith(SESSION_PREFIX)) {
    window.name = `${SESSION_PREFIX}${crypto.randomUUID()}`;
  }
  return window.name;
}

function cleanupOldEntries(now: number) {
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key || !key.startsWith(STORAGE_PREFIX)) continue;
    try {
      const parsed = JSON.parse(localStorage.getItem(key) ?? "{}");
      if (typeof parsed.ts !== "number" || now - parsed.ts > MAX_ENTRY_AGE_MS) {
        localStorage.removeItem(key);
      }
    } catch {
      localStorage.removeItem(key);
    }
  }
}

export function SplashScreen() {
  const [visible, setVisible] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const now = Date.now();
      cleanupOldEntries(now);
      const sessionId = resolveSessionId();
      const key = `${STORAGE_PREFIX}${sessionId}`;
      const seen = localStorage.getItem(key);

      if (seen) {
        setVisible(false);
        return;
      }

      localStorage.setItem(key, JSON.stringify({ ts: now }));
      setVisible(true);
      const timer = window.setTimeout(() => setVisible(false), SPLASH_DURATION_MS);
      return () => window.clearTimeout(timer);
    } catch {
      setVisible(false);
      return;
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="mix-splash-overlay fixed inset-0 z-[100] flex items-center justify-center bg-bg/95 backdrop-blur-sm">
      <div className="mix-splash-logo flex flex-col items-center gap-4">
        <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] border border-white/10 bg-white/5 text-3xl font-semibold tracking-[0.3em] text-fg shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          MIX
        </div>

      </div>
    </div>
  );
}
