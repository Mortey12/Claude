import { useState } from "react";
import { useCollection } from "../db/useCollection";
import { COLLECTIONS, TOMME_LISTER } from "../db/collections";
import type { HandlelisteVare, LagraMaaltid, MaaltidDag, Vekedag } from "../types";
import { VEKEDAG_NAMN, VEKEDAG_REKKEFOELGJE } from "../utils/dates";

const SLOT_NAMN: { felt: keyof Omit<MaaltidDag, "dag">; namn: string }[] = [
  { felt: "frukost", namn: "Frukost" },
  { felt: "lunsj", namn: "Lunsj" },
  { felt: "middag", namn: "Middag" },
  { felt: "snack", namn: "Snack" },
];

export function MealPlanScreen() {
  const planCol = useCollection(COLLECTIONS.mealPlan, TOMME_LISTER.mealPlan);
  const lagraCol = useCollection(COLLECTIONS.savedMeals, TOMME_LISTER.savedMeals);
  const handlelisteCol = useCollection(COLLECTIONS.shoppingList, TOMME_LISTER.shoppingList);
  const [nyVare, setNyVare] = useState("");
  const [nyttMaaltid, setNyttMaaltid] = useState("");

  const plan = planCol.data ?? [];
  const lagraMaaltid = lagraCol.data ?? [];
  const handleliste = handlelisteCol.data ?? [];

  function finnDag(dag: Vekedag): MaaltidDag {
    return plan.find((p) => p.dag === dag) ?? { dag };
  }

  async function settSlot(dag: Vekedag, felt: keyof Omit<MaaltidDag, "dag">, verdi: string) {
    const eksisterande = plan.some((p) => p.dag === dag);
    const nyPlan = eksisterande
      ? plan.map((p) => (p.dag === dag ? { ...p, [felt]: verdi || undefined } : p))
      : [...plan, { dag, [felt]: verdi || undefined }];
    await planCol.setData(nyPlan);
  }

  async function leggTilLagraMaaltid() {
    const namn = nyttMaaltid.trim();
    if (!namn) return;
    const nytt: LagraMaaltid = { id: crypto.randomUUID(), namn, type: "middag" };
    await lagraCol.setData([...lagraMaaltid, nytt]);
    setNyttMaaltid("");
  }

  async function slettLagraMaaltid(id: string) {
    await lagraCol.setData(lagraMaaltid.filter((m) => m.id !== id));
  }

  async function genererHandleliste() {
    const namn = new Set<string>();
    for (const dag of plan) {
      for (const { felt } of SLOT_NAMN) {
        const verdi = dag[felt];
        if (verdi) namn.add(verdi);
      }
    }
    const eksisterandeNamn = new Set(handleliste.map((v) => v.namn));
    const nye: HandlelisteVare[] = [...namn]
      .filter((n) => !eksisterandeNamn.has(n))
      .map((n) => ({ id: crypto.randomUUID(), namn: n, kryssa: false, kjelde: "auto" }));
    await handlelisteCol.setData([...handleliste, ...nye]);
  }

  async function leggTilVare() {
    const namn = nyVare.trim();
    if (!namn) return;
    const ny: HandlelisteVare = { id: crypto.randomUUID(), namn, kryssa: false, kjelde: "manuell" };
    await handlelisteCol.setData([...handleliste, ny]);
    setNyVare("");
  }

  async function vekslKryss(id: string) {
    await handlelisteCol.setData(
      handleliste.map((v) => (v.id === id ? { ...v, kryssa: !v.kryssa } : v)),
    );
  }

  async function slettVare(id: string) {
    await handlelisteCol.setData(handleliste.filter((v) => v.id !== id));
  }

  return (
    <div style={{ padding: "20px 16px 100px", maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.4rem", marginBottom: 16 }}>Måltid</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {VEKEDAG_REKKEFOELGJE.map((dag) => {
          const rad = finnDag(dag);
          return (
            <div key={dag} className="card">
              <h2 style={{ margin: "0 0 8px", fontSize: "1rem" }}>{VEKEDAG_NAMN[dag]}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {SLOT_NAMN.map(({ felt, namn }) => (
                  <label key={felt} style={{ fontSize: "0.75rem", color: "var(--text-soft)" }}>
                    {namn}
                    <input
                      value={rad[felt] ?? ""}
                      onChange={(e) => settSlot(dag, felt, e.target.value)}
                      style={{
                        display: "block",
                        width: "100%",
                        marginTop: 2,
                        padding: "6px 8px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border)",
                        background: "var(--bg)",
                        color: "var(--text)",
                        fontSize: "0.85rem",
                      }}
                    />
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <section className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Lagra måltid</h2>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input
            value={nyttMaaltid}
            onChange={(e) => setNyttMaaltid(e.target.value)}
            placeholder="Nytt måltid"
            style={{ flex: 1, padding: "8px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}
          />
          <button className="btn-secondary" onClick={leggTilLagraMaaltid}>
            Legg til
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {lagraMaaltid.map((m) => (
            <span key={m.id} className="chip" style={{ background: "var(--secondary)" }}>
              {m.namn}
              <button
                onClick={() => slettLagraMaaltid(m.id)}
                style={{ border: "none", background: "transparent", cursor: "pointer" }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </section>

      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Handleliste</h2>
          <button className="btn-secondary" onClick={genererHandleliste}>
            Lag frå plan
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
          <input
            value={nyVare}
            onChange={(e) => setNyVare(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && leggTilVare()}
            placeholder="Legg til vare"
            style={{ flex: 1, padding: "8px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}
          />
          <button className="btn-secondary" onClick={leggTilVare}>
            Legg til
          </button>
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {handleliste.map((v) => (
            <li key={v.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={v.kryssa} onChange={() => vekslKryss(v.id)} />
              <span style={{ flex: 1, textDecoration: v.kryssa ? "line-through" : "none" }}>{v.namn}</span>
              <button className="btn-ghost" onClick={() => slettVare(v.id)}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
