export interface SeedGjentaking {
  type: "daily" | "weekdays" | "weekly" | "interval" | "monthly";
  dagar?: string[];
  kvarNDag?: number;
  dagIMaanad?: number;
}

export interface SeedKategori {
  id: string;
  namn: string;
  farge: string;
  ikon: string;
}

export interface SeedFase {
  id: string;
  namn: string;
  maanad_fra: number;
  maanad_til: number;
  skildring: string;
}

export interface SeedRutineElement {
  tittel: string;
  kategori: string;
  delAvDag?: string;
  tid?: string;
  gjentaking: SeedGjentaking;
  fase?: string;
  notat?: string;
}

export interface SeedMaaltidDag {
  dag: string;
  frukost?: string;
  lunsj?: string;
  middag?: string;
  snack?: string;
}

export interface SeedSparemaal {
  namn: string;
  maalbeloep: number;
  notat?: string;
}

export interface SeedPushModus {
  namn: string;
  skildring: string;
  maal: { games_per_veke_standard: number; merknad: string };
  tft_element: SeedRutineElement[];
  minimum_rutine: SeedRutineElement[];
  pausert_i_push: string[];
}

export interface SeedSparetips {
  tips: { tittel: string; tekst: string }[];
}

export interface SeedFile {
  meta: { sprak: string; versjon: number; skildring: string };
  kategoriar: SeedKategori[];
  fasar: SeedFase[];
  rutineelement: SeedRutineElement[];
  maaltidsdoeme_veke: { dagar: SeedMaaltidDag[] };
  sparemaal_doeme: SeedSparemaal[];
  push_modus: SeedPushModus;
  sparetips: SeedSparetips;
}
