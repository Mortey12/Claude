import { useRef, useState } from "react";
import { useCollection } from "../db/useCollection";
import { COLLECTIONS, TOMME_LISTER } from "../db/collections";
import type { FramgangInnlegg } from "../types";
import { todayISO, formatNorsk } from "../utils/dates";

export function ProgressLogScreen() {
  const loggCol = useCollection(COLLECTIONS.progressLog, TOMME_LISTER.progressLog);
  const [notat, setNotat] = useState("");
  const [foto, setFoto] = useState<string | undefined>(undefined);
  const filInput = useRef<HTMLInputElement>(null);

  const innlegg = loggCol.data ?? [];
  const sortert = [...innlegg].sort((a, b) => (a.dato < b.dato ? 1 : -1));

  function velgFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const fil = e.target.files?.[0];
    if (!fil) return;
    const reader = new FileReader();
    reader.onload = () => setFoto(reader.result as string);
    reader.readAsDataURL(fil);
  }

  async function lagre() {
    if (!notat.trim() && !foto) return;
    const nytt: FramgangInnlegg = {
      id: crypto.randomUUID(),
      dato: todayISO(),
      notat: notat.trim(),
      fotoDataUrl: foto,
      opprettaAt: new Date().toISOString(),
    };
    await loggCol.setData([nytt, ...innlegg]);
    setNotat("");
    setFoto(undefined);
    if (filInput.current) filInput.current.value = "";
  }

  async function slett(id: string) {
    await loggCol.setData(innlegg.filter((i) => i.id !== id));
  }

  return (
    <div style={{ padding: "20px 16px 100px", maxWidth: 560, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.4rem", marginBottom: 16 }}>Framgangslogg</h1>

      <div className="card" style={{ marginBottom: 20 }}>
        <textarea
          value={notat}
          onChange={(e) => setNotat(e.target.value)}
          placeholder="Notat om framgangen"
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
        <input ref={filInput} type="file" accept="image/*" onChange={velgFoto} style={{ margin: "10px 0" }} />
        {foto && (
          <img src={foto} alt="Førehandsvising" style={{ maxWidth: "100%", borderRadius: "var(--radius-sm)", marginBottom: 10 }} />
        )}
        <button className="btn-primary" onClick={lagre} disabled={!notat.trim() && !foto}>
          Lagre
        </button>
        <p style={{ fontSize: "0.75rem", color: "var(--text-soft)", marginTop: 8 }}>
          Bilete vert lagra kryptert, berre på denne eininga.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sortert.map((i) => (
          <div key={i.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-soft)" }}>{formatNorsk(i.dato)}</span>
              <button className="btn-ghost" onClick={() => slett(i.id)}>
                ✕
              </button>
            </div>
            {i.fotoDataUrl && (
              <img
                src={i.fotoDataUrl}
                alt="Framgang"
                style={{ maxWidth: "100%", borderRadius: "var(--radius-sm)", margin: "8px 0" }}
              />
            )}
            {i.notat && <p style={{ margin: 0, lineHeight: 1.5 }}>{i.notat}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
