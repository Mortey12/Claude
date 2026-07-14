import Dexie, { type Table } from "dexie";
import type { DecoyTodo } from "../types";

export interface AuthMetaRow {
  id: "auth";
  salt: string;
  iterations: number;
  verifier: { iv: string; cipher: string };
}

export interface SecurityRow {
  id: "lock";
  failCount: number;
  lockedUntil: number;
}

export interface CollectionRow {
  namn: string;
  iv: string;
  cipher: string;
}

class PlanleggDB extends Dexie {
  authMeta!: Table<AuthMetaRow, string>;
  security!: Table<SecurityRow, string>;
  collections!: Table<CollectionRow, string>;
  decoyTodos!: Table<DecoyTodo, string>;

  constructor() {
    super("planlegg-db");
    this.version(1).stores({
      authMeta: "id",
      security: "id",
      collections: "namn",
      decoyTodos: "id, opprettaAt",
    });
  }
}

export const db = new PlanleggDB();
