import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { archiveRecipe, createRecipeDetail, getRecipeDetail, listRecipeDetails, updateRecipeDetail, updateRecipeImage } from "./db";
import { defaultBarRecipes } from "./defaultRecipes";
import { storagePut } from "./storage";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";

const ingredientInput = z.object({
  amount: z.number().positive(),
  unit: z.string().trim().min(1).max(24),
  item: z.string().trim().min(1).max(160),
  note: z.string().trim().max(240).optional().nullable(),
});

const stepInput = z.object({
  title: z.string().trim().min(1).max(160),
  detail: z.string().trim().min(1).max(2000),
  timerSeconds: z.number().int().positive().max(3600).optional().nullable(),
});

export const recipeInput = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(1).max(120),
  koreanName: z.string().trim().max(120).optional().nullable(),
  category: z.string().trim().min(1).max(40),
  base: z.string().trim().min(1).max(80),
  tasteTags: z.array(z.string().trim().min(1).max(40)).max(8),
  method: z.string().trim().min(1).max(40),
  serviceTimeSeconds: z.number().int().positive().max(3600),
  description: z.string().trim().max(2000).optional().nullable(),
  glass: z.string().trim().min(1).max(80),
  garnish: z.string().trim().min(1).max(120),
  ingredients: z.array(ingredientInput).min(1).max(30),
  steps: z.array(stepInput).min(1).max(20),
});

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
export const imageUploadInput = z.object({
  recipeId: z.number().int().positive(),
  role: z.enum(["completion", "garnish"]),
  fileName: z.string().trim().min(1).max(120),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  base64: z.string().min(1).max(8_000_000),
});

export const recipeRouter = router({
  list: publicProcedure.query(() => listRecipeDetails()),
  get: publicProcedure.input(z.object({ id: z.number().int().positive() })).query(({ input }) => getRecipeDetail(input.id)),
  save: adminProcedure.input(recipeInput).mutation(async ({ input, ctx }) => {
    const { id, ...payload } = input;
    const result = id ? await updateRecipeDetail(id, payload) : await createRecipeDetail(payload, ctx.user.id);
    if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "레시피를 찾을 수 없습니다." });
    return result;
  }),
  archive: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => archiveRecipe(input.id)),
  initializeDefaults: adminProcedure.mutation(async ({ ctx }) => {
    const existing = await listRecipeDetails();
    if (existing.length > 0) return { created: 0, recipes: existing };
    const recipes = await Promise.all(defaultBarRecipes.map(recipe => createRecipeDetail(recipe, ctx.user.id)));
    return { created: recipes.length, recipes: recipes.filter(Boolean) };
  }),
  uploadImage: adminProcedure.input(imageUploadInput).mutation(async ({ input }) => {
    if (!allowedImageTypes.includes(input.mimeType)) throw new TRPCError({ code: "BAD_REQUEST", message: "JPG, PNG, WEBP 파일만 업로드할 수 있습니다." });
    const encoded = input.base64.includes(",") ? input.base64.split(",").pop() ?? "" : input.base64;
    const bytes = Buffer.from(encoded, "base64");
    if (!bytes.length || bytes.length > 5 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "사진은 5MB 이하로 업로드해 주세요." });
    const safeFileName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
    const { key, url } = await storagePut(`recipes/${input.recipeId}/${input.role}/${Date.now()}-${safeFileName}`, bytes, input.mimeType);
    const recipe = await updateRecipeImage(input.recipeId, input.role, url, key);
    if (!recipe) throw new TRPCError({ code: "NOT_FOUND", message: "레시피를 찾을 수 없습니다." });
    return recipe;
  }),
});
