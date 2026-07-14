import seedJson from "./aarsplan-seed.json";
import type { SeedFile, SeedRutineElement, SeedGjentaking } from "./seedTypes";
import type {
  RutineElement,
  Gjentaking,
  DelAvDag,
  Fase,
  Kategori,
  MaaltidDag,
  LagraMaaltid,
  SparingMaal,
  Vekedag,
} from "../types";

export const SEED = seedJson as unknown as SeedFile;

export const KATEGORIAR: Kategori[] = SEED.kategoriar;

export const FASAR: Fase[] = SEED.fasar.map((f) => ({
  id: f.id,
  namn: f.namn,
  maanadFra: f.maanad_fra,
  maanadTil: f.maanad_til,
  skildring: f.skildring,
}));

export const SPARETIPS = SEED.sparetips.tips;
export const PUSH_MODUS_MAAL_STANDARD = SEED.push_modus.maal.games_per_veke_standard;
export const PUSH_PAUSERT = SEED.push_modus.pausert_i_push;
export const PUSH_SKILDRING = SEED.push_modus.skildring;
export const PUSH_DEEMPHASIZE_KATEGORIAR = ["stemme", "rom", "jobb"];
export const PUSH_DEEMPHASIZE_TITLAR = ["Vekesrefleksjon"];

function mapGjentaking(g: SeedGjentaking): Gjentaking {
  switch (g.type) {
    case "daily":
      return { type: "daily" };
    case "weekdays":
      return { type: "weekdays" };
    case "weekly":
      return { type: "weekly", dagar: (g.dagar ?? []) as Vekedag[] };
    case "interval":
      return { type: "interval", kvarNDag: g.kvarNDag ?? 1 };
    case "monthly":
      return { type: "monthly", dagIMaanad: g.dagIMaanad ?? 1 };
    default:
      return { type: "daily" };
  }
}

function toRutineElement(
  el: SeedRutineElement,
  kjelde: RutineElement["kjelde"],
  aktiv: boolean,
  planAnker: string,
): RutineElement {
  return {
    id: crypto.randomUUID(),
    tittel: el.tittel,
    kategori: el.kategori,
    delAvDag: el.delAvDag as DelAvDag | undefined,
    tid: el.tid,
    gjentaking: mapGjentaking(el.gjentaking),
    fase: el.fase,
    notat: el.notat,
    aktiv,
    kjelde,
    opprettaAt: new Date().toISOString(),
    intervallAnker: planAnker,
  };
}

export function byggInitialeRutineelement(planAnker: string): RutineElement[] {
  const vanlege = SEED.rutineelement.map((el) => toRutineElement(el, "seed", true, planAnker));
  const pushElement = SEED.push_modus.tft_element.map((el) => toRutineElement(el, "push", false, planAnker));
  const minimumElement = SEED.push_modus.minimum_rutine.map((el) =>
    toRutineElement(el, "push-minimum", false, planAnker),
  );
  return [...vanlege, ...pushElement, ...minimumElement];
}

export function byggInitellMaaltidsplan(): MaaltidDag[] {
  return SEED.maaltidsdoeme_veke.dagar.map((d) => ({
    dag: d.dag as Vekedag,
    frukost: d.frukost,
    lunsj: d.lunsj,
    middag: d.middag,
    snack: d.snack,
  }));
}

export function byggLagraMaaltider(): LagraMaaltid[] {
  const seen = new Set<string>();
  const resultat: LagraMaaltid[] = [];
  const typar: Array<[keyof (typeof SEED.maaltidsdoeme_veke.dagar)[number], LagraMaaltid["type"]]> = [
    ["frukost", "frukost"],
    ["lunsj", "lunsj"],
    ["middag", "middag"],
    ["snack", "snack"],
  ];
  for (const dag of SEED.maaltidsdoeme_veke.dagar) {
    for (const [felt, type] of typar) {
      const namn = dag[felt] as string | undefined;
      if (namn && !seen.has(namn)) {
        seen.add(namn);
        resultat.push({ id: crypto.randomUUID(), namn, type });
      }
    }
  }
  return resultat;
}

export function byggInitialeSparemaal(): SparingMaal[] {
  return SEED.sparemaal_doeme.map((m) => ({
    id: crypto.randomUUID(),
    namn: m.namn,
    maalbeloep: m.maalbeloep,
    saldo: 0,
    notat: m.notat,
    aktiv: true,
  }));
}

export function finnKategori(id: string): Kategori {
  return KATEGORIAR.find((k) => k.id === id) ?? KATEGORIAR[KATEGORIAR.length - 1];
}
