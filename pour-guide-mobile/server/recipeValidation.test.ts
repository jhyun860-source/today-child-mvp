import { describe, expect, it } from "vitest";
import { imageUploadInput, recipeInput } from "./recipeRouter";

const validRecipe = {
  name: "House Negroni",
  koreanName: "하우스 네그로니",
  category: "Signatures",
  base: "Gin",
  tasteTags: ["Bitter", "Citrus"],
  method: "Build",
  serviceTimeSeconds: 120,
  description: "정확한 비율로 차갑게 제조합니다.",
  glass: "Rocks glass",
  garnish: "Orange peel",
  ingredients: [{ amount: 30, unit: "ml", item: "Gin", note: null }],
  steps: [{ title: "빌드", detail: "잔에 모든 재료를 계량합니다.", timerSeconds: null }],
};

describe("recipeInput", () => {
  it("accepts a complete recipe with ingredients and steps", () => {
    expect(recipeInput.parse(validRecipe)).toMatchObject({
      name: "House Negroni",
      ingredients: [{ amount: 30, unit: "ml", item: "Gin" }],
      steps: [{ title: "빌드" }],
    });
  });

  it("rejects recipes without a manufacturing step", () => {
    const result = recipeInput.safeParse({ ...validRecipe, steps: [] });
    expect(result.success).toBe(false);
  });

  it("keeps completion and garnish uploads as explicit, separate roles", () => {
    expect(imageUploadInput.parse({ recipeId: 12, role: "completion", fileName: "serve.jpg", mimeType: "image/jpeg", base64: "aGVsbG8=" }).role).toBe("completion");
    expect(imageUploadInput.parse({ recipeId: 12, role: "garnish", fileName: "garnish.webp", mimeType: "image/webp", base64: "aGVsbG8=" }).role).toBe("garnish");
  });
});
