import { technologyCases, projectCase } from "../technology/registry";
import data from "./published.json";
import { catalogSchema } from "./schema";
export const allStyles = catalogSchema.parse(data);
export const catalog = [
  ...allStyles.filter((s) => s.status === "published"),
  ...technologyCases.map(projectCase),
];
