import type { RutineElement } from "../types";

export function bytPushModus(items: RutineElement[], slaaPaa: boolean): RutineElement[] {
  return items.map((el) => {
    if (el.kategori === "tft" && el.kjelde === "seed") {
      return { ...el, aktiv: !slaaPaa };
    }
    if (el.kjelde === "push" || el.kjelde === "push-minimum") {
      return { ...el, aktiv: slaaPaa };
    }
    return el;
  });
}
