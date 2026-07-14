import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../state/AuthContext";
import { appConfig } from "../../config/appConfig";

export function LockScreen({ mode, onBack }: { mode: "setup" | "unlock"; onBack: () => void }) {
  const { setupPin, unlock } = useAuth();
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [ventMs, setVentMs] = useState(0);
  const [arbeider, setArbeider] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (ventMs <= 0) return;
    const id = setInterval(() => {
      setVentMs((v) => Math.max(0, v - 250));
    }, 250);
    return () => clearInterval(id);
  }, [ventMs]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeil(null);
    if (mode === "setup") {
      if (pin.length < appConfig.minPinLength) {
        setFeil(`PIN må vere minst ${appConfig.minPinLength} teikn.`);
        return;
      }
      if (pin !== pinConfirm) {
        setFeil("PIN-ane er ikkje like.");
        return;
      }
      setArbeider(true);
      await setupPin(pin);
      setArbeider(false);
      return;
    }

    setArbeider(true);
    const result = await unlock(pin);
    setArbeider(false);
    if (!result.ok) {
      setPin("");
      if (result.reason === "wait") {
        setFeil("For mange forsøk. Vent litt.");
      } else {
        setFeil("Feil PIN.");
      }
      setVentMs(result.waitMs);
    }
  }

  const ventSekund = Math.ceil(ventMs / 1000);

  return (
    <div
      className="decoy-theme"
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 320,
          background: "var(--decoy-surface)",
          border: "1px solid var(--decoy-border)",
          borderRadius: "var(--decoy-radius)",
          padding: 24,
        }}
      >
        <h1 style={{ fontSize: "1.1rem", margin: "0 0 4px", fontWeight: 600 }}>
          {mode === "setup" ? "Vel ein PIN" : "Lås opp"}
        </h1>
        <p style={{ margin: "0 0 18px", fontSize: "0.85rem", color: "var(--decoy-text-soft)" }}>
          {appConfig.decoyName}
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN"
            disabled={ventMs > 0 || arbeider}
            style={inputStyle}
          />
          {mode === "setup" && (
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={pinConfirm}
              onChange={(e) => setPinConfirm(e.target.value)}
              placeholder="Gjenta PIN"
              disabled={arbeider}
              style={inputStyle}
            />
          )}

          {feil && <p style={{ color: "#a33", fontSize: "0.85rem", margin: 0 }}>{feil}</p>}
          {ventMs > 0 && (
            <p style={{ color: "var(--decoy-text-soft)", fontSize: "0.85rem", margin: 0 }}>
              Prøv igjen om {ventSekund} sekund.
            </p>
          )}

          <button
            type="submit"
            disabled={ventMs > 0 || arbeider || pin.length === 0}
            style={{
              padding: "11px 16px",
              border: "1px solid var(--decoy-border)",
              borderRadius: "var(--decoy-radius)",
              background: "var(--decoy-accent)",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              opacity: ventMs > 0 || arbeider ? 0.6 : 1,
            }}
          >
            {mode === "setup" ? "Lagre" : "Lås opp"}
          </button>
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: "8px",
              border: "none",
              background: "transparent",
              color: "var(--decoy-text-soft)",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            Tilbake
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "11px 12px",
  border: "1px solid var(--decoy-border)",
  borderRadius: "var(--decoy-radius)",
  background: "var(--decoy-bg)",
  color: "var(--decoy-text)",
  fontSize: "1rem",
  letterSpacing: "2px",
};
