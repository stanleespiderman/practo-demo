import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import { pathFromRoot, ROOT } from "../scripts/paths.mjs";
const walk = (p) =>
  readdirSync(p, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(resolve(p, e.name)) : [resolve(p, e.name)],
  );
for (const file of walk(pathFromRoot("web"))) {
  const output = pathFromRoot("dist", relative(pathFromRoot("web"), file));
  assert.deepEqual(
    readFileSync(file),
    readFileSync(output),
    `Build drift: ${file}`,
  );
}
assert.deepEqual(
  readFileSync(pathFromRoot("data/demo-seed.json")),
  readFileSync(pathFromRoot("dist/seed-data.json")),
);
const docs = [
  "README.md",
  "CONTRIBUTING.md",
  "docs/HANDOVER.md",
  "docs/DEVELOPMENT.md",
  "docs/ARCHITECTURE.md",
  "docs/BACKLOG.md",
  "docs/GITHUB-HANDOFF.md",
  "docs/QA-CHECKLIST.md",
];
for (const file of docs) {
  const text = readFileSync(pathFromRoot(file), "utf8");
  for (const match of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^(https?:|#|mailto:)/.test(match[1])) continue;
    const target = resolve(pathFromRoot(file, ".."), match[1].split("#")[0]);
    assert(target.startsWith(ROOT));
    assert(statSync(target).isFile(), `Broken link in ${file}: ${match[1]}`);
  }
}
const build = readFileSync(
  pathFromRoot("android/app/build.gradle.kts"),
  "utf8",
);
assert(build.includes("apkApproved"), "Preserve the user approval gate");
const workflow = readFileSync(
  pathFromRoot(".github/workflows/source-checks.yml"),
  "utf8",
);
assert(
  !/assembleDebug|apkApproved=true|bundleRelease/.test(workflow),
  "Default CI must not package an Android app",
);
console.log(
  "Passed: reproducible preview, documentation links and no automatic APK packaging in CI.",
);
