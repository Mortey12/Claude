import { useCollection } from "../db/useCollection";
import { COLLECTIONS, DEFAULT_SETTINGS } from "../db/collections";

export type MeirValg = "dagbok" | "framgangslogg" | "innstillingar";

export function MeirScreen({ onVel }: { onVel: (v: MeirValg) => void }) {
  const settingsCol = useCollection(COLLECTIONS.settings, DEFAULT_SETTINGS);
  const settings = settingsCol.data;
  if (!settings) return null;

  const valLister: { id: MeirValg; namn: string; ikon: string; vis: boolean }[] = [
    { id: "dagbok", namn: "Dagbok", ikon: "📔", vis: settings.moduler.dagbok },
    { id: "framgangslogg", namn: "Framgangslogg", ikon: "📈", vis: settings.moduler.framgangslogg },
    { id: "innstillingar", namn: "Innstillingar", ikon: "⚙️", vis: true },
  ];

  return (
    <div style={{ padding: "20px 16px 100px", maxWidth: 560, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.4rem", marginBottom: 16 }}>Meir</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {valLister
          .filter((v) => v.vis)
          .map((v) => (
            <button
              key={v.id}
              className="card"
              onClick={() => onVel(v.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                textAlign: "left",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: 600,
                color: "var(--text)",
              }}
            >
              <span style={{ fontSize: "1.3rem" }}>{v.ikon}</span>
              {v.namn}
            </button>
          ))}
      </div>
    </div>
  );
}
