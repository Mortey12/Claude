import { useState } from "react";
import { useCollection } from "../db/useCollection";
import { COLLECTIONS, TOMME_LISTER } from "../db/collections";
import type { SparingBidrag, SparingMaal } from "../types";
import { SPARETIPS } from "../data/seedLoader";
import { todayISO, formatNorsk } from "../utils/dates";

export function SavingsScreen() {
  const maalCol = useCollection(COLLECTIONS.savingsGoals, TOMME_LISTER.savingsGoals);
  const bidragCol = useCollection(COLLECTIONS.savingsContributions, TOMME_LISTER.savingsContributions);
  const [nyttNamn, setNyttNamn] = useState("");
  const [nyttMaalbeloep, setNyttMaalbeloep] = useState("");
  const [tipsIndeks, setTipsIndeks] = useState(0);
  const [bidragInput, setBidragInput] = useState<Record<string, string>>({});

  const maal = maalCol.data ?? [];
  const bidrag = bidragCol.data ?? [];

  async function leggTilMaal() {
    const namn = nyttNamn.trim();
    const beloep = Number(nyttMaalbeloep);
    if (!namn || !beloep) return;
    const nytt: SparingMaal = {
      id: crypto.randomUUID(),
      namn,
      maalbeloep: beloep,
      saldo: 0,
      aktiv: true,
    };
    await maalCol.setData([...maal, nytt]);
    setNyttNamn("");
    setNyttMaalbeloep("");
  }

  async function slettMaal(id: string) {
    await maalCol.setData(maal.filter((m) => m.id !== id));
    await bidragCol.setData(bidrag.filter((b) => b.maalId !== id));
  }

  async function leggTilBidrag(maalId: string) {
    const beloep = Number(bidragInput[maalId]);
    if (!beloep) return;
    const nyttBidrag: SparingBidrag = {
      id: crypto.randomUUID(),
      maalId,
      beloep,
      dato: todayISO(),
    };
    await bidragCol.setData([...bidrag, nyttBidrag]);
    await maalCol.setData(maal.map((m) => (m.id === maalId ? { ...m, saldo: m.saldo + beloep } : m)));
    setBidragInput((prev) => ({ ...prev, [maalId]: "" }));
  }

  const naesteTips = () => setTipsIndeks((i) => (i + 1) % SPARETIPS.length);

  return (
    <div style={{ padding: "20px 16px 100px", maxWidth: 560, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.4rem", marginBottom: 16 }}>Sparing</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 22 }}>
        {maal.map((m) => {
          const prosent = Math.min(100, Math.round((m.saldo / m.maalbeloep) * 100));
          const bidragForMaal = bidrag.filter((b) => b.maalId === m.id).slice(-5).reverse();
          return (
            <div key={m.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h2 style={{ margin: 0, fontSize: "1.05rem" }}>{m.namn}</h2>
                <button className="btn-ghost" onClick={() => slettMaal(m.id)}>
                  ✕
                </button>
              </div>
              {m.notat && <p style={{ margin: "4px 0", fontSize: "0.85rem", color: "var(--text-soft)" }}>{m.notat}</p>}
              <p style={{ margin: "6px 0", fontWeight: 700 }}>
                {m.saldo.toLocaleString("nb-NO")} kr / {m.maalbeloep.toLocaleString("nb-NO")} kr
              </p>
              <div
                style={{
                  height: 10,
                  borderRadius: 999,
                  background: "var(--border)",
                  overflow: "hidden",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: `${prosent}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, var(--sage), var(--primary))",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="number"
                  placeholder="Beløp"
                  value={bidragInput[m.id] ?? ""}
                  onChange={(e) => setBidragInput((prev) => ({ ...prev, [m.id]: e.target.value }))}
                  style={{ flex: 1, padding: "6px 8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}
                />
                <button className="btn-secondary" onClick={() => leggTilBidrag(m.id)}>
                  Legg til
                </button>
              </div>
              {bidragForMaal.length > 0 && (
                <ul style={{ margin: "10px 0 0", padding: 0, listStyle: "none", fontSize: "0.8rem", color: "var(--text-soft)" }}>
                  {bidragForMaal.map((b) => (
                    <li key={b.id}>
                      {formatNorsk(b.dato)}: +{b.beloep.toLocaleString("nb-NO")} kr
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <section className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Nytt sparemål</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={nyttNamn}
            onChange={(e) => setNyttNamn(e.target.value)}
            placeholder="Namn"
            style={{ flex: 2, padding: "8px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}
          />
          <input
            type="number"
            value={nyttMaalbeloep}
            onChange={(e) => setNyttMaalbeloep(e.target.value)}
            placeholder="Målbeløp"
            style={{ flex: 1, padding: "8px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}
          />
          <button className="btn-secondary" onClick={leggTilMaal}>
            Legg til
          </button>
        </div>
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Sparetips</h2>
        <p style={{ fontWeight: 700, margin: "0 0 6px" }}>{SPARETIPS[tipsIndeks].tittel}</p>
        <p style={{ margin: 0, lineHeight: 1.5, color: "var(--text-soft)" }}>{SPARETIPS[tipsIndeks].tekst}</p>
        <button className="btn-secondary" style={{ marginTop: 12 }} onClick={naesteTips}>
          Neste tips
        </button>
      </section>
    </div>
  );
}
