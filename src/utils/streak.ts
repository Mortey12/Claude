import type { RutineElement, Fullforing } from "../types";
import { FASAR } from "../data/seedLoader";
import { elementForDagIDag } from "./recurrence";
import { addDays } from "./dates";

const MAKS_DAGAR_TILBAKE = 400;

export function berekneRekkje(
  items: RutineElement[],
  completions: Fullforing[],
  planAnker: string,
  iDag: string,
): number {
  let rekkje = 0;
  let dato = iDag;

  for (let i = 0; i < MAKS_DAGAR_TILBAKE; i++) {
    if (dato < planAnker) break;
    const dueItems = elementForDagIDag(items, FASAR, planAnker, dato);
    if (dueItems.length === 0) {
      dato = addDays(dato, -1);
      continue;
    }
    const alleFullfort = dueItems.every((it) =>
      completions.some((c) => c.elementId === it.id && c.dato === dato),
    );
    if (!alleFullfort) {
      if (dato === iDag) {
        dato = addDays(dato, -1);
        continue;
      }
      break;
    }
    rekkje++;
    dato = addDays(dato, -1);
  }

  return rekkje;
}
