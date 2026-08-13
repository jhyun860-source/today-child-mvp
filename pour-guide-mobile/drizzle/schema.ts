import { decimal, index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const recipes = mysqlTable("recipes", {
  id: int("id").autoincrement().primaryKey(),
  createdById: int("createdById").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  koreanName: varchar("koreanName", { length: 120 }),
  category: varchar("category", { length: 40 }).notNull().default("Classics"),
  base: varchar("base", { length: 80 }).notNull(),
  tasteTags: text("tasteTags"),
  method: varchar("method", { length: 40 }).notNull(),
  serviceTimeSeconds: int("serviceTimeSeconds").notNull().default(120),
  description: text("description"),
  glass: varchar("glass", { length: 80 }).notNull(),
  garnish: varchar("garnish", { length: 120 }).notNull(),
  imageUrl: text("imageUrl"),
  imageKey: varchar("imageKey", { length: 512 }),
  garnishImageUrl: text("garnishImageUrl"),
  garnishImageKey: varchar("garnishImageKey", { length: 512 }),
  status: mysqlEnum("status", ["active", "archived"]).notNull().default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("recipes_status_idx").on(table.status), index("recipes_created_by_idx").on(table.createdById)]);

export const recipeIngredients = mysqlTable("recipeIngredients", {
  id: int("id").autoincrement().primaryKey(),
  recipeId: int("recipeId").notNull().references(() => recipes.id, { onDelete: "cascade" }),
  sortOrder: int("sortOrder").notNull(),
  amount: decimal("amount", { precision: 8, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 24 }).notNull(),
  item: varchar("item", { length: 160 }).notNull(),
  note: varchar("note", { length: 240 }),
}, table => [index("recipe_ingredients_recipe_idx").on(table.recipeId, table.sortOrder)]);

export const recipeSteps = mysqlTable("recipeSteps", {
  id: int("id").autoincrement().primaryKey(),
  recipeId: int("recipeId").notNull().references(() => recipes.id, { onDelete: "cascade" }),
  sortOrder: int("sortOrder").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  detail: text("detail").notNull(),
  timerSeconds: int("timerSeconds"),
}, table => [index("recipe_steps_recipe_idx").on(table.recipeId, table.sortOrder)]);

export type Recipe = typeof recipes.$inferSelect;
export type RecipeIngredient = typeof recipeIngredients.$inferSelect;
export type RecipeStep = typeof recipeSteps.$inferSelect;
