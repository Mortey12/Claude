import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { vault } from "../db/vault";
import { appConfig } from "../config/appConfig";

type AuthPhase = "checking" | "needs-setup" | "locked" | "unlocked";

interface AuthContextValue {
  phase: AuthPhase;
  setupPin: (pin: string) => Promise<void>;
  unlock: (pin: string) => Promise<{ ok: boolean; waitMs: number; reason: string }>;
  lock: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<AuthPhase>("checking");
  const backgroundedAt = useRef<number | null>(null);
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    vault.isInitialized().then((yes) => setPhase(yes ? "locked" : "needs-setup"));
  }, []);

  useEffect(() => {
    function clearTimer() {
      if (lockTimer.current) {
        clearTimeout(lockTimer.current);
        lockTimer.current = null;
      }
    }

    function handleVisibility() {
      if (document.visibilityState === "hidden") {
        backgroundedAt.current = Date.now();
        clearTimer();
        lockTimer.current = setTimeout(() => {
          if (vault.unlocked) {
            vault.lock();
            setPhase("locked");
          }
        }, appConfig.autoLockMs);
      } else {
        clearTimer();
        if (backgroundedAt.current && Date.now() - backgroundedAt.current >= appConfig.autoLockMs) {
          if (vault.unlocked) {
            vault.lock();
            setPhase("locked");
          }
        }
        backgroundedAt.current = null;
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleVisibility);
    window.addEventListener("focus", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
      clearTimer();
    };
  }, []);

  async function setupPin(pin: string) {
    await vault.setupPin(pin);
    setPhase("unlocked");
  }

  async function unlock(pin: string) {
    const result = await vault.tryUnlock(pin);
    if (result.ok) setPhase("unlocked");
    return { ok: result.ok, waitMs: result.waitMs, reason: result.reason };
  }

  function lock() {
    vault.lock();
    setPhase("locked");
  }

  return (
    <AuthContext.Provider value={{ phase, setupPin, unlock, lock }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth maa brukast innanfor AuthProvider");
  return ctx;
}
