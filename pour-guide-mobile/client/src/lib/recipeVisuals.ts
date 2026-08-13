export const DEFAULT_COMPLETION_IMAGE = "/assets/citrus-service-still-life.jpg";

export function resolveRecipePhotoReferences(images: { imageUrl?: string | null; garnishImageUrl?: string | null }) {
  return {
    completionImage: images.imageUrl || DEFAULT_COMPLETION_IMAGE,
    garnishImage: images.garnishImageUrl || undefined,
  };
}
