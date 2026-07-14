# Planlegg

Ein privat, diskret dagleg rutine-app. Fungerer heilt offline som ein Progressive Web
App (PWA) — ingen bakgrunnstenar, ingen sky-synkronisering, ingen analyse, og appen
gjer ingen nettverkskall etter at ho er lasta første gong.

## Kome i gang lokalt

Krev [Node.js](https://nodejs.org/) 20 eller nyare.

```bash
npm install
npm run dev
```

Opne adressa som vert vist i terminalen (vanlegvis `http://localhost:5173`).

Byggje ein produksjonsversjon:

```bash
npm run build
npm run preview
```

`npm run build` køyrer typesjekk og byggjer ei ferdig, offline-klar mappe i `dist/`.

## Første gong appen opnar

Appen viser først ei heilt vanleg, kjedeleg gjeremålsliste — grå, firkanta, utan
noko personleg. Dette er dekk-skjermen.

- **Lang trykk (2 sekund) på overskrifta øvst** opnar PIN-skjermen.
- Første gong vel du ein PIN. Deretter vert du bedt om éin ting til: ei
  **startdato**. Heile årsplanen (fasar, gjentakingar, alt) vert forankra til
  denne datoen.
- Alt frå planen er redigerbart og kan slettast. Du kan leggje til eige innhald
  når som helst med **+ Legg til**-knappen, som tolkar fritekst
  (t.d. «barbere bein kvar 3 dag» eller «kjøp gåve kl 18»).

## Installere til heimeskjermen

**iPhone (Safari):**

1. Opne appen i Safari.
2. Trykk på del-ikonet (firkant med pil opp).
3. Vel «Legg til på Heim-skjerm».
4. Endre gjerne namnet i dialogen før du trykkjer «Legg til» — sjå under for
   korleis du set eit anna standardnamn.

**Android (Chrome):**

1. Opne appen i Chrome.
2. Trykk på menyen (tre prikkar) → «Legg til på startskjermen» eller «Installer app».
3. Stadfest.

Appen opnar då i sitt eige vindauge utan adressefelt, med ikonet og namnet du har
sett opp, og fungerer heilt utan nettilkopling.

## Endre dekk-namn og -ikon

Alt som gjeld namn og ikon er samla på éin stad: `src/config/appConfig.ts`.

```ts
export const appConfig = {
  appName: "Planlegg",
  decoyName: "Planlegg",
  ...
};
```

Endre `appName`/`decoyName` til noko heilt nøytralt og annleis om du vil (t.d.
«Notat» eller «Liste»). For å endre sjølve ikonet:

1. Rediger `scripts/icon-source.svg` (vanleg ikon) og
   `scripts/icon-maskable-source.svg` (Android sitt «maskable»-format med meir
   luft rundt motivet).
2. Køyr `node scripts/generate-icons.mjs` — dette skriv nye PNG-filer til
   `public/icons/`.
3. Bygg appen på nytt (`npm run build`) og reinstaller han på heimeskjermen
   (du må kanskje fjerne den gamle installasjonen først, sidan iOS/Android kan
   cache det gamle ikonet).

## Korleis krypteringa fungerer

All data — rutineelement, fullføringar, dagbok, sparing, måltidsplan,
framgangsbilete, alt — vert lagra i IndexedDB **kryptert**, og er ikkje
lesbar utan PIN-en din.

- Når du set PIN-en første gong, vert det generert eit tilfeldig salt.
  PIN-en din vert aldri lagra. I staden vert han brukt saman med saltet til
  å utleie ein AES-256-nøkkel via **PBKDF2** (Web Crypto API,
  210 000 rundar med SHA-256).
- Kvar datasamling (rutineelement, dagbok, sparemål, osv.) vert kryptert som
  éin blokk med **AES-GCM** før ho vert skriven til IndexedDB, med ein ny
  tilfeldig IV kvar gong.
- Nøkkelen finst berre i minnet medan appen er open, og vert sletta med ein
  gong appen låser seg. Ingenting av dette forlèt eininga di — det er ingen
  server å sende det til.
- Appen låser seg automatisk **kvar gong ho opnar**, og **60 sekund etter at
  ho hamnar i bakgrunnen**. Feil PIN gir aukande ventetid (dobling for kvart
  feilforsøk) for å gjere gjetting upraktisk.
- Éin ting er *ikkje* kryptert: sjølve dekk-gjeremålslista (den kjedelege
  lista du ser før opplåsing). Ho inneheld berre det du sjølv skriv der, og
  må vere lesbar utan PIN for at dekket skal fungere.
- **Rask utgang**-knappen (øvst i høgre hjørne på alle opplåste skjermar)
  låser appen momentant og tek deg tilbake til dekk-skjermen.

Merk: det finst i dag ingen måte å endre PIN på inne i appen, sidan alt
krypterte innhald er bunde til nøkkelen frå den opphavlege PIN-en. Vil du
byrje heilt på nytt, kan du slette nettlesardata for appen (eller avinstallere
og installere ho på nytt).

## Tech-stack

React + Vite + TypeScript, `vite-plugin-pwa` for installasjon og
offline-cache, [Dexie](https://dexie.org/) som eit lag over IndexedDB,
Web Crypto for kryptering, og lokalt pakka skrifttypar
(Nunito og Quicksand via `@fontsource`). Ingen CDN-ar, ingen eksterne
skrifttypar, ingen sporing.
