import { useState } from "react";
import { useCollection } from "../db/useCollection";
import { COLLECTIONS, TOMME_LISTER } from "../db/collections";
import type { DagbokInnlegg } from "../types";
import { todayISO, formatNorsk } from "../utils/dates";

const HUMOER_VAL = ["😊", "😌", "😐", "😔", "😤", "🥱"];

export function JournalScreen() {
  const journalCol = useCollection(COLLECTIONS.journal, TOMME_LISTER.journal);
  const [tekst, setTekst] = useState("");
  const [humoer, setHumoer] = useState<string | undefined>(undefined);

  const innlegg = journalCol.data ?? [];
  const sortert = [...innlegg].sort((a, b) => (a.dato < b.dato ? 1 : -1));

  async function lagre() {
    const trimma = tekst.trim();
    if (!trimma) return;
    const nytt: DagbokInnlegg = {
      id: crypto.randomUUID(),
      dato: todayISO(),
      tekst: trimma,
      humoer,
      opprettaAt: new Date().toISOString(),
    };
    await journalCol.setData([nytt, ...innlegg]);
    setTekst("");
    setHumoer(undefined);
  }

  async function slett(id: string) {
    await journalCol.setData(innlegg.filter((i) => i.id !== id));
  }

  return (
    <div style={{ padding: "20px 16px 100px", maxWidth: 560, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.4rem", marginBottom: 16 }}>Dagbok</h1>

      <div className="card" style={{ marginBottom: 20 }}>
        <textarea
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          placeholder="Korleis var dagen?"
          rows={3}
          style={{
            width: "100%",
            border: "1.5px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: 10,
            background: "var(--bg)",
            color: "var(--text)",
            resize: "vertical",
          }}
        />
        <div style={{ display: "flex", gap: 6, margin: "10px 0" }}>
          {HUMOER_VAL.map((h) => (
            <button
              key={h}
              onClick={() => setHumoer(h === humoer ? undefined : h)}
              style={{
                fontSize: "1.3rem",
                border: h === humoer ? "2px solid var(--primary-strong)" : "1px solid var(--border)",
                borderRadius: "50%",
                width: 40,
                height: 40,
                background: "var(--surface)",
                cursor: "pointer",
              }}
            >
              {h}
            </button>
          ))}
        </div>
        <button className="btn-primary" onClick={lagre} disabled={!tekst.trim()}>
          Lagre innlegg
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sortert.map((i) => (
          <div key={i.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-soft)" }}>{formatNorsk(i.dato)}</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {i.humoer && <span>{i.humoer}</span>}
                <button className="btn-ghost" onClick={() => slett(i.id)}>
                  ✕
                </button>
              </div>
            </div>
            <p style={{ margin: "8px 0 0", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{i.tekst}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
