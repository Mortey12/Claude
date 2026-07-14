// Eitt sentralt konfigurasjonspunkt for appnamn, ikon og diskresjonsinnstillingar.
// Endre desse verdiane for aa gje appen eit anna, meir tilfeldig namn/ikon paa heimeskjermen.
export const appConfig = {
  appName: "Planlegg",
  shortName: "Planlegg",
  description: "Ei enkel gjeremaalsliste",
  decoyName: "Planlegg",
  themeColor: "#9a9a9a",
  backgroundColor: "#f2f2f2",
  icon192: "icons/icon-192.png",
  icon512: "icons/icon-512.png",
  iconMaskable512: "icons/icon-maskable-512.png",
  appleTouchIcon: "icons/icon-180.png",
  autoLockMs: 60_000,
  pbkdf2Iterations: 210_000,
  minPinLength: 4,
} as const;

export type AppConfig = typeof appConfig;
