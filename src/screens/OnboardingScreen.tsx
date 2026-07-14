import { useState } from "react";
import { todayISO } from "../utils/dates";
import { seedNyPlan } from "../data/initializeUserData";

export function OnboardingScreen({ onFerdig }: { onFerdig: () => void }) {
  const [dato, setDato] = useState(todayISO());
  const [lagrar, setLagrar] = useState(false);

  async function start() {
    setLagrar(true);
    await seedNyPlan(dato);
    setLagrar(false);
    onFerdig();
  }

  return (
    <div
      className="unlocked-theme fade-in-up"
      style={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div className="card" style={{ maxWidth: 380, width: "100%", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.4rem", marginBottom: 8 }}>Velkomen</h1>
        <p style={{ color: "var(--text-soft)", marginBottom: 20, lineHeight: 1.5 }}>
          Når startar planen din? Heile året vert lagt opp ut frå denne datoen, og du kan endre eller
          fjerne kva som helst seinare.
        </p>
        <input
          type="date"
          value={dato}
          onChange={(e) => setDato(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: "var(--radius-sm)",
            border: "1.5px solid var(--border)",
            fontSize: "1rem",
            marginBottom: 20,
            background: "var(--bg)",
            color: "var(--text)",
          }}
        />
        <button className="btn-primary" style={{ width: "100%" }} onClick={start} disabled={lagrar}>
          {lagrar ? "Set opp planen …" : "Kom i gang"}
        </button>
      </div>
    </div>
  );
}
