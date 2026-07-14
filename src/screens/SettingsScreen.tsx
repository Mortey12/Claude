import { useCollection } from "../db/useCollection";
import { COLLECTIONS, DEFAULT_SETTINGS, TOMME_LISTER } from "../db/collections";
import { appConfig } from "../config/appConfig";
import { bytPushModus } from "../utils/pushMode";
import { CategoryChip } from "../components/CategoryChip";
import { useAuth } from "../state/AuthContext";
import { PUSH_MODUS_MAAL_STANDARD, PUSH_SKILDRING } from "../data/seedLoader";

export function SettingsScreen() {
  const settingsCol = useCollection(COLLECTIONS.settings, DEFAULT_SETTINGS);
  const itemsCol = useCollection(COLLECTIONS.routineItems, TOMME_LISTER.routineItems);
  const { lock } = useAuth();

  const settings = settingsCol.data;
  const items = itemsCol.data ?? [];

  if (!settings) return null;

  async function settModul(modul: "dagbok" | "framgangslogg", verdi: boolean) {
    await settingsCol.setData({ ...settings!, moduler: { ...settings!.moduler, [modul]: verdi } });
  }

  async function settMoerkModus(verdi: "auto" | "lys" | "moerk") {
    await settingsCol.setData({ ...settings!, moerkModus: verdi });
  }

  async function vekslPushModus() {
    const slaaPaa = !settings!.pushModusAktiv;
    await settingsCol.setData({ ...settings!, pushModusAktiv: slaaPaa });
    await itemsCol.setData(bytPushModus(items, slaaPaa));
  }

  async function settVekesmaal(verdi: number) {
    await settingsCol.setData({ ...settings!, vekesmaalGames: verdi });
  }

  async function vekslAktiv(id: string) {
    await itemsCol.setData(items.map((el) => (el.id === id ? { ...el, aktiv: !el.aktiv } : el)));
  }

  async function slettElement(id: string) {
    await itemsCol.setData(items.filter((el) => el.id !== id));
  }

  const synlegeElement = items.filter((el) => el.kjelde !== "push" && el.kjelde !== "push-minimum");

  return (
    <div style={{ padding: "20px 16px 100px", maxWidth: 560, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.4rem", marginBottom: 16 }}>Innstillingar</h1>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Utsjånad</h2>
        <label style={{ display: "block", marginBottom: 8 }}>
          Mørk modus
          <select
            value={settings.moerkModus}
            onChange={(e) => settMoerkModus(e.target.value as "auto" | "lys" | "moerk")}
            style={{ display: "block", marginTop: 4, padding: "6px 8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}
          >
            <option value="auto">Følg systemet</option>
            <option value="lys">Alltid lys</option>
            <option value="moerk">Alltid mørk</option>
          </select>
        </label>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Modular</h2>
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <input type="checkbox" checked={settings.moduler.dagbok} onChange={(e) => settModul("dagbok", e.target.checked)} />
          Dagbok
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={settings.moduler.framgangslogg}
            onChange={(e) => settModul("framgangslogg", e.target.checked)}
          />
          Framgangslogg
        </label>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Chally-push</h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-soft)", lineHeight: 1.5 }}>{PUSH_SKILDRING}</p>
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <input type="checkbox" checked={settings.pushModusAktiv} onChange={vekslPushModus} />
          Aktiver push-modus
        </label>
        <label style={{ display: "block", fontSize: "0.85rem" }}>
          Vekesmål (games)
          <input
            type="number"
            value={settings.vekesmaalGames}
            min={1}
            onChange={(e) => settVekesmaal(Number(e.target.value) || PUSH_MODUS_MAAL_STANDARD)}
            style={{ display: "block", marginTop: 4, padding: "6px 8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", width: 100 }}
          />
        </label>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Rutineelement</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto" }}>
          {synlegeElement.map((el) => (
            <div key={el.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={el.aktiv} onChange={() => vekslAktiv(el.id)} title="Aktiv" />
              <span style={{ flex: 1, fontSize: "0.9rem", opacity: el.aktiv ? 1 : 0.5 }}>{el.tittel}</span>
              <CategoryChip kategoriId={el.kategori} />
              <button className="btn-ghost" onClick={() => slettElement(el.id)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Personvern</h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-soft)", lineHeight: 1.5 }}>
          All data er lagra kryptert på denne eininga med {appConfig.pbkdf2Iterations.toLocaleString("nb-NO")}{" "}
          PBKDF2-rundar og AES-GCM. Appen låser seg automatisk etter {appConfig.autoLockMs / 1000} sekund i
          bakgrunnen.
        </p>
        <button className="btn-secondary" onClick={lock}>
          Lås appen no
        </button>
      </section>
    </div>
  );
}
