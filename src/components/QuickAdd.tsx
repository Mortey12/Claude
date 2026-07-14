import { useState } from "react";
import type { DelAvDag, Gjentaking, RutineElement, Vekedag } from "../types";
import { splittHurtiglegg, tolkHurtigleggLinje, type TolkaElement } from "../utils/quickAddParser";
import { KATEGORIAR } from "../data/seedLoader";
import { todayISO } from "../utils/dates";
import { VEKEDAG_KORT, VEKEDAG_REKKEFOELGJE } from "../utils/dates";

interface Props {
  onLagre: (element: RutineElement[]) => Promise<void>;
  onLukk: () => void;
}

const DEL_AV_DAG_VAL: DelAvDag[] = ["morgon", "ettermiddag", "kveld", "natt"];

export function QuickAdd({ onLagre, onLukk }: Props) {
  const [tekst, setTekst] = useState("");
  const [tolka, setTolka] = useState<TolkaElement[] | null>(null);
  const [lagrar, setLagrar] = useState(false);

  function handleTolk() {
    const linjer = splittHurtiglegg(tekst);
    setTolka(linjer.map(tolkHurtigleggLinje));
  }

  function oppdaterElement(i: number, delvis: Partial<TolkaElement>) {
    setTolka((prev) => (prev ? prev.map((el, idx) => (idx === i ? { ...el, ...delvis } : el)) : prev));
  }

  function fjernElement(i: number) {
    setTolka((prev) => (prev ? prev.filter((_, idx) => idx !== i) : prev));
  }

  async function lagreAlle() {
    if (!tolka || tolka.length === 0) return;
    setLagrar(true);
    const now = new Date().toISOString();
    const nye: RutineElement[] = tolka.map((el) => ({
      id: crypto.randomUUID(),
      tittel: el.tittel,
      kategori: el.kategori,
      delAvDag: el.delAvDag,
      tid: el.tid,
      gjentaking: el.gjentaking,
      aktiv: true,
      kjelde: "bruker",
      opprettaAt: now,
      intervallAnker: todayISO(),
    }));
    await onLagre(nye);
    setLagrar(false);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(61,52,56,0.35)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 2000,
      }}
      onClick={onLukk}
    >
      <div
        className="card fade-in-up"
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "88svh",
          overflowY: "auto",
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          margin: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0 }}>Legg til</h2>

        {!tolka && (
          <>
            <textarea
              autoFocus
              value={tekst}
              onChange={(e) => setTekst(e.target.value)}
              placeholder={"Skriv fritt, t.d. «barbere bein kvar 3 dag» eller «kjøp gåve kl 18»\nFleire ting? Skil med linjeskift eller komma."}
              rows={4}
              style={{
                width: "100%",
                borderRadius: "var(--radius-sm)",
                border: "1.5px solid var(--border)",
                padding: 12,
                fontSize: "1rem",
                resize: "vertical",
                background: "var(--bg)",
                color: "var(--text)",
              }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button className="btn-secondary" onClick={onLukk}>
                Avbryt
              </button>
              <button className="btn-primary" onClick={handleTolk} disabled={!tekst.trim()}>
                Tolk
              </button>
            </div>
          </>
        )}

        {tolka && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {tolka.map((el, i) => (
                <ElementRedigering
                  key={i}
                  element={el}
                  onEndre={(delvis) => oppdaterElement(i, delvis)}
                  onFjern={() => fjernElement(i)}
                />
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button className="btn-secondary" onClick={() => setTolka(null)}>
                Tilbake
              </button>
              <button className="btn-primary" onClick={lagreAlle} disabled={lagrar || tolka.length === 0}>
                {lagrar ? "Lagrar …" : `Lagre (${tolka.length})`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ElementRedigering({
  element,
  onEndre,
  onFjern,
}: {
  element: TolkaElement;
  onEndre: (delvis: Partial<TolkaElement>) => void;
  onFjern: () => void;
}) {
  const kategori = KATEGORIAR.find((k) => k.id === element.kategori) ?? KATEGORIAR[KATEGORIAR.length - 1];

  function endreGjentakingType(type: Gjentaking["type"]) {
    let g: Gjentaking;
    switch (type) {
      case "daily":
        g = { type: "daily" };
        break;
      case "weekdays":
        g = { type: "weekdays" };
        break;
      case "weekly":
        g = { type: "weekly", dagar: ["man"] };
        break;
      case "interval":
        g = { type: "interval", kvarNDag: 2 };
        break;
      case "monthly":
        g = { type: "monthly", dagIMaanad: 1 };
        break;
      case "once":
      default:
        g = { type: "once", dato: todayISO() };
    }
    onEndre({ gjentaking: g });
  }

  return (
    <div
      style={{
        border: `1.5px solid ${kategori.farge}`,
        borderRadius: "var(--radius-md)",
        padding: 12,
        background: `${kategori.farge}22`,
      }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <input
          value={element.tittel}
          onChange={(e) => onEndre({ tittel: e.target.value })}
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--text)",
          }}
        />
        <button onClick={onFjern} className="btn-ghost" aria-label="Fjern">
          ✕
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <select
          value={element.kategori}
          onChange={(e) => onEndre({ kategori: e.target.value })}
          style={selectStyle}
        >
          {KATEGORIAR.map((k) => (
            <option key={k.id} value={k.id}>
              {k.namn}
            </option>
          ))}
        </select>

        <select
          value={element.delAvDag ?? ""}
          onChange={(e) => onEndre({ delAvDag: (e.target.value || undefined) as DelAvDag | undefined })}
          style={selectStyle}
        >
          <option value="">Del av dag</option>
          {DEL_AV_DAG_VAL.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="tt:mm"
          value={element.tid ?? ""}
          onChange={(e) => onEndre({ tid: e.target.value || undefined })}
          style={{ ...selectStyle, width: 70 }}
        />

        <select
          value={element.gjentaking.type}
          onChange={(e) => endreGjentakingType(e.target.value as Gjentaking["type"])}
          style={selectStyle}
        >
          <option value="once">Éin gong</option>
          <option value="daily">Kvar dag</option>
          <option value="weekdays">Kvardagar</option>
          <option value="weekly">Vekedagar</option>
          <option value="interval">Kvar N. dag</option>
          <option value="monthly">Månadleg</option>
        </select>

        {element.gjentaking.type === "weekly" && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {VEKEDAG_REKKEFOELGJE.map((d) => {
              const valgt = (element.gjentaking as { type: "weekly"; dagar: Vekedag[] }).dagar.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    const dagar = (element.gjentaking as { type: "weekly"; dagar: Vekedag[] }).dagar;
                    const nye = valgt ? dagar.filter((x) => x !== d) : [...dagar, d];
                    onEndre({ gjentaking: { type: "weekly", dagar: nye } });
                  }}
                  style={{
                    ...selectStyle,
                    padding: "4px 8px",
                    background: valgt ? "var(--primary)" : "var(--surface)",
                  }}
                >
                  {VEKEDAG_KORT[d]}
                </button>
              );
            })}
          </div>
        )}

        {element.gjentaking.type === "interval" && (
          <input
            type="number"
            min={2}
            value={(element.gjentaking as { type: "interval"; kvarNDag: number }).kvarNDag}
            onChange={(e) =>
              onEndre({ gjentaking: { type: "interval", kvarNDag: Number(e.target.value) || 2 } })
            }
            style={{ ...selectStyle, width: 60 }}
          />
        )}

        {element.gjentaking.type === "monthly" && (
          <input
            type="number"
            min={1}
            max={31}
            value={(element.gjentaking as { type: "monthly"; dagIMaanad: number }).dagIMaanad}
            onChange={(e) =>
              onEndre({ gjentaking: { type: "monthly", dagIMaanad: Number(e.target.value) || 1 } })
            }
            style={{ ...selectStyle, width: 60 }}
          />
        )}
      </div>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  padding: "6px 8px",
  fontSize: "0.85rem",
  background: "var(--surface)",
  color: "var(--text)",
};
