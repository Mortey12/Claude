export type DelAvDag = "morgon" | "ettermiddag" | "kveld" | "natt";

export type Vekedag = "man" | "tir" | "ons" | "tor" | "fre" | "lau" | "sun";

export type Gjentaking =
  | { type: "daily" }
  | { type: "weekdays" }
  | { type: "weekly"; dagar: Vekedag[] }
  | { type: "interval"; kvarNDag: number }
  | { type: "monthly"; dagIMaanad: number }
  | { type: "once"; dato: string };

export interface Kategori {
  id: string;
  namn: string;
  farge: string;
  ikon: string;
}

export interface Fase {
  id: string;
  namn: string;
  maanadFra: number;
  maanadTil: number;
  skildring: string;
}

export interface RutineElement {
  id: string;
  tittel: string;
  kategori: string;
  delAvDag?: DelAvDag;
  tid?: string;
  gjentaking: Gjentaking;
  fase?: string;
  notat?: string;
  aktiv: boolean;
  kjelde: "seed" | "bruker" | "push" | "push-minimum";
  opprettaAt: string;
  intervallAnker?: string;
}

export interface Fullforing {
  id: string;
  elementId: string;
  dato: string;
  fullfortAt: string;
}

export interface AppSettings {
  startdato: string | null;
  fornamn?: string;
  vekesmaalGames: number;
  pushModusAktiv: boolean;
  moduler: {
    dagbok: boolean;
    framgangslogg: boolean;
  };
  moerkModus: "auto" | "lys" | "moerk";
  rekkjeLengde: number;
  sisteFullfortDato: string | null;
}

export interface MaaltidDag {
  dag: Vekedag;
  frukost?: string;
  lunsj?: string;
  middag?: string;
  snack?: string;
}

export interface LagraMaaltid {
  id: string;
  namn: string;
  type: "frukost" | "lunsj" | "middag" | "snack";
}

export interface HandlelisteVare {
  id: string;
  namn: string;
  kryssa: boolean;
  kjelde: "auto" | "manuell";
}

export interface SparingMaal {
  id: string;
  namn: string;
  maalbeloep: number;
  saldo: number;
  notat?: string;
  aktiv: boolean;
}

export interface SparingBidrag {
  id: string;
  maalId: string;
  beloep: number;
  dato: string;
  notat?: string;
}

export interface DagbokInnlegg {
  id: string;
  dato: string;
  tekst: string;
  humoer?: string;
  opprettaAt: string;
}

export interface FramgangInnlegg {
  id: string;
  dato: string;
  notat: string;
  fotoDataUrl?: string;
  opprettaAt: string;
}

export interface PushGameLogg {
  id: string;
  dato: string;
  antal: number;
}

export interface DecoyTodo {
  id: string;
  tekst: string;
  fullfoert: boolean;
  opprettaAt: string;
}
