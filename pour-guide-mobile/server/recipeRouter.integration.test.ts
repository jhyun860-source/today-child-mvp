import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  archiveRecipe: vi.fn(),
  createRecipeDetail: vi.fn(),
  getRecipeDetail: vi.fn(),
  listRecipeDetails: vi.fn(),
  updateRecipeDetail: vi.fn(),
  updateRecipeImage: vi.fn(),
}));

vi.mock("./storage", () => ({ storagePut: vi.fn() }));

import { createRecipeDetail, listRecipeDetails, updateRecipeImage } from "./db";
import { recipeRouter } from "./recipeRouter";
import { storagePut } from "./storage";

const recipeWithBothPhotos = {
  id: 12,
  createdById: 7,
  name: "House Gimlet",
  koreanName: "하우스 김렛",
  category: "Signatures",
  base: "Gin",
  tasteTags: ["Citrus"],
  method: "Shake",
  serviceTimeSeconds: 180,
  description: "차갑게 셰이크합니다.",
  glass: "Small coupe",
  garnish: "Lime wheel",
  imageUrl: "/manus-storage/recipes/12/completion/serve.jpg",
  imageKey: "recipes/12/completion/serve.jpg",
  garnishImageUrl: "/manus-storage/recipes/12/garnish/lime.jpg",
  garnishImageKey: "recipes/12/garnish/lime.jpg",
  status: "active" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  ingredients: [{ id: 1, recipeId: 12, sortOrder: 1, amount: 45, unit: "ml", item: "Gin", note: null }],
  steps: [{ id: 1, recipeId: 12, sortOrder: 1, title: "셰이크", detail: "얼음과 함께 셰이크합니다.", timerSeconds: 12 }],
};

const adminContext = {
  user: { id: 7, role: "admin", openId: "owner", name: "Owner", email: null, loginMethod: "manus", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
} as any;

describe("recipeRouter photo flow", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns completion and garnish photo URLs together in the bartender recipe list", async () => {
    vi.mocked(listRecipeDetails).mockResolvedValue([recipeWithBothPhotos] as any);
    const caller = recipeRouter.createCaller({ user: null } as any);
    const result = await caller.list();
    expect(result[0]).toMatchObject({
      imageUrl: "/manus-storage/recipes/12/completion/serve.jpg",
      garnishImageUrl: "/manus-storage/recipes/12/garnish/lime.jpg",
    });
  });

  it("stores a garnish upload under the garnish role and persists its separate URL", async () => {
    vi.mocked(storagePut).mockResolvedValue({ key: "recipes/12/garnish/lime_hash.webp", url: "/manus-storage/recipes/12/garnish/lime_hash.webp" });
    vi.mocked(updateRecipeImage).mockResolvedValue({ ...recipeWithBothPhotos, garnishImageUrl: "/manus-storage/recipes/12/garnish/lime_hash.webp" } as any);
    const caller = recipeRouter.createCaller(adminContext);
    const result = await caller.uploadImage({ recipeId: 12, role: "garnish", fileName: "lime.webp", mimeType: "image/webp", base64: "aGVsbG8=" });
    expect(storagePut).toHaveBeenCalledWith(expect.stringMatching(/^recipes\/12\/garnish\//), expect.any(Buffer), "image/webp");
    expect(updateRecipeImage).toHaveBeenCalledWith(12, "garnish", "/manus-storage/recipes/12/garnish/lime_hash.webp", "recipes/12/garnish/lime_hash.webp");
    expect(result.garnishImageUrl).toBe("/manus-storage/recipes/12/garnish/lime_hash.webp");
  });

  it("imports the visible default cocktails as editable recipes when the management list is empty", async () => {
    vi.mocked(listRecipeDetails).mockResolvedValue([]);
    vi.mocked(createRecipeDetail).mockImplementation(async (input: any) => ({ ...recipeWithBothPhotos, id: input.name.length, name: input.name } as any));
    const caller = recipeRouter.createCaller(adminContext);
    const result = await caller.initializeDefaults();
    expect(createRecipeDetail).toHaveBeenCalledTimes(4);
    expect(result.created).toBe(4);
    expect(result.recipes.map(recipe => recipe?.name)).toEqual(["Negroni", "Gimlet", "Old Fashioned", "Vermouth Tonic"]);
  });
});
