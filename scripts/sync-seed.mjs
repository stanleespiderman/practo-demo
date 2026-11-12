import { readFileSync, writeFileSync } from "node:fs";
import { pathFromRoot } from "./paths.mjs";
const source = pathFromRoot("data/demo-seed.json");
const target = pathFromRoot("android/app/src/main/assets/seed-data.json");
const canonical = readFileSync(source, "utf8");
JSON.parse(canonical);
if (process.argv.includes("--check")) {
  if (readFileSync(target, "utf8") !== canonical) {
    console.error(
      "Android seed is out of sync. Run npm run seed:sync and commit both files.",
    );
    process.exit(1);
  }
  console.log("Seed copies match the canonical data/demo-seed.json.");
} else {
  writeFileSync(target, canonical);
  console.log(
    "Updated the Android seed. Rebuild the browser preview to refresh dist/.",
  );
}
