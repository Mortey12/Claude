import { useEffect, useRef, useState } from "react";
import { AuthProvider, useAuth } from "./state/AuthContext";
import { DecoyScreen } from "./screens/decoy/DecoyScreen";
import { LockScreen } from "./screens/decoy/LockScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { TodayScreen } from "./screens/TodayScreen";
import { FaseoversiktScreen } from "./screens/FaseoversiktScreen";
import { MealPlanScreen } from "./screens/MealPlanScreen";
import { SavingsScreen } from "./screens/SavingsScreen";
import { JournalScreen } from "./screens/JournalScreen";
import { ProgressLogScreen } from "./screens/ProgressLogScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { MeirScreen, type MeirValg } from "./screens/MeirScreen";
import { BottomNav, type Fane } from "./components/BottomNav";
import { QuickExitButton } from "./components/QuickExitButton";
import { useCollection } from "./db/useCollection";
import { COLLECTIONS, DEFAULT_SETTINGS } from "./db/collections";

function AppInnhald() {
  const { phase } = useAuth();
  const [visLaas, setVisLaas] = useState(false);
  const forrigePhase = useRef(phase);

  // Nullstill "vis PIN-skjerm" synkront med ein gong appen låser seg (rask utgang,
  // auto-lock i bakgrunnen), slik at det aldri blinkar ein PIN-skjerm før dekk-skjermen.
  if (forrigePhase.current !== phase) {
    forrigePhase.current = phase;
    if (phase === "locked" && visLaas) {
      setVisLaas(false);
    }
  }

  if (phase === "checking") return null;

  if (phase === "needs-setup") {
    if (!visLaas) return <DecoyScreen onReveal={() => setVisLaas(true)} />;
    return <LockScreen mode="setup" onBack={() => setVisLaas(false)} />;
  }

  if (phase === "locked") {
    if (!visLaas) return <DecoyScreen onReveal={() => setVisLaas(true)} />;
    return <LockScreen mode="unlock" onBack={() => setVisLaas(false)} />;
  }

  return <HovudApp />;
}

function HovudApp() {
  const settingsCol = useCollection(COLLECTIONS.settings, DEFAULT_SETTINGS);
  const [fane, setFane] = useState<Fane>("idag");
  const [meirValg, setMeirValg] = useState<MeirValg | null>(null);

  const settings = settingsCol.data;

  useEffect(() => {
    const rot = document.documentElement;
    if (!settings) return;
    if (settings.moerkModus === "lys") rot.setAttribute("data-theme", "light");
    else if (settings.moerkModus === "moerk") rot.setAttribute("data-theme", "dark");
    else rot.setAttribute("data-theme", "auto");
  }, [settings?.moerkModus]);

  if (!settingsCol.loading && settings && !settings.startdato) {
    return (
      <div className="unlocked-theme">
        <OnboardingScreen onFerdig={() => settingsCol.reload()} />
      </div>
    );
  }

  if (!settings) return null;

  function velgFane(f: Fane) {
    setFane(f);
    setMeirValg(null);
  }

  let innhald;
  if (fane === "meir" && meirValg) {
    if (meirValg === "dagbok") innhald = <JournalScreen />;
    else if (meirValg === "framgangslogg") innhald = <ProgressLogScreen />;
    else innhald = <SettingsScreen />;
  } else if (fane === "idag") innhald = <TodayScreen />;
  else if (fane === "fasar") innhald = <FaseoversiktScreen />;
  else if (fane === "maaltid") innhald = <MealPlanScreen />;
  else if (fane === "sparing") innhald = <SavingsScreen />;
  else innhald = <MeirScreen onVel={setMeirValg} />;

  return (
    <div className="unlocked-theme" style={{ display: "flex", flexDirection: "column", minHeight: "100svh" }}>
      <div style={{ flex: 1 }}>{innhald}</div>
      <QuickExitButton />
      <BottomNav fane={fane} onVel={velgFane} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppInnhald />
    </AuthProvider>
  );
}

export default App;
