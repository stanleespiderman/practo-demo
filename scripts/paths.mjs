import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const pathFromRoot = (...parts) => resolve(ROOT, ...parts);
