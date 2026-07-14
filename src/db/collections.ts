import type {
  AppSettings,
  RutineElement,
  Fullforing,
  MaaltidDag,
  LagraMaaltid,
  HandlelisteVare,
  SparingMaal,
  SparingBidrag,
  DagbokInnlegg,
  FramgangInnlegg,
  PushGameLogg,
} from "../types";

export const COLLECTIONS = {
  settings: "settings",
  routineItems: "routineItems",
  completions: "completions",
  mealPlan: "mealPlan",
  savedMeals: "savedMeals",
  shoppingList: "shoppingList",
  savingsGoals: "savingsGoals",
  savingsContributions: "savingsContributions",
  journal: "journal",
  progressLog: "progressLog",
  pushGameLog: "pushGameLog",
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  startdato: null,
  vekesmaalGames: 45,
  pushModusAktiv: false,
  moduler: { dagbok: true, framgangslogg: true },
  moerkModus: "auto",
  rekkjeLengde: 0,
  sisteFullfortDato: null,
};

export const TOMME_LISTER = {
  routineItems: [] as RutineElement[],
  completions: [] as Fullforing[],
  mealPlan: [] as MaaltidDag[],
  savedMeals: [] as LagraMaaltid[],
  shoppingList: [] as HandlelisteVare[],
  savingsGoals: [] as SparingMaal[],
  savingsContributions: [] as SparingBidrag[],
  journal: [] as DagbokInnlegg[],
  progressLog: [] as FramgangInnlegg[],
  pushGameLog: [] as PushGameLogg[],
};
