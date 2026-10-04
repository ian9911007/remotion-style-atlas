import { technologyCases, projectCase } from "../technology/registry";
import data from "./published.json";
import { catalogSchema } from "./schema";
export const allStyles = catalogSchema.parse(data);
export const selectReviewPreviews = (styles: typeof allStyles) =>
  styles.filter((style) => ["rendered", "reviewed"].includes(style.status));
let reviewPreviews: typeof allStyles = [];
if (typeof window !== "undefined" && import.meta.env.DEV) {
  const { default: authoringData } = await import("./styles.json");
  reviewPreviews = selectReviewPreviews(catalogSchema.parse(authoringData));
}
export const reviewPreviewIds = reviewPreviews.map((style) => style.id);
export const catalog = [
  ...allStyles.filter((s) => s.status === "published"),
  ...reviewPreviews,
  ...technologyCases.map(projectCase),
].sort((a, b) => Number(a.id.slice(3)) - Number(b.id.slice(3)));
