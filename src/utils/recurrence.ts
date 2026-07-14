import type { RutineElement, Fase } from "../types";
import { vekedagOf, diffInDays, dayOfMonth, lastDayOfMonth, monthOffsetSince } from "./dates";

const VEKEDAGAR_ARBEID = ["man", "tir", "ons", "tor", "fre"];

export function erElementForfallDenneDagen(element: RutineElement, dateStr: string, planAnker: string): boolean {
  const g = element.gjentaking;
  switch (g.type) {
    case "daily":
      return true;
    case "weekdays":
      return VEKEDAGAR_ARBEID.includes(vekedagOf(dateStr));
    case "weekly":
      return g.dagar.includes(vekedagOf(dateStr));
    case "interval": {
      const anker = element.intervallAnker ?? planAnker;
      const dager = diffInDays(anker, dateStr);
      if (dager < 0) return false;
      return dager % g.kvarNDag === 0;
    }
    case "monthly": {
      const maalDag = Math.min(g.dagIMaanad, lastDayOfMonth(dateStr));
      return dayOfMonth(dateStr) === maalDag;
    }
    case "once":
      return g.dato === dateStr;
    default:
      return false;
  }
}

export function erFaseAktiv(fase: Fase, planAnker: string, dateStr: string): boolean {
  const offset = monthOffsetSince(planAnker, dateStr);
  if (offset < 1) return false;
  const syklusMaaned = ((offset - 1) % 12) + 1;
  return syklusMaaned >= fase.maanadFra && syklusMaaned <= fase.maanadTil;
}

export function finnAktivFase(fasar: Fase[], planAnker: string, dateStr: string): Fase | null {
  return fasar.find((f) => erFaseAktiv(f, planAnker, dateStr)) ?? null;
}

export function erElementFaseFreigjeven(element: RutineElement, fasar: Fase[], planAnker: string, dateStr: string): boolean {
  if (!element.fase) return true;
  const offset = monthOffsetSince(planAnker, dateStr);
  const fase = fasar.find((f) => f.id === element.fase);
  if (!fase) return true;
  const syklusMaaned = ((offset - 1) % 12) + 1;
  return offset >= 1 && syklusMaaned >= fase.maanadFra;
}

export function elementForDagIDag(
  elementer: RutineElement[],
  fasar: Fase[],
  planAnker: string,
  dateStr: string,
): RutineElement[] {
  return elementer.filter(
    (el) =>
      el.aktiv &&
      erElementFaseFreigjeven(el, fasar, planAnker, dateStr) &&
      erElementForfallDenneDagen(el, dateStr, planAnker),
  );
}
