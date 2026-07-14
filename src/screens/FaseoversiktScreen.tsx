import { useCollection } from "../db/useCollection";
import { COLLECTIONS, DEFAULT_SETTINGS } from "../db/collections";
import { FASAR } from "../data/seedLoader";
import { todayISO, monthOffsetSince } from "../utils/dates";
import { erFaseAktiv } from "../utils/recurrence";

export function FaseoversiktScreen() {
  const settingsCol = useCollection(COLLECTIONS.settings, DEFAULT_SETTINGS);
  const settings = settingsCol.data;
  if (!settings || !settings.startdato) return null;

  const iDag = todayISO();
  const planAnker = settings.startdato;
  const totalOffset = monthOffsetSince(planAnker, iDag);
  const aarNummer = Math.floor((totalOffset - 1) / 12) + 1;

  return (
    <div style={{ padding: "20px 16px 100px", maxWidth: 560, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.4rem", marginBottom: 4 }}>Faseoversikt</h1>
      <p style={{ color: "var(--text-soft)", marginBottom: 20 }}>
        År {aarNummer} av planen din, forankra til {planAnker}.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {FASAR.map((fase) => {
          const aktiv = erFaseAktiv(fase, planAnker, iDag);
          return (
            <div
              key={fase.id}
              className="card"
              style={{
                border: aktiv ? "2px solid var(--primary-strong)" : "1px solid var(--border)",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h2 style={{ margin: 0, fontSize: "1.1rem" }}>{fase.namn}</h2>
                {aktiv && (
                  <span className="chip" style={{ background: "var(--sage)", color: "#fff" }}>
                    Her er du no
                  </span>
                )}
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--text-soft)" }}>
                Månad {fase.maanadFra}–{fase.maanadTil}
              </p>
              <p style={{ margin: "8px 0 0", lineHeight: 1.5 }}>{fase.skildring}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
