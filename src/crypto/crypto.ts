import { appConfig } from "../config/appConfig";

export function bufToB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function b64ToBuf(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function randomBytes(len: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(len));
}

export async function deriveKey(
  pin: string,
  salt: Uint8Array,
  iterations: number = appConfig.pbkdf2Iterations,
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey("raw", enc.encode(pin), "PBKDF2", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export interface EncryptedPayload {
  iv: string;
  cipher: string;
}

export async function encryptJSON(key: CryptoKey, data: unknown): Promise<EncryptedPayload> {
  const iv = randomBytes(12);
  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  const cipherBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, plaintext);
  return { iv: bufToB64(iv), cipher: bufToB64(cipherBuf) };
}

export async function decryptJSON<T>(key: CryptoKey, payload: EncryptedPayload): Promise<T> {
  const iv = b64ToBuf(payload.iv);
  const cipherBuf = b64ToBuf(payload.cipher);
  const plainBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    cipherBuf as BufferSource,
  );
  return JSON.parse(new TextDecoder().decode(plainBuf)) as T;
}

export async function encryptDataUrl(key: CryptoKey, dataUrl: string): Promise<EncryptedPayload> {
  return encryptJSON(key, { dataUrl });
}

export async function decryptDataUrl(key: CryptoKey, payload: EncryptedPayload): Promise<string> {
  const { dataUrl } = await decryptJSON<{ dataUrl: string }>(key, payload);
  return dataUrl;
}
