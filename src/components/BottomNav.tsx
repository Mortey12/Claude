export type Fane = "idag" | "fasar" | "maaltid" | "sparing" | "meir";

const FANER: { id: Fane; namn: string; ikon: string }[] = [
  { id: "idag", namn: "I dag", ikon: "✓" },
  { id: "fasar", namn: "Fasar", ikon: "◔" },
  { id: "maaltid", namn: "Måltid", ikon: "🍽" },
  { id: "sparing", namn: "Sparing", ikon: "🌱" },
  { id: "meir", namn: "Meir", ikon: "⋯" },
];

export function BottomNav({ fane, onVel }: { fane: Fane; onVel: (f: Fane) => void }) {
  return (
    <nav
      style={{
        position: "sticky",
        bottom: 0,
        display: "flex",
        justifyContent: "space-around",
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        padding: "8px 4px calc(8px + env(safe-area-inset-bottom))",
        boxShadow: "0 -4px 16px rgba(196,154,168,0.12)",
      }}
    >
      {FANER.map((f) => (
        <button
          key={f.id}
          onClick={() => onVel(f.id)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            background: "transparent",
            border: "none",
            color: fane === f.id ? "var(--primary-strong)" : "var(--text-soft)",
            fontWeight: fane === f.id ? 700 : 500,
            fontSize: "0.7rem",
            cursor: "pointer",
            padding: "4px 8px",
          }}
        >
          <span style={{ fontSize: "1.15rem" }}>{f.ikon}</span>
          {f.namn}
        </button>
      ))}
    </nav>
  );
}
