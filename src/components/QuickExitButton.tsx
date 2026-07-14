import { useAuth } from "../state/AuthContext";

export function QuickExitButton() {
  const { lock } = useAuth();
  return (
    <button className="quick-exit-btn" onClick={lock} aria-label="Gå tilbake til gjeremålsliste" title="Rask utgang">
      ⤴
    </button>
  );
}
