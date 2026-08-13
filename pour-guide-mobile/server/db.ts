import { asc, desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, recipeIngredients, recipes, recipeSteps, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export type RecipeWritePayload = {
  name: string;
  koreanName?: string | null;
  category: string;
  base: string;
  tasteTags: string[];
  method: string;
  serviceTimeSeconds: number;
  description?: string | null;
  glass: string;
  garnish: string;
  ingredients: Array<{ amount: number; unit: string; item: string; note?: string | null }>;
  steps: Array<{ title: string; detail: string; timerSeconds?: number | null }>;
};

type RecipeRow = typeof recipes.$inferSelect;
type IngredientRow = typeof recipeIngredients.$inferSelect;
type StepRow = typeof recipeSteps.$inferSelect;

function parseTags(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === "string") : [];
  } catch {
    return [];
  }
}

function hydrateRecipe(row: RecipeRow, ingredients: IngredientRow[], steps: StepRow[]) {
  return {
    ...row,
    tasteTags: parseTags(row.tasteTags),
    ingredients: ingredients.map(ingredient => ({ ...ingredient, amount: Number(ingredient.amount) })),
    steps,
  };
}

async function getRecipeChildren(recipeIds: number[]) {
  const db = await getDb();
  if (!db || recipeIds.length === 0) return { ingredients: [] as IngredientRow[], steps: [] as StepRow[] };
  const [ingredients, steps] = await Promise.all([
    db.select().from(recipeIngredients).where(inArray(recipeIngredients.recipeId, recipeIds)).orderBy(asc(recipeIngredients.recipeId), asc(recipeIngredients.sortOrder)),
    db.select().from(recipeSteps).where(inArray(recipeSteps.recipeId, recipeIds)).orderBy(asc(recipeSteps.recipeId), asc(recipeSteps.sortOrder)),
  ]);
  return { ingredients, steps };
}

export async function listRecipeDetails() {
  const db = await getDb();
  if (!db) return [];
  const recipeRows = await db.select().from(recipes).orderBy(desc(recipes.updatedAt));
  const { ingredients, steps } = await getRecipeChildren(recipeRows.map(row => row.id));
  return recipeRows.map(row => hydrateRecipe(row, ingredients.filter(item => item.recipeId === row.id), steps.filter(item => item.recipeId === row.id)));
}

export async function getRecipeDetail(recipeId: number) {
  const db = await getDb();
  if (!db) return null;
  const recipeRows = await db.select().from(recipes).where(eq(recipes.id, recipeId)).limit(1);
  const recipe = recipeRows[0];
  if (!recipe) return null;
  const { ingredients, steps } = await getRecipeChildren([recipeId]);
  return hydrateRecipe(recipe, ingredients, steps);
}

async function replaceRecipeChildren(recipeId: number, input: RecipeWritePayload) {
  const db = await getDb();
  if (!db) throw new Error("Database connection is unavailable");
  await db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, recipeId));
  await db.delete(recipeSteps).where(eq(recipeSteps.recipeId, recipeId));
  if (input.ingredients.length > 0) {
    await db.insert(recipeIngredients).values(input.ingredients.map((ingredient, index) => ({
      recipeId,
      sortOrder: index + 1,
      amount: String(ingredient.amount),
      unit: ingredient.unit,
      item: ingredient.item,
      note: ingredient.note || null,
    })));
  }
  if (input.steps.length > 0) {
    await db.insert(recipeSteps).values(input.steps.map((step, index) => ({
      recipeId,
      sortOrder: index + 1,
      title: step.title,
      detail: step.detail,
      timerSeconds: step.timerSeconds || null,
    })));
  }
}

function recipeValues(input: RecipeWritePayload) {
  return {
    name: input.name,
    koreanName: input.koreanName || null,
    category: input.category,
    base: input.base,
    tasteTags: JSON.stringify(input.tasteTags),
    method: input.method,
    serviceTimeSeconds: input.serviceTimeSeconds,
    description: input.description || null,
    glass: input.glass,
    garnish: input.garnish,
  };
}

export async function createRecipeDetail(input: RecipeWritePayload, createdById: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection is unavailable");
  const result = await db.insert(recipes).values({ ...recipeValues(input), createdById });
  const recipeId = Number((result as unknown as [{ insertId: number }])[0].insertId);
  await replaceRecipeChildren(recipeId, input);
  return getRecipeDetail(recipeId);
}

export async function updateRecipeDetail(recipeId: number, input: RecipeWritePayload) {
  const db = await getDb();
  if (!db) throw new Error("Database connection is unavailable");
  await db.update(recipes).set(recipeValues(input)).where(eq(recipes.id, recipeId));
  await replaceRecipeChildren(recipeId, input);
  return getRecipeDetail(recipeId);
}

export async function updateRecipeImage(recipeId: number, role: "completion" | "garnish", imageUrl: string, imageKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database connection is unavailable");
  const values = role === "completion" ? { imageUrl, imageKey } : { garnishImageUrl: imageUrl, garnishImageKey: imageKey };
  await db.update(recipes).set(values).where(eq(recipes.id, recipeId));
  return getRecipeDetail(recipeId);
}

export async function archiveRecipe(recipeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection is unavailable");
  await db.update(recipes).set({ status: "archived" }).where(eq(recipes.id, recipeId));
  return { success: true } as const;
}
