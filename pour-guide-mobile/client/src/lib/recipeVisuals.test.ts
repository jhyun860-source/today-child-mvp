import { describe, expect, it } from "vitest";
import { DEFAULT_COMPLETION_IMAGE, resolveRecipePhotoReferences } from "./recipeVisuals";

describe("resolveRecipePhotoReferences", () => {
  it("keeps completion and garnish images as distinct bartender references", () => {
    expect(resolveRecipePhotoReferences({ imageUrl: "/manus-storage/serve.jpg", garnishImageUrl: "/manus-storage/garnish.jpg" })).toEqual({
      completionImage: "/manus-storage/serve.jpg",
      garnishImage: "/manus-storage/garnish.jpg",
    });
  });

  it("uses the completion fallback without inventing a garnish image", () => {
    expect(resolveRecipePhotoReferences({})).toEqual({ completionImage: DEFAULT_COMPLETION_IMAGE, garnishImage: undefined });
  });
});
