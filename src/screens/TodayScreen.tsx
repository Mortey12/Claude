import { useMemo, useState } from "react";
import { useCollection } from "../db/useCollection";
import { COLLECTIONS, DEFAULT_SETTINGS, TOMME_LISTER } from "../db/collections";
import type { DelAvDag, Fullforing, RutineElement, PushGameLogg } from "../types";
import { todayISO, formatNorsk, startOfWeek } from "../utils/dates";
import { elementForDagIDag } from "../utils/recurrence";
import { berekneRekkje } from "../utils/streak";
import { CategoryChip } from "../components/CategoryChip";
import { QuickAdd } from "../components/QuickAdd";
import {
  FASAR,
  PUSH_DEEMPHASIZE_KATEGORIAR,
  PUSH_DEEMPHASIZE_TITLAR,
  PUSH_MODUS_MAAL_STANDARD,
} from "../data/seedLoader";

const GRUPPER: { id: DelAvDag | "elles"; namn: string }[] = [
  { id: "morgon", namn: "Morgon" },
  { id: "ettermiddag", namn: "Ettermiddag" },
  { id: "kveld", namn: "Kveld" },
  { id: "natt", namn: "Natt" },
  { id: "elles", namn: "Elles" },
];

export function TodayScreen() {
  const settingsCol = useCollection(COLLECTIONS.settings, DEFAULT_SETTINGS);
  const itemsCol = useCollection(COLLECTIONS.routineItems, TOMME_LISTER.routineItems);
  const completionsCol = useCollection(COLLECTIONS.completions, TOMME_LISTER.completions);
  const pushLogCol = useCollection(COLLECTIONS.pushGameLog, TOMME_LISTER.pushGameLog);
  const [visQuickAdd, setVisQuickAdd] = useState(false);
  const [bloomId, setBloomId] = useState<string | null>(null);

  const settings = settingsCol.data;
  const items = itemsCol.data ?? [];
  const completions = completionsCol.data ?? [];
  const pushLog = pushLogCol.data ?? [];

  const iDag = todayISO();
  const planAnker = settings?.startdato ?? iDag;

  const dueIdag = useMemo(() => elementForDagIDag(items, FASAR, planAnker, iDag), [items, planAnker, iDag]);

  const grupperte = useMemo(() => {
    const kart = new Map<string, RutineElement[]>();
    for (const g of GRUPPER) kart.set(g.id, []);
    for (const el of dueIdag) {
      const key = el.delAvDag ?? "elles";
      kart.get(key)?.push(el);
    }
    return kart;
  }, [dueIdag]);

  const rekkje = useMemo(
    () => (settings ? berekneRekkje(items, completions, planAnker, iDag) : 0),
    [items, completions, planAnker, iDag, settings],
  );

  function erFullfort(elementId: string) {
    return completions.some((c) => c.elementId === elementId && c.dato === iDag);
  }

  async function veksleFullfoert(elementId: string) {
    const finst = erFullfort(elementId);
    if (finst) {
      const nye = completions.filter((c) => !(c.elementId === elementId && c.dato === iDag));
      await completionsCol.setData(nye);
    } else {
      const ny: Fullforing = {
        id: crypto.randomUUID(),
        elementId,
        dato: iDag,
        fullfortAt: new Date().toISOString(),
      };
      await completionsCol.setData([...completions, ny]);
      setBloomId(elementId);
      setTimeout(() => setBloomId(null), 500);
    }
  }

  async function leggTilElement(nye: RutineElement[]) {
    await itemsCol.setData([...items, ...nye]);
    setVisQuickAdd(false);
  }

  async function slettElement(id: string) {
    await itemsCol.setData(items.filter((el) => el.id !== id));
  }

  const vekeStart = startOfWeek(iDag);
  const vekesTotal = pushLog
    .filter((p) => p.dato >= vekeStart)
    .reduce((sum, p) => sum + p.antal, 0);
  const vekesmaal = settings?.vekesmaalGames ?? PUSH_MODUS_MAAL_STANDARD;

  async function leggTilGame() {
    const eksisterande = pushLog.find((p) => p.dato === iDag);
    let nye: PushGameLogg[];
    if (eksisterande) {
      nye = pushLog.map((p) => (p.dato === iDag ? { ...p, antal: p.antal + 1 } : p));
    } else {
      nye = [...pushLog, { id: crypto.randomUUID(), dato: iDag, antal: 1 }];
    }
    await pushLogCol.setData(nye);
  }

  if (!settings) return null;

  return (
    <div style={{ padding: "20px 16px 100px", maxWidth: 560, margin: "0 auto" }}>
      <header
        style={{
          background: `linear-gradient(135deg, var(--primary), var(--secondary))`,
          borderRadius: "var(--radius-lg)",
          padding: "20px 20px",
          marginBottom: 18,
          color: "var(--text)",
        }}
      >
        <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.8 }}>{formatNorsk(iDag)}</p>
        <h1 style={{ margin: "4px 0 0", fontSize: "1.5rem" }}>I dag</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
          <span style={{ fontSize: "1.1rem" }}>🌸</span>
          <span style={{ fontWeight: 700 }}>{rekkje}</span>
          <span style={{ fontSize: "0.85rem", opacity: 0.85 }}>dagars rekkje</span>
        </div>
      </header>

      {settings.pushModusAktiv && (
        <div className="card" style={{ marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, fontWeight: 700 }}>Chally-push</p>
            <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "var(--text-soft)" }}>
              {vekesTotal} / {vekesmaal} games denne veka
            </p>
          </div>
          <button className="btn-primary" onClick={leggTilGame}>
            +1 game
          </button>
        </div>
      )}

      {GRUPPER.map((g) => {
        const liste = grupperte.get(g.id) ?? [];
        if (liste.length === 0) return null;
        return (
          <section key={g.id} style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: "1rem", marginBottom: 8, color: "var(--text-soft)" }}>{g.namn}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {liste.map((el) => {
                const fullfort = erFullfort(el.id);
                const nedtona =
                  settings.pushModusAktiv &&
                  (PUSH_DEEMPHASIZE_KATEGORIAR.includes(el.kategori) || PUSH_DEEMPHASIZE_TITLAR.includes(el.tittel));
                return (
                  <div
                    key={el.id}
                    className={`card ${bloomId === el.id ? "bloom" : ""}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      opacity: nedtona ? 0.5 : 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={fullfort}
                      onChange={() => veksleFullfoert(el.id)}
                      style={{ width: 22, height: 22, accentColor: "var(--primary-strong)" }}
                    />
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 600,
                          textDecoration: fullfort ? "line-through" : "none",
                          color: fullfort ? "var(--text-soft)" : "var(--text)",
                        }}
                      >
                        {el.tittel}
                        {el.tid ? ` · ${el.tid}` : ""}
                      </p>
                      {el.notat && (
                        <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "var(--text-soft)" }}>{el.notat}</p>
                      )}
                      <div style={{ marginTop: 6 }}>
                        <CategoryChip kategoriId={el.kategori} />
                      </div>
                    </div>
                    <button className="btn-ghost" onClick={() => slettElement(el.id)} aria-label="Slett">
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {dueIdag.length === 0 && (
        <p style={{ color: "var(--text-soft)", textAlign: "center", marginTop: 40 }}>
          Ingenting planlagt i dag. Nyt roa, eller legg til noko.
        </p>
      )}

      <button
        className="btn-primary"
        onClick={() => setVisQuickAdd(true)}
        style={{
          position: "fixed",
          bottom: 78,
          right: 16,
          boxShadow: "var(--shadow-soft)",
          zIndex: 900,
        }}
      >
        + Legg til
      </button>

      {visQuickAdd && <QuickAdd onLagre={leggTilElement} onLukk={() => setVisQuickAdd(false)} />}
    </div>
  );
}
