import type { Vekedag } from "../types";

const VEKEDAGAR: Vekedag[] = ["sun", "man", "tir", "ons", "tor", "fre", "lau"];

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseISODate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function vekedagOf(dateStr: string): Vekedag {
  const date = parseISODate(dateStr);
  return VEKEDAGAR[date.getDay()];
}

export function addDays(dateStr: string, days: number): string {
  const date = parseISODate(dateStr);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function diffInDays(fromStr: string, toStr: string): number {
  const from = parseISODate(fromStr);
  const to = parseISODate(toStr);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((to.getTime() - from.getTime()) / msPerDay);
}

/** 1-indexed month offset since anchor date, used to place seed phases on the real calendar. */
export function monthOffsetSince(anchorStr: string, dateStr: string): number {
  const anchor = parseISODate(anchorStr);
  const date = parseISODate(dateStr);
  return (date.getFullYear() - anchor.getFullYear()) * 12 + (date.getMonth() - anchor.getMonth()) + 1;
}

export function dayOfMonth(dateStr: string): number {
  return parseISODate(dateStr).getDate();
}

export function lastDayOfMonth(dateStr: string): number {
  const date = parseISODate(dateStr);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function startOfWeek(dateStr: string): string {
  const date = parseISODate(dateStr);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return toISODate(date);
}

export function formatNorsk(dateStr: string): string {
  const maanader = [
    "januar",
    "februar",
    "mars",
    "april",
    "mai",
    "juni",
    "juli",
    "august",
    "september",
    "oktober",
    "november",
    "desember",
  ];
  const date = parseISODate(dateStr);
  return `${date.getDate()}. ${maanader[date.getMonth()]} ${date.getFullYear()}`;
}

export const VEKEDAG_NAMN: Record<Vekedag, string> = {
  man: "Måndag",
  tir: "Tysdag",
  ons: "Onsdag",
  tor: "Torsdag",
  fre: "Fredag",
  lau: "Laurdag",
  sun: "Søndag",
};

export const VEKEDAG_KORT: Record<Vekedag, string> = {
  man: "Man",
  tir: "Tir",
  ons: "Ons",
  tor: "Tor",
  fre: "Fre",
  lau: "Lau",
  sun: "Søn",
};

export const VEKEDAG_REKKEFOELGJE: Vekedag[] = ["man", "tir", "ons", "tor", "fre", "lau", "sun"];
