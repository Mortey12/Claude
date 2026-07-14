import { db } from "./db";
import { deriveKey, encryptJSON, decryptJSON, randomBytes, bufToB64 } from "../crypto/crypto";
import { appConfig } from "../config/appConfig";

const VERIFIER_PLAINTEXT = { check: "planlegg-ok" };
const MAX_DELAY_MS = 30_000;

type Listener = () => void;

class Vault {
  private key: CryptoKey | null = null;
  private cache = new Map<string, unknown>();
  private listeners = new Set<Listener>();

  get unlocked(): boolean {
    return this.key !== null;
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    for (const l of this.listeners) l();
  }

  async isInitialized(): Promise<boolean> {
    const row = await db.authMeta.get("auth");
    return !!row;
  }

  async setupPin(pin: string): Promise<void> {
    const salt = randomBytes(16);
    const key = await deriveKey(pin, salt);
    const verifier = await encryptJSON(key, VERIFIER_PLAINTEXT);
    await db.authMeta.put({
      id: "auth",
      salt: bufToB64(salt),
      iterations: appConfig.pbkdf2Iterations,
      verifier,
    });
    await db.security.put({ id: "lock", failCount: 0, lockedUntil: 0 });
    this.key = key;
    this.cache.clear();
    this.notify();
  }

  async getLockState(): Promise<SecurityState> {
    const row = await db.security.get("lock");
    if (!row) return { failCount: 0, lockedUntil: 0 };
    return { failCount: row.failCount, lockedUntil: row.lockedUntil };
  }

  private delayForFailCount(failCount: number): number {
    if (failCount <= 0) return 0;
    return Math.min(1000 * 2 ** (failCount - 1), MAX_DELAY_MS);
  }

  async tryUnlock(pin: string): Promise<UnlockResult> {
    const meta = await db.authMeta.get("auth");
    if (!meta) return { ok: false, reason: "not-initialized", waitMs: 0 };

    const security = (await db.security.get("lock")) ?? { id: "lock" as const, failCount: 0, lockedUntil: 0 };
    const now = Date.now();
    if (security.lockedUntil > now) {
      return { ok: false, reason: "wait", waitMs: security.lockedUntil - now };
    }

    const saltBytes = base64ToBytes(meta.salt);
    const key = await deriveKey(pin, saltBytes, meta.iterations);
    try {
      const decoded = await decryptJSON<typeof VERIFIER_PLAINTEXT>(key, meta.verifier);
      if (decoded.check !== VERIFIER_PLAINTEXT.check) throw new Error("mismatch");
    } catch {
      const failCount = security.failCount + 1;
      const waitMs = this.delayForFailCount(failCount);
      await db.security.put({ id: "lock", failCount, lockedUntil: now + waitMs });
      return { ok: false, reason: "wrong-pin", waitMs };
    }

    await db.security.put({ id: "lock", failCount: 0, lockedUntil: 0 });
    this.key = key;
    this.cache.clear();
    this.notify();
    return { ok: true, reason: "ok", waitMs: 0 };
  }

  lock(): void {
    this.key = null;
    this.cache.clear();
    this.notify();
  }

  async get<T>(collection: string, fallback: T): Promise<T> {
    if (!this.key) throw new Error("Vault is locked");
    if (this.cache.has(collection)) return this.cache.get(collection) as T;
    const row = await db.collections.get(collection);
    if (!row) {
      this.cache.set(collection, fallback);
      return fallback;
    }
    const data = await decryptJSON<T>(this.key, row);
    this.cache.set(collection, data);
    return data;
  }

  async set<T>(collection: string, data: T): Promise<void> {
    if (!this.key) throw new Error("Vault is locked");
    this.cache.set(collection, data);
    const payload = await encryptJSON(this.key, data);
    await db.collections.put({ namn: collection, ...payload });
    this.notify();
  }
}

export interface SecurityState {
  failCount: number;
  lockedUntil: number;
}

export interface UnlockResult {
  ok: boolean;
  reason: "ok" | "wrong-pin" | "wait" | "not-initialized";
  waitMs: number;
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export const vault = new Vault();
