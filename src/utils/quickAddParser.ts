import type { DelAvDag, Gjentaking, Vekedag } from "../types";
import { todayISO } from "./dates";

export interface TolkaElement {
  tittel: string;
  tid?: string;
  delAvDag?: DelAvDag;
  gjentaking: Gjentaking;
  kategori: string;
}

const VEKEDAG_ORD: Record<string, Vekedag> = {
  måndag: "man",
  maandag: "man",
  mandag: "man",
  tysdag: "tir",
  onsdag: "ons",
  torsdag: "tor",
  fredag: "fre",
  laurdag: "lau",
  lørdag: "lau",
  sundag: "sun",
  søndag: "sun",
};

const VEKEDAG_FLEIRTAL: Record<string, Vekedag> = {
  måndagar: "man",
  maandagar: "man",
  mandagar: "man",
  tysdagar: "tir",
  onsdagar: "ons",
  torsdagar: "tor",
  fredagar: "fre",
  laurdagar: "lau",
  lørdagar: "lau",
  sundagar: "sun",
  søndagar: "sun",
};

const DEL_AV_DAG_ORD: Record<string, DelAvDag> = {
  morgon: "morgon",
  morgonen: "morgon",
  ettermiddag: "ettermiddag",
  ettermiddagen: "ettermiddag",
  kveld: "kveld",
  kvelden: "kveld",
  natt: "natt",
  natta: "natt",
};

const KATEGORI_NOEKKELORD: { kategori: string; ord: string[] }[] = [
  { kategori: "hudpleie", ord: ["reinsing", "fuktkrem", "spf", "hudpleie", "solkrem", "peeling", "maske"] },
  { kategori: "haar", ord: ["barbere", "ipl", "haarfjerning", "hårfjerning", "augnebryn", "haar", "hår"] },
  { kategori: "stemme", ord: ["stemme", "stemmetrening"] },
  { kategori: "kropp", ord: ["haldning", "trening", "tøying", "toeying", "røyrsle", "roersle", "tur"] },
  { kategori: "antrekk", ord: ["antrekk", "kjole", "garderobe", "negl"] },
  { kategori: "maaltid", ord: ["frukost", "lunsj", "middag", "snack", "handleliste"] },
  { kategori: "vask", ord: ["vask", "klede", "klær", "klaer", "tørk", "toerk", "rydd"] },
  { kategori: "humoer", ord: ["dagbok", "humør", "humoer", "refleksjon"] },
  { kategori: "sparing", ord: ["spar", "sparing", "budsjett", "konto"] },
  { kategori: "rom", ord: ["rom", "pynt", "lys", "plante"] },
  { kategori: "tft", ord: ["tft", "ranked", "game", "gaming", "vod"] },
  { kategori: "jobb", ord: ["jobb", "søknad", "soeknad", "karriere"] },
  { kategori: "aerend", ord: ["ærend", "aerend", "butikk", "hente"] },
];

export function splittHurtiglegg(input: string): string[] {
  return input
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function tolkHurtigleggLinje(raw: string): TolkaElement {
  let arbeidstekst = raw;
  let tid: string | undefined;
  let delAvDag: DelAvDag | undefined;
  let gjentaking: Gjentaking = { type: "once", dato: todayISO() };

  const klokkeMatch = arbeidstekst.match(/\bkl\.?\s*(\d{1,2})(?:[:.](\d{2}))?\b/i);
  const losTidMatch = !klokkeMatch ? arbeidstekst.match(/\b(\d{1,2})[:.](\d{2})\b/) : null;
  const tidMatch = klokkeMatch ?? losTidMatch;
  if (tidMatch) {
    const t = tidMatch[0];
    const time = tidMatch[1].padStart(2, "0");
    const min = (tidMatch[2] ?? "00").padStart(2, "0");
    tid = `${time}:${min}`;
    arbeidstekst = arbeidstekst.replace(t, " ");
  }

  for (const [ord, verdi] of Object.entries(DEL_AV_DAG_ORD)) {
    const re = new RegExp(`\\b${ord}\\b`, "i");
    if (re.test(arbeidstekst)) {
      delAvDag = verdi;
      arbeidstekst = arbeidstekst.replace(re, " ");
      break;
    }
  }

  if (!delAvDag && tid) {
    const time = Number(tid.slice(0, 2));
    if (time < 10) delAvDag = "morgon";
    else if (time < 16) delAvDag = "ettermiddag";
    else if (time < 22) delAvDag = "kveld";
    else delAvDag = "natt";
  }

  let fjernRecurrenceTekst: string | null = null;

  if (/\bkvar\s*dag\b|\bdagleg\b/i.test(arbeidstekst)) {
    gjentaking = { type: "daily" };
    fjernRecurrenceTekst = arbeidstekst.match(/\bkvar\s*dag\b|\bdagleg\b/i)![0];
  } else if (/\bkvardagar\b/i.test(arbeidstekst)) {
    gjentaking = { type: "weekdays" };
    fjernRecurrenceTekst = arbeidstekst.match(/\bkvardagar\b/i)![0];
  } else if (/\bhelg(a|ar)?\b/i.test(arbeidstekst)) {
    gjentaking = { type: "weekly", dagar: ["lau", "sun"] };
    fjernRecurrenceTekst = arbeidstekst.match(/\bhelg(a|ar)?\b/i)![0];
  } else if (/\bannakvar\s*dag\b/i.test(arbeidstekst)) {
    gjentaking = { type: "interval", kvarNDag: 2 };
    fjernRecurrenceTekst = arbeidstekst.match(/\bannakvar\s*dag\b/i)![0];
  } else {
    const intervallMatch = arbeidstekst.match(/\bkvar\s+(\d+)\.?\s*dag\b/i);
    if (intervallMatch) {
      gjentaking = { type: "interval", kvarNDag: Number(intervallMatch[1]) };
      fjernRecurrenceTekst = intervallMatch[0];
    } else {
      const enkeltVekedagMatch = arbeidstekst.match(
        /\bkvar\s+(måndag|maandag|mandag|tysdag|onsdag|torsdag|fredag|laurdag|lørdag|sundag|søndag)\b/i,
      );
      if (enkeltVekedagMatch) {
        const dag = VEKEDAG_ORD[enkeltVekedagMatch[1].toLowerCase()];
        gjentaking = { type: "weekly", dagar: [dag] };
        fjernRecurrenceTekst = enkeltVekedagMatch[0];
      } else {
        for (const [ord, dag] of Object.entries(VEKEDAG_FLEIRTAL)) {
          const re = new RegExp(`\\b${ord}\\b`, "i");
          const m = arbeidstekst.match(re);
          if (m) {
            gjentaking = { type: "weekly", dagar: [dag] };
            fjernRecurrenceTekst = m[0];
            break;
          }
        }
        if (!fjernRecurrenceTekst) {
          const maanedMatch = arbeidstekst.match(/\bden\s+(\d{1,2})\.?\b/i);
          if (maanedMatch) {
            gjentaking = { type: "monthly", dagIMaanad: Number(maanedMatch[1]) };
            fjernRecurrenceTekst = maanedMatch[0];
          }
        }
      }
    }
  }

  if (fjernRecurrenceTekst) {
    arbeidstekst = arbeidstekst.replace(fjernRecurrenceTekst, " ");
  }

  let kategori = "anna";
  const lower = raw.toLowerCase();
  for (const gruppe of KATEGORI_NOEKKELORD) {
    if (gruppe.ord.some((ord) => lower.includes(ord))) {
      kategori = gruppe.kategori;
      break;
    }
  }

  const tittel = arbeidstekst
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s,.-]+|[\s,.-]+$/g, "")
    .trim();

  return {
    tittel: tittel ? tittel[0].toUpperCase() + tittel.slice(1) : raw.trim(),
    tid,
    delAvDag,
    gjentaking,
    kategori,
  };
}
