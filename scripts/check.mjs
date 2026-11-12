import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { pathFromRoot } from "./paths.mjs";
const run = (args) => {
  const result = spawnSync(process.execPath, args, {
    stdio: "inherit",
    cwd: pathFromRoot(),
  });
  if (result.status !== 0) process.exit(result.status || 1);
};
run(["scripts/sync-seed.mjs", "--check"]);
run(["scripts/build-preview.mjs"]);
for (const dir of ["web", "scripts", "tests"]) {
  for (const entry of readdirSync(pathFromRoot(dir), { withFileTypes: true })) {
    if (entry.isFile() && /\.(m?js)$/.test(entry.name))
      run(["--check", `${dir}/${entry.name}`]);
  }
}
run(["tests/check-source.mjs"]);
run(["tests/check-handover.mjs"]);
console.log(
  "All source/handover checks passed. This does not compile Android or test a backend.",
);
