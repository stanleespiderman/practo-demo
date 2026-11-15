import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const a = readFileSync(resolve(root, "data/demo-seed.json"), "utf8");
assert.equal(
  a,
  readFileSync(
    resolve(root, "android/app/src/main/assets/seed-data.json"),
    "utf8",
  ),
  "Seed copies must be identical",
);
const seed = JSON.parse(a),
  doctors = new Set(seed.doctors.map((d) => d.id)),
  cons = new Set(seed.consultations.map((c) => c.id));
assert.equal(doctors.size, 20, "Exactly 20 fictional doctors");
for (const doctor of seed.doctors)
  assert(
    doctor.age >= 35 && doctor.age <= 55,
    doctor.id + " age must be 35-55",
  );
assert.equal(
  new Set(seed.patients.map((p) => p.id)).size,
  seed.patients.length,
);
assert.equal(doctors.size, seed.doctors.length);
assert.equal(cons.size, seed.consultations.length);
for (const c of seed.consultations) {
  assert(doctors.has(c.doctorId));
  assert(seed.patients.some((p) => p.id === c.patientId));
  assert(["active", "completed"].includes(c.status));
  assert(!Number.isNaN(Date.parse(c.date)));
}
assert.equal(
  new Set(seed.messages.map((m) => m.id)).size,
  seed.messages.length,
);
for (const m of seed.messages) {
  assert(cons.has(m.consultationId));
  assert(m.text.trim());
  assert(["patient", "doctor"].includes(m.sender));
  assert(Number.isFinite(m.timestamp));
}
for (const doctor of seed.doctors) {
  assert(
    seed.consultations.some(
      (c) => c.doctorId === doctor.id && c.status === "active",
    ),
  );
  assert(doctor.demoCode.startsWith("DEMO-"));
}
for (const a of seed.appointments) {
  const c = seed.consultations.find((c) => c.id === a.consultationId);
  assert(c);
  assert.equal(c.doctorId, a.doctorId);
  assert.equal(c.patientId, a.patientId);
  assert.equal(c.date.slice(0, 10), a.date);
  assert.equal(c.date.slice(11, 16), a.time);
}
for (const f of seed.feedback) {
  assert(doctors.has(f.doctorId));
  assert(seed.patients.some((p) => p.id === f.patientId));
}
const walk = (p) =>
  readdirSync(p, { withFileTypes: true }).flatMap((f) =>
    [".git", "node_modules", ".gradle", ".kotlin"].includes(f.name)
      ? []
      : f.isDirectory()
        ? walk(resolve(p, f.name))
        : [resolve(p, f.name)],
  );
assert.equal(
  walk(root).filter((p) => /\.(apk|aab)$/i.test(p)).length,
  0,
  "No APK/AAB may exist before approval",
);
console.log(
  "Passed: shared seed parity, references, IDs, dates, messages and APK hold.",
);
