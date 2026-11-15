/* Practo-style prescription sheet. Fictional demo data only: every sheet carries DEMO marks and no signature. */
const FONT = '"Segoe UI", "Helvetica Neue", Roboto, Arial, sans-serif';
const C = {
  navy: "#2b3a9c",
  ink: "#171a2b",
  label: "#4f5a8a",
  muted: "#6d7597",
  rule: "#e7e9f1",
  band: "#eef0f6",
  cyan: "#14b8e6",
  demoBg: "#fff0db",
  demoInk: "#a8701f",
};
const W = 560;
const PAD = 28;
const MAX_CANVAS_PX = 16000;
const MAX_FIELD = 4000;

const clip = (s) => {
  s = String(s ?? "").replace(/\r/g, "");
  return s.length > MAX_FIELD ? s.slice(0, MAX_FIELD) + "…" : s;
};
const lines = (s) =>
  clip(s)
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

/** "Name - instruction" (also – — | :) becomes two columns; plain lines stay name-only. */
export function parseMedicines(text) {
  return lines(text).map((raw) => {
    const line = raw.replace(/^\s*(?:\d+\s*[.)]|[-•*])\s+/, "");
    const m =
      line.match(/^(.+?)\s+[-–—|]\s+(.+)$/) ||
      line.match(/^([^:]{2,60}):\s*(.+)$/);
    return m
      ? { name: m[1].trim(), detail: m[2].trim() }
      : { name: line, detail: "" };
  });
}

function wrap(ctx, text, maxW) {
  const out = [];
  for (const para of String(text).split("\n")) {
    let cur = "";
    for (const word of para.split(/\s+/).filter(Boolean)) {
      let w = word;
      while (ctx.measureText(w).width > maxW && w.length > 1) {
        let n = w.length - 1;
        while (n > 1 && ctx.measureText(w.slice(0, n)).width > maxW) n--;
        if (cur) {
          out.push(cur);
          cur = "";
        }
        out.push(w.slice(0, n));
        w = w.slice(n);
      }
      const next = cur ? cur + " " + w : w;
      if (cur && ctx.measureText(next).width > maxW) {
        out.push(cur);
        cur = w;
      } else cur = next;
    }
    out.push(cur);
  }
  return out.length ? out : [""];
}

/** Draws (or only measures, when draw is false) the sheet and returns its height in layout units. */
function paint(ctx, m, drawPass) {
  let draw = drawPass;
  let y = 0;
  const font = (size, weight = 400) =>
    (ctx.font = `${weight} ${size}px ${FONT}`);
  const text = (t, x, ty, color, align = "left") => {
    if (!draw) return;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(t, x, ty);
  };
  const rect = (x, ry, w, h, color) => {
    if (!draw) return;
    ctx.fillStyle = color;
    ctx.fillRect(x, ry, w, h);
  };
  ctx.textBaseline = "alphabetic";
  /** Wrapped block; returns height used. */
  const block = (t, x, top, maxW, size, weight, color, lh, align = "left") => {
    font(size, weight);
    const ls = wrap(ctx, t, maxW);
    const ax = align === "right" ? x + maxW : x;
    ls.forEach((l, i) => text(l, ax, top + size + i * lh, color, align));
    return ls.length * lh;
  };
  const demoStrip = (label) => {
    rect(0, y, W, 24, C.demoBg);
    font(10.5, 700);
    text(label, W / 2, y + 16, C.demoInk, "center");
    y += 24;
  };
  const divider = () => {
    rect(0, y, W, 8, C.band);
    y += 8;
  };

  demoStrip("DEMO — NOT VALID FOR MEDICAL USE");

  // Header: brand left, doctor right
  const headTop = y;
  const dr = m.doctor;
  const rightW = 300;
  const rx = W - PAD - rightW;
  const doctorBlock = () => {
    let ry = headTop + PAD;
    ry += block(dr.name, rx, ry, rightW, 22, 600, "#ffffff", 28, "right");
    ry += 2;
    for (const l of [dr.line1, dr.line2]) {
      if (l)
        ry += block(
          l,
          rx,
          ry,
          rightW,
          13.5,
          400,
          "rgba(255,255,255,.88)",
          19,
          "right",
        );
    }
    ry += 6;
    ry += block(dr.reg, rx, ry, rightW, 12.5, 500, "#ffffff", 18, "right");
    return ry;
  };
  draw = false;
  const headH = Math.max(doctorBlock() - headTop + PAD - 4, 110);
  draw = drawPass;
  rect(0, headTop, W, headH, C.navy);
  doctorBlock();
  if (draw) {
    ctx.fillStyle = C.cyan;
    ctx.beginPath();
    ctx.arc(PAD + 5, headTop + PAD + 28, 4.5, 0, 7);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(PAD + 134, headTop + PAD + 28, 4.5, 0, 7);
    ctx.fill();
  }
  font(38, 700);
  text("practo", PAD + 16, headTop + PAD + 33, "#ffffff");
  y = headTop + headH;

  // Patient + date
  y += 22;
  const pTop = y;
  const half = (W - PAD * 2) / 2 - 8;
  let ly = pTop;
  ly += block(m.patient.name, PAD, ly, half, 18, 700, C.ink, 24);
  ly += block(m.patient.meta, PAD, ly, half, 15, 400, C.ink, 21);
  let rY = pTop;
  rY += block(m.date, PAD + half + 16, rY, half, 18, 700, C.ink, 24, "right");
  rY += block(
    "Prescription Id: " + m.id,
    PAD + half + 16,
    rY,
    half,
    13.5,
    400,
    C.muted,
    19,
    "right",
  );
  y = Math.max(ly, rY) + 20;
  divider();

  // Clinical summary
  const section = (label, body, opts = {}) => {
    y += 18;
    font(12.5, 500);
    text(label, PAD, y + 11, C.label);
    y += 20;
    const h = block(
      body,
      PAD,
      y,
      W - PAD * 2,
      16.5,
      opts.weight || 400,
      C.ink,
      23,
    );
    y += h + 2;
  };
  let any = false;
  const summary = [
    ["CHIEF COMPLAINTS", m.complaint],
    ["OBSERVATIONS / EXAMINATION", m.observations],
    ["PROVISIONAL DIAGNOSIS", m.assessment],
  ].filter(([, v]) => v && v.trim());
  if (summary.length) {
    any = true;
    summary.forEach(([l, v]) => section(l, clip(v)));
    y += 18;
    divider();
  }

  // Medicines table
  const meds = parseMedicines(m.medicines);
  if (meds.length) {
    any = true;
    y += 20;
    font(12.5, 500);
    text("MEDICINES", PAD, y + 11, C.label);
    y += 28;
    rect(PAD, y, W - PAD * 2, 1, C.rule);
    y += 14;
    const xN = PAD + 34;
    const wN = 168;
    const xI = xN + wN + 16;
    const wI = W - PAD - xI;
    font(13, 600);
    text("#", PAD, y + 13, C.ink);
    text("NAME", xN, y + 13, C.ink);
    text("INSTRUCTION", xI, y + 13, C.ink);
    y += 24;
    rect(PAD, y, W - PAD * 2, 1, C.rule);
    y += 16;
    meds.forEach((med, i) => {
      const full = !med.detail;
      font(16, 600);
      const nameH = block(
        med.name,
        xN,
        y,
        full ? W - PAD - xN : wN,
        16,
        600,
        C.ink,
        22,
      );
      font(15, 400);
      const detH = med.detail
        ? block(med.detail, xI, y, wI, 15, 400, C.ink, 21)
        : 0;
      font(16, 600);
      text(String(i + 1), PAD, y + 16, C.ink);
      y += Math.max(nameH, detH, 22) + 20;
    });
    divider();
  }

  const list = (label, items, tick) => {
    y += 20;
    font(12.5, 500);
    text(label, PAD, y + 11, C.label);
    y += 28;
    rect(PAD, y, W - PAD * 2, 1, C.rule);
    y += 16;
    for (const it of items) {
      const h = block(it, PAD + 28, y, W - PAD * 2 - 28, 16.5, 400, C.ink, 23);
      if (draw) {
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 1.8;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        if (tick) {
          ctx.moveTo(PAD + 2, y + 13);
          ctx.lineTo(PAD + 8, y + 19);
          ctx.lineTo(PAD + 18, y + 6);
          ctx.stroke();
        } else {
          ctx.fillStyle = C.ink;
          ctx.arc(PAD + 8, y + 13, 2.4, 0, 7);
          ctx.fill();
        }
      }
      y += h + 8;
    }
    y += 10;
    divider();
  };
  const tests = lines(m.tests);
  if (tests.length) {
    any = true;
    list("INVESTIGATIONS ADVISED", tests, false);
  }
  const advice = lines(m.advice);
  if (advice.length) {
    any = true;
    list("GENERAL ADVICE/NOTES", advice, true);
  }
  if (m.followUp && m.followUp.trim()) {
    any = true;
    section("FOLLOW-UP", clip(m.followUp));
    y += 18;
    divider();
  }
  if (!any) {
    y += 24;
    y += block(
      "No clinical content entered.",
      PAD,
      y,
      W - PAD * 2,
      16,
      400,
      C.muted,
      23,
    );
    y += 24;
    divider();
  }

  // Unsigned footer
  y += 56;
  font(13, 400);
  text("Unsigned demo copy · no signature", W - PAD, y, C.muted, "right");
  y += 28;
  y += block(dr.name, PAD, y - 6, W - PAD * 2, 18, 700, C.ink, 24, "right");
  y += block(dr.line1, PAD, y - 2, W - PAD * 2, 15, 400, C.ink, 21, "right");
  y += 30;
  demoStrip(m.footer);
  return y;
}

/** Renders the sheet to a canvas. Scale is lowered automatically for very long documents. */
export function renderPrescription(model, scale = 2) {
  const probe = document.createElement("canvas").getContext("2d");
  const height = Math.ceil(paint(probe, model, false));
  const s = Math.max(0.5, Math.min(scale, MAX_CANVAS_PX / height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(W * s);
  canvas.height = Math.round(height * s);
  const ctx = canvas.getContext("2d");
  ctx.scale(s, s);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, height);
  paint(ctx, model, true);
  return canvas;
}

/** One continuous page the shape of the sheet, so nothing is clipped or split mid-row. */
export function prescriptionPdf(JsPDF, canvas) {
  const wmm = 120;
  const hmm = Math.max(wmm * 1.3, (wmm * canvas.height) / canvas.width);
  const pdf = new JsPDF({
    unit: "mm",
    format: [wmm, hmm],
    orientation: "portrait",
    compress: true,
  });
  pdf.addImage(
    canvas.toDataURL("image/jpeg", 0.92),
    "JPEG",
    0,
    0,
    wmm,
    (wmm * canvas.height) / canvas.width,
  );
  return pdf;
}

export function downloadCanvasPng(canvas, filename) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve(false);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      resolve(true);
    }, "image/png");
  });
}
