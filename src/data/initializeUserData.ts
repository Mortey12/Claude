import { vault } from "../db/vault";
import { COLLECTIONS, DEFAULT_SETTINGS } from "../db/collections";
import {
  byggInitialeRutineelement,
  byggInitellMaaltidsplan,
  byggLagraMaaltider,
  byggInitialeSparemaal,
} from "./seedLoader";

export async function seedNyPlan(startdato: string): Promise<void> {
  await vault.set(COLLECTIONS.settings, { ...DEFAULT_SETTINGS, startdato });
  await vault.set(COLLECTIONS.routineItems, byggInitialeRutineelement(startdato));
  await vault.set(COLLECTIONS.completions, []);
  await vault.set(COLLECTIONS.mealPlan, byggInitellMaaltidsplan());
  await vault.set(COLLECTIONS.savedMeals, byggLagraMaaltider());
  await vault.set(COLLECTIONS.shoppingList, []);
  await vault.set(COLLECTIONS.savingsGoals, byggInitialeSparemaal());
  await vault.set(COLLECTIONS.savingsContributions, []);
  await vault.set(COLLECTIONS.journal, []);
  await vault.set(COLLECTIONS.progressLog, []);
  await vault.set(COLLECTIONS.pushGameLog, []);
}
