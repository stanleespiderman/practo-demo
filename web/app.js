import { createDoctorWorkspace } from "./doctor-workspace.js";
const icons = {
  home: "M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z",
  stethoscope:
    "M6 3v7a4 4 0 0 0 8 0V3M4 3h4m4 0h4M10 14v2a5 5 0 0 0 10 0v-3m0-4a2 2 0 1 0 0 4 2 2 0 0 0 0-4",
  chat: "M21 11a8 8 0 0 1-8 8H7l-5 3 2-6a8 8 0 0 1-1-5 9 9 0 0 1 18 0ZM8 10h8m-8 4h5",
  calendar:
    "M5 5h14a2 2 0 0 1 2 2v13H3V7a2 2 0 0 1 2-2Zm2-3v6m10-6v6M3 11h18M7 15h2m4 0h2m-8 3h2",
  file: "M5 3h9l5 5v13H5zM14 3v6h5M8 13h8m-8 4h5",
  pill: "M5 19a5 5 0 0 1 0-7l7-7a5 5 0 0 1 7 7l-7 7a5 5 0 0 1-7 0ZM8.5 8.5l7 7",
  flask: "M9 3h6m-5 0v7L4 20a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1l-6-10V3M7 15h10",
  shield: "M12 3 3 7v5c0 5 9 10 9 10s9-5 9-10V7zM8 12l3 3 5-6",
  heart:
    "M20.8 5a5.5 5.5 0 0 0-8.8 1 5.5 5.5 0 0 0-8.8 7L12 21l8.8-8a5.5 5.5 0 0 0 0-8Z",
  user: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-3a8 8 0 0 1 16 0v3",
  users:
    "M15 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM3 21v-2a8 8 0 0 1 16 0v2m0-18a4 4 0 0 1 0 8m1 3a6 6 0 0 1 3 6",
  video: "M3 5h12v14H3zM15 10l6-4v12l-6-4",
  chevron: "m9 5 7 7-7 7",
  down: "m6 9 6 6 6-6",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  back: "M20 12H4m6-6-6 6 6 6",
  search: "M18 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-2 6 5 5",
  pin: "M19 9c0 5-7 12-7 12S5 14 5 9a7 7 0 0 1 14 0Zm-7-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  bell: "M6 9a6 6 0 0 1 12 0v6l3 3H3l3-3Zm4 12h4",
  clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 6v6l4 2",
  sparkles:
    "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4m-2-2h4",
  tooth:
    "M5 4c3-2 5 0 7 0s4-2 7 0c5 4-1 17-3 17-2 0-1-9-4-9s-2 9-4 9C6 21 0 8 5 4Z",
  baby: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 3c0 5-5 5-4 2m0 7h.1m7.9 0h.1M9 16q3 3 6 0",
  ear: "M7 9a6 6 0 0 1 12 0c0 4-4 5-5 9-1 4-6 4-7 0m3-9a3 3 0 0 1 6 0c0 3-4 2-4 5",
  brain:
    "M12 4c-4-5-9 1-6 4-5 1-4 8 0 8-1 6 6 7 6 3Zm0 0c4-5 9 1 6 4 5 1 4 8 0 8 1 6-6 7-6 3M7 8l2 2m9 6-3-2",
  bone: "M4 4a3 3 0 0 1 5 2l9 9a3 3 0 1 1 3 5 3 3 0 0 1-5 1 3 3 0 0 1-1-3L6 9a3 3 0 1 1-2-5Z",
  leaf: "M20 3C4 1 1 12 6 18s17 0 14-15ZM4 21l12-13",
  book: "M12 5C9 2 4 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-4-2-7-1-10 1Zm0 0v16",
  help: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9 9a3 3 0 0 1 6 0c0 2-3 2-3 5m0 3h.01",
  settings:
    "M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM9 2l-1 3-3 1-3 3 2 3-1 4 4 1 2 4h5l2-4 4-1-1-4 2-3-3-3-3-1-1-3z",
  check: "m5 12 4 4L19 6",
  checks: "m2 12 4 4L16 6m-5 8 2 2L23 6",
  send: "m22 2-7 20-4-9-9-4ZM22 2 11 13",
  clip: "m8 13 7-7a3 3 0 0 1 4 4L9 20a5 5 0 0 1-7-7L13 2",
  phone: "M6 3H3v4c0 8 6 14 14 14h4v-5l-5-2-2 3a12 12 0 0 1-7-7l3-2-2-5z",
  close: "m6 6 12 12M6 18 18 6",
  lock: "M6 10h12v11H6zM8 10V6a4 4 0 0 1 8 0v4",
  wallet: "M3 5h17v15H3zM3 5V3h14v2m-3 7h7v5h-7z",
  surgery: "M4 4l6 6m4-7L3 14m6-4 11 11m-1-6-4 4",
  logout: "M9 3H3v18h6m-1-9h13m-5-5 5 5-5 5",
  star: "m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z",
  cloud:
    "M7 18H5a4 4 0 0 1-1-8 7 7 0 0 1 13-3 5 5 0 0 1 2 11h-2M12 11v11m-4-7 4-4 4 4",
  refresh: "M20 7a9 9 0 1 0 1 9M20 2v6h-6",
  plus: "M12 4v16M4 12h16",
  sun: "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2",
};
const I = (n, cls = "") =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[n] || icons.heart}"/></svg>`;
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (s) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        s
      ],
  );
const app = document.querySelector("#app"),
  overlay = document.querySelector("#overlay");
const KEY = "practo-review-v1";
let seed,
  state,
  pro,
  route = [],
  filter = "all",
  doctorFilter = "all",
  role = sessionStorage.getItem("practo-role") || "patient",
  offline = false,
  failNext = false,
  autoReplies = false,
  toastTimer,
  draft = {},
  lastSubmit = {},
  newMessages = false,
  loadingError = false;
const pending = new Set();
const navItems = [
  ["home", "home", "Home"],
  ["doctors", "stethoscope", "Find doctors"],
  ["consultations", "chat", "My consultations"],
  ["appointments", "calendar", "Appointments"],
  ["records", "file", "Medical records"],
  ["medicines", "pill", "Medicines"],
  ["tests", "flask", "Lab tests"],
  ["surgeries", "surgery", "Surgeries"],
];
const doctorData = () => state.doctors || seed.doctors,
  patientCons = () =>
    state.consultations.filter((x) => x.patientId === state.profile.id);
const d = (id) => doctorData().find((x) => x.id === id),
  c = (id) => patientCons().find((x) => x.id === id),
  current = () => route[0] || "home";
const ts = () =>
  Math.max(Date.now(), ...state.messages.map((x) => x.timestamp + 1));
const fmt = (value, part = "date") =>
  new Intl.DateTimeFormat(
    "en-IN",
    part === "time"
      ? { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }
      : {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "Asia/Kolkata",
        },
  ).format(new Date(value));
const msgs = (id) =>
  state.messages
    .filter((x) => x.consultationId === id)
    .sort((a, b) => a.timestamp - b.timestamp || a.id.localeCompare(b.id));
const unread = (id, r = role) =>
  msgs(id).filter(
    (x) =>
      x.sender !== r &&
      x.status === "sent" &&
      x.timestamp > (state.seen[`${id}:${r}`] || 0),
  ).length;
const totalUnread = () => patientCons().reduce((n, x) => n + unread(x.id), 0);
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    toast("Storage unavailable. Changes cannot persist on this device.");
    return false;
  }
}
function load() {
  const raw = localStorage.getItem(KEY);
  state = raw
    ? JSON.parse(raw)
    : {
        version: 1,
        consultations: [],
        messages: [],
        seen: {},
        profile: structuredClone(seed.patient),
        reminders: [],
      };
  if (
    state.version !== 1 ||
    !Array.isArray(state.messages) ||
    !Array.isArray(state.consultations) ||
    !state.seen ||
    !state.profile
  )
    throw Error("Invalid saved data");
  const merge = (current, defaults) => [
    ...(current || []),
    ...structuredClone(defaults || []).filter(
      (x) => !(current || []).some((y) => y.id === x.id),
    ),
  ];
  if (!state.doctorRevision) {
    state.consultations = merge(state.consultations, seed.consultations);
    state.messages = merge(state.messages, seed.messages);
    state.doctorRevision = 2;
  }
  state.doctors = merge(state.doctors, seed.doctors);
  state.patients = merge(state.patients, seed.patients);
  state.patients = state.patients.map((p) =>
    p.id === state.profile.id ? { ...p, ...state.profile } : p,
  );
  state.appointments = state.appointments || structuredClone(seed.appointments);
  state.feedback = state.feedback || structuredClone(seed.feedback);
  for (const key of [
    "documents",
    "notes",
    "invoices",
    "articles",
    "reminderDrafts",
    "inventory",
  ])
    state[key] ||= [];
  for (const m of state.messages)
    if (m.status === "sending") m.status = "failed";
  save();
  return true;
}
function commit(transform) {
  const old = state;
  try {
    const raw = localStorage.getItem(KEY);
    state = raw ? JSON.parse(raw) : structuredClone(state);
    transform(state);
    if (!save()) {
      state = old;
      return false;
    }
    return true;
  } catch (e) {
    state = old;
    toast(e.message || "Could not save the local change");
    return false;
  }
}
function initPro() {
  pro = createDoctorWorkspace({
    I,
    esc,
    avatar,
    fmt,
    toast,
    modal,
    getState: () => state,
    unread,
    markRead: read,
    go,
    commit,
    closeModal: () => (overlay.innerHTML = ""),
    sendDoctor: (id, text) => {
      const con = state.consultations.find(
        (c) => c.id === id && c.doctorId === pro.selectedDoctor(),
      );
      if (!con || con.status !== "active" || !text.trim()) return false;
      const key = id + ":doctor",
        prior = lastSubmit[key];
      if (prior && prior.text === text && Date.now() - prior.at < 1500)
        return false;
      lastSubmit[key] = { text, at: Date.now() };
      const mid = crypto.randomUUID();
      if (
        !commit((s) =>
          s.messages.push({
            id: mid,
            consultationId: id,
            sender: "doctor",
            text: text.trim().slice(0, 2000),
            timestamp: ts(),
            status: "sending",
          }),
        )
      )
        return false;
      deliver(mid);
      return true;
    },
    retry: (id) => {
      const m = state.messages.find((m) => m.id === id);
      if (m?.status === "failed") {
        commit((s) => (s.messages.find((m) => m.id === id).status = "sending"));
        pro.render();
        deliver(id);
      }
    },
    viewAsPatient: (pid, cid) => {
      commit((s) => {
        s.profile = structuredClone(s.patients.find((p) => p.id === pid));
      });
      role = "patient";
      sessionStorage.setItem("practo-role", role);
      autoReplies = false;
      go("chat/" + cid);
    },
    patientApp: () => {
      role = "patient";
      sessionStorage.setItem("practo-role", role);
      autoReplies = false;
      go("home");
    },
  });
}
function toast(t) {
  const el = document.querySelector("#toast");
  el.textContent = t;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
}
function go(path) {
  overlay.innerHTML = "";
  role = path.startsWith("pro") ? "doctor" : "patient";
  sessionStorage.setItem("practo-role", role);
  location.hash = path;
}
function read(id, selectedRole = role) {
  const latest = Math.max(
    0,
    ...msgs(id)
      .filter((x) => x.sender !== selectedRole && x.status === "sent")
      .map((x) => x.timestamp),
  );
  const key = `${id}:${selectedRole}`;
  if (latest > (state.seen[key] || 0)) {
    state.seen[key] = latest;
    save();
  }
}
function portrait(doc, hero = false) {
  const female = doc?.gender === "female";
  return `<svg viewBox="0 0 150 180" aria-hidden="true"><ellipse cx="77" cy="173" rx="65" ry="8" fill="#3e487418"/><path d="M25 180v-48q0-30 38-35h27q36 7 36 35v48" fill="${hero ? "#fff" : "#fdfdfd"}"/><path d="m61 97 16 13 15-13 12 83H48Z" fill="#b9c9e3"/><path d="m61 96-16 12 17 32-5 40H28v-50q0-26 33-34m31 0 15 12-15 32 6 40h29v-50q0-26-35-34" fill="#fff"/><path d="M63 80h27v25q-14 13-27 0" fill="#c58d6c"/>${female ? '<path d="M45 53q0-45 31-43 39 0 34 55l7 39-30-7H45Z" fill="#37333f"/>' : '<path d="M47 56q-5-47 30-46 33 0 30 46Z" fill="#343740"/>'}<ellipse cx="77" cy="60" rx="27" ry="35" fill="#d5a383"/>${female ? '<path d="M48 54q30-8 40-30 15 18 19 30-1-44-30-42-33-1-29 42Z" fill="#3c3543"/>' : '<path d="M48 43q-2-31 28-32 32-2 31 31-22-18-31-11-12 9-28 12Z" fill="#343740"/>'}<path d="M63 58h3m21 0h3" stroke="#433e40" stroke-width="2" stroke-linecap="round"/><path d="M71 76q7 6 14-1" fill="none" stroke="#965f57" stroke-width="2" stroke-linecap="round"/><path d="M54 107v25a12 12 0 0 0 24 0v-20m12-4v35a12 12 0 0 0 12 12" fill="none" stroke="#4a6b84" stroke-width="3"/><circle cx="106" cy="156" r="6" fill="#849ba9" stroke="#416581" stroke-width="3"/><path d="M36 146h18v3H36" stroke="#dbe3ea" stroke-width="2"/></svg>`;
}
const avatar = (doc) =>
  `<div class="avatar ${doc.color}">${portrait(doc)}</div>`;
const badge = (n) => (n ? `<span class="badge">${n}</span>` : "");
const status = (x) =>
  `<span class="pill ${x.status === "completed" ? "completed" : ""}">${x.status === "active" ? "Active" : "Completed"}</span>`;
const doctorRow = (x) =>
  `<div class="doctor-row">${avatar(x)}<div><h3>${esc(x.name)}</h3><small>${esc(x.specialty)}</small></div></div>`;
const btn = (text, path, icon = "arrow", style = "primary-btn") =>
  `<button class="${style}" data-go="${path}">${esc(text)}${I(icon)}</button>`;
function header(title, sub = "", back = "home") {
  return `<div class="page-header"><button class="icon-button" data-go="${back}" aria-label="Back">${I("back")}</button><div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ""}</div><button class="text-link right" data-action="controls" aria-label="Demo controls">${I("settings")}<span>Demo controls</span></button></div>`;
}
function shell(content) {
  const n = totalUnread();
  return `<div class="layout ${current() === "chat" ? "chat-mode" : ""}"><aside class="sidebar"><button class="logo" data-go="home">practo<span>•</span></button><p class="logo-caption">Your home for health</p><p class="nav-label">YOUR HEALTH</p><nav>${navItems.map(([id, icon, label]) => `<button data-go="${id}" class="nav-link ${current() === id ? "active" : ""}">${I(icon)}${label}${id === "consultations" ? badge(n) : ""}</button>`).join("")}</nav><button class="nav-link" data-go="pro/dashboard">${I("stethoscope")}Doctor workspace</button><p class="nav-label">EXPLORE</p>${[
    ["plus", "shield", "Practo Plus"],
    ["articles", "book", "Health articles"],
    ["help", "help", "Help & support"],
  ]
    .map(
      ([id, icon, l]) =>
        `<button class="nav-link ${current() === id ? "active" : ""}" data-go="${id}">${I(icon)}${l}</button>`,
    )
    .join(
      "",
    )}<div class="sidebar-bottom"><button class="nav-link" data-action="controls">${I("settings")}Demo controls</button><button class="profile-mini" data-go="account"><span class="profile-avatar">AM</span><span><h3 style="font-size:11px">${esc(state.profile.name)}</h3><small style="font-size:9px">Personal account</small></span>${I("chevron")}</button></div></aside><div class="main-shell"><header class="topbar"><button class="logo mobile-logo" data-go="home">practo<span>•</span></button><button class="location" data-action="location">${I("pin")}<span><small>Your location</small><strong>${esc(state.profile.city)}</strong>${I("down", "chev")}</span></button><div class="search">${I("search")}<input id="global-search" autocomplete="off" aria-label="Search doctors, specialities and consultations" placeholder="Search doctors, specialities, consultations…"><kbd>⌘ K</kbd><div id="search-results" class="search-results hide"></div></div><div class="top-actions"><button class="demo-pill" data-action="controls"><i></i> LOCAL DEMO</button><button class="icon-button" data-action="notifications" aria-label="Notifications">${I("bell")}${n ? '<i class="notification-dot"></i>' : ""}</button><button class="profile-avatar" data-go="account" aria-label="My account">AM</button></div></header>${offline || !navigator.onLine ? '<div class="offline-banner">Offline test mode · Messages will fail safely and can be retried.</div>' : ""}<main class="content">${content}${current() !== "chat" ? '<p class="footer-note">Independent interface study · Fictional people and records · No affiliation with Practo</p>' : ""}</main></div><nav class="bottom-nav">${[
    ["home", "home", "Home"],
    ["consultations", "chat", "Consultations"],
    ["records", "file", "Records"],
    ["account", "user", "Account"],
  ]
    .map(
      ([id, ico, l]) =>
        `<button data-go="${id}" class="${current() === id ? "active" : ""}">${I(ico)}${l}${id === "consultations" ? badge(n) : ""}</button>`,
    )
    .join("")}</nav></div>`;
}
function activePanel() {
  const x = patientCons().find((c) => c.status === "active");
  if (!x)
    return `<div class="panel panel-pad"><h3>No active consultations</h3><p class="small muted" style="margin:12px 0">Your conversations will appear here.</p>${btn("View consultations", "consultations")}</div>`;
  const doc = d(x.doctorId);
  return `<div class="panel"><div class="panel-pad"><div class="panel-top"><h3>Your consultation</h3>${status(x)}</div>${doctorRow(doc)}<div class="summary-details"><span>${fmt(x.date)}</span><b>${fmt(x.date, "time")}</b></div><div class="message-preview">${I("chat")}<span>${unread(x.id) ? `${unread(x.id)} unread messages from your doctor` : "Your conversation is up to date"}</span></div><button class="primary-btn full" data-go="chat/${x.id}">${I("chat")}Continue chat${badge(unread(x.id))}</button></div><button class="panel-footer full" data-go="consultation/${x.id}">View consultation details ${I("chevron", "chev")}</button></div>`;
}
function rightColumn() {
  return `<aside class="right-column">${activePanel()}<div class="panel panel-pad"><div class="panel-top"><h3>Your health, organised</h3>${I("file")}</div><button class="record-mini full" data-go="records">${I("file")}<span><h4>Medical records</h4><p>All your reports in one place</p></span>${I("chevron", "chev")}</button><button class="record-mini full" data-go="family">${I("users")}<span><h4>Family health</h4><p>Care for the people you love</p></span>${I("chevron", "chev")}</button></div><div class="wellness-card">${I("leaf")}<h3>A little care, every day.</h3><p>Make space for yourself. Small, consistent habits are a good place to start.</p><button class="text-link" data-go="articles" style="margin-top:16px">Explore health articles ${I("arrow")}</button></div><div class="trust-row"><span>${I("shield")}Fictional demo data</span><span>${I("lock")}Stored on this device</span></div></aside>`;
}
function specialtyGrid(all = true) {
  return `<div class="specialty-grid">${seed.specialties
    .slice(0, all ? 8 : 4)
    .map(
      ([s, ico, col]) =>
        `<button class="specialty" data-specialty="${s}"><span class="specialty-circle ${col}">${I(ico)}</span><span>${s}</span></button>`,
    )
    .join("")}</div>`;
}
function home() {
  return `<div class="welcome"><div><p class="eyebrow">Hello, ${esc(state.profile.name.split(" ")[0])} 👋</p><h1>Good health starts here.</h1></div><span class="date">${new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}</span></div><button class="doctor-entry" data-go="pro/dashboard">${I("stethoscope")}<span><strong>Explore the doctor workspace</strong><small>10 demo doctors · Chat, patient charts and Summary & Rx</small></span>${I("arrow")}</button><div class="home-grid"><div class="primary-column"><div class="hero-grid"><button class="hero clinic" data-go="doctors"><h2>Find a doctor<br>near you</h2><p>Expert care. Right in your neighbourhood.</p><div class="art">${portrait(seed.doctors[0], true)}</div><span class="hero-action"><span class="desktop-action">Book an appointment</span><span class="mobile-action">Find doctors</span>${I("arrow")}</span><span class="tiny-tag">IN-CLINIC VISIT</span></button><button class="hero video" data-go="online"><h2>Instant video<br>consultation</h2><p>Connect with a doctor from wherever you are.</p><div class="art">${portrait(seed.doctors[1], true)}</div><span class="hero-action">Consult now ${I("arrow")}</span><span class="tiny-tag">ONLINE CARE</span></button></div><div class="service-grid">${[
    ["tests", "flask", "Lab tests"],
    ["medicines", "pill", "Medicines"],
    ["surgeries", "surgery", "Surgeries"],
    ["plus", "shield", "Health plans"],
  ]
    .map(
      ([id, ico, l]) =>
        `<button class="service" data-go="${id}">${I(ico)}${l}</button>`,
    )
    .join(
      "",
    )}</div><div class="section-heading"><div><h2>Find care for your health concern</h2><small>Experienced doctors across specialities</small></div><button class="text-link" data-go="specialties">View all ${I("chevron")}</button></div>${specialtyGrid()}<div class="plus-banner"><div><div class="plus-word">practo <b>PLUS</b></div><h2>One plan. Care for your whole family.</h2><p>Explore online consultations and family benefits.</p><button class="white-btn" data-go="plus">Explore health plans →</button></div><div class="banner-icon">${I("shield")}</div></div><div class="section-heading"><div><h2>A healthier you, one read at a time</h2><small>Ideas for your everyday wellbeing</small></div><button class="text-link" data-go="articles">View all ${I("chevron")}</button></div><div class="articles">${[
    ["leaf", "EVERYDAY WELLNESS", "Make a little space for yourself"],
    ["sun", "HEALTHY HABITS", "Build a routine that works for you"],
  ]
    .map(
      ([ico, tag, t], idx) =>
        `<button class="article" data-article="${idx}"><div class="article-art">${I(ico)}</div><div class="article-copy"><small>${tag}</small><h3>${t}</h3><p>Demo editorial · 2 min read</p></div></button>`,
    )
    .join("")}</div></div>${rightColumn()}</div>`;
}
function consultationCard(x) {
  const doc = d(x.doctorId);
  return `<article class="consultation-card"><div class="doctor-row">${avatar(doc)}<div><h3>${esc(doc.name)}</h3><small>${esc(doc.specialty)}</small></div>${status(x)}</div><div class="card-meta"><span>${I("calendar")}${fmt(x.date)}</span><span>${I("clock")}${fmt(x.date, "time")}</span><span>${I("user")}${esc(state.profile.name.split(" ")[0])}</span></div><div class="card-actions">${btn("View consultation", `consultation/${x.id}`, "chevron", "outline-btn")}<button class="primary-btn" data-go="chat/${x.id}">${I("chat")}${x.status === "active" ? "Continue chat" : "View chat"}${badge(unread(x.id))}</button></div></article>`;
}
function consultations() {
  const filtered = patientCons().filter(
    (x) => filter === "all" || x.status === filter,
  );
  return `${header("My consultations", "Your care and conversations, all in one place.")}<div class="list-grid"><div><div class="tab-row">${[
    ["all", "All consultations"],
    ["active", "Active"],
    ["completed", "Completed"],
  ]
    .map(
      ([v, t]) =>
        `<button class="tab ${filter === v ? "active" : ""}" data-filter="${v}">${t} <small>(${patientCons().filter((x) => v === "all" || x.status === v).length})</small></button>`,
    )
    .join(
      "",
    )}</div>${filtered.length ? filtered.map(consultationCard).join("") : empty("No consultations here", "Try another filter to see your consultation history.", "chat")}<div class="soft-info">${I("lock")}<span>This is a local demo. Your fictional consultation records and messages are stored in this browser. No real doctors are connected.</span></div></div>${rightColumn()}</div>`;
}
function consultation(id) {
  const x = c(id);
  if (!x) return notFound();
  const doc = d(x.doctorId);
  return `${header("View consultation", x.id, "consultations")}<div class="list-grid"><div><div class="panel detail-card"><div class="panel-top"><span class="small muted">${x.type}</span>${status(x)}</div>${doctorRow(doc)}<p class="small muted" style="margin:15px 0 0">${esc(doc.qualification)} · ${doc.experience} years of experience</p><hr class="divider"><h3>Consultation details</h3><dl class="data-grid"><div><dt>Patient</dt><dd>${esc(state.profile.name)}</dd></div><div><dt>Patient details</dt><dd>${state.profile.age} years · ${state.profile.gender}</dd></div><div><dt>Date</dt><dd>${fmt(x.date)}</dd></div><div><dt>Time</dt><dd>${fmt(x.date, "time")} IST</dd></div><div><dt>Consultation ID</dt><dd>${x.id}</dd></div><div><dt>Health concern</dt><dd>${esc(x.reason)}</dd></div></dl><hr class="divider"><button class="primary-btn full" data-go="chat/${id}">${I("chat")}${x.status === "active" ? "Continue consultation" : "View conversation"}${badge(unread(id))}</button></div><div class="panel panel-pad" style="margin-top:20px"><h3>Your consultation journey</h3><ol class="step-list"><li><span class="step-dot">${I("check")}</span><div>Consultation created<small>${fmt(x.date)} · ${fmt(x.date, "time")}</small></div></li><li><span class="step-dot">${I("chat")}</span><div>${x.status === "active" ? "Conversation is active" : "Consultation completed"}<small>${x.status === "active" ? "Continue chatting with your demo doctor." : "Message history is available to read."}</small></div></li><li><span class="step-dot">${I("file")}</span><div>Consultation summary<small>Demo record only. No prescription issued.</small></div></li></ol></div></div>${rightColumn()}</div>`;
}
function messageHtml(m) {
  return `<div class="message ${m.sender === role ? "mine" : ""}" data-message="${m.id}"><div class="message-bubble">${esc(m.text)}${m.documentId ? `<button class="pro-document-attachment" data-pro-document="${m.documentId}">${I("file")}Open demo document</button>` : ""}</div><div class="message-meta"><span>${fmt(m.timestamp, "time")}</span>${m.sender === role ? (m.status === "sending" ? "<span>Sending…</span>" : m.status === "failed" ? `<button class="retry-btn" data-retry="${m.id}">Failed · Tap to retry</button>` : `${I("checks")}<span>Sent locally</span>`) : "<span>Demo message</span>"}</div></div>`;
}
function chat(id) {
  const x = c(id);
  if (!x) return notFound();
  const doc = d(x.doctorId);
  read(id);
  return `${header("Consultation chat", "Local demo conversation", `consultation/${id}`)}<div class="chat-layout"><aside class="chat-sidebar"><h3>Conversations</h3>${patientCons()
    .map((co) => {
      const dd = d(co.doctorId);
      return `<button class="chat-list-item ${co.id === id ? "active" : ""}" data-go="chat/${co.id}">${avatar(dd)}<div><h3>${esc(dd.name)}</h3><p>${esc(dd.specialty)}</p><small>${co.status === "active" ? "Active consultation" : "Completed"}</small></div>${badge(unread(co.id))}</button>`;
    })
    .join(
      "",
    )}</aside><section class="chat-panel"><header class="chat-header"><button class="icon-button" data-go="consultation/${id}" aria-label="Back to consultation">${I("back")}</button>${doctorRow(doc)}<button class="icon-button" data-action="unavailable" aria-label="Voice call">${I("phone")}</button><button class="icon-button" data-action="unavailable" aria-label="Video call">${I("video")}</button><button class="icon-button" data-action="controls" aria-label="Demo chat settings">${I("settings")}</button></header><div class="chat-demo-banner">LOCAL DEMO · ${role === "doctor" ? "Test-doctor role" : "Patient role"} · ${autoReplies ? "Simulated replies enabled" : "Automatic replies off"} · No live medical advice</div><div class="chat-messages" id="chat-messages"><div class="chat-date">${fmt(x.date)}</div>${msgs(
    id,
  )
    .filter((m) => m.sender === role || m.status === "sent")
    .map(messageHtml)
    .join(
      "",
    )}</div><button id="new-messages" class="new-messages hide" data-action="scroll-chat">New message ↓</button>${x.status === "active" ? `<form class="composer" id="composer"><button type="button" class="icon-button" data-action="unavailable" aria-label="Add attachment">${I("clip")}</button><textarea id="message-input" rows="1" maxlength="2000" aria-label="Message" placeholder="${role === "doctor" ? "Reply as test doctor…" : "Type your message…"}">${esc(draft[id + role] || "")}</textarea><button class="send" id="send-message" aria-label="Send message" ${draft[id + role]?.trim() ? "" : "disabled"}>${I("send")}</button></form><div class="chat-footnote">Fictional conversation · Messages stay on this device</div>` : '<div class="soft-info" style="margin:0;border-radius:0">' + I("lock") + "This consultation is completed. You can still read its message history.</div>"}</section></div>`;
}
function refreshChat(force = false) {
  if (current() !== "chat") return render();
  const id = route[1],
    el = document.querySelector("#chat-messages");
  if (!el) return;
  const near = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  const top = el.scrollTop;
  const x = c(id);
  if (
    !x ||
    Boolean(document.querySelector("#composer")) !== (x.status === "active")
  )
    return render();
  el.innerHTML = `<div class="chat-date">${fmt(x.date)}</div>${msgs(id)
    .filter((m) => m.sender === role || m.status === "sent")
    .map(messageHtml)
    .join("")}`;
  read(id);
  if (force || near) {
    el.scrollTop = el.scrollHeight;
    document.querySelector("#new-messages")?.classList.add("hide");
  } else {
    el.scrollTop = top;
    document.querySelector("#new-messages")?.classList.remove("hide");
  }
}
function empty(title, sub, ico = "file") {
  return `<div class="empty">${I(ico)}<h3>${title}</h3><p>${sub}</p>${btn("Back to home", "home", "back", "outline-btn")}</div>`;
}
function notFound() {
  return `${header("Page not found")}${empty("This record is unavailable", "Open a consultation from your consultation list.", "search")}`;
}
function doctors() {
  const map = {
    "Skin & Hair": "Dermatologist",
    "Dental Care": "Dentist",
    "Bones & Joints": "Orthopedist",
  };
  const target = map[doctorFilter] || doctorFilter;
  const docs = doctorData().filter(
    (x) => target === "all" || x.specialty === target,
  );
  return `${header("Find doctors", "Browse fictional doctors in " + esc(state.profile.city))}<div class="filters">${["all", "General Physician", "Skin & Hair", "Dental Care", "Bones & Joints"].map((f) => `<button class="filter-chip ${doctorFilter === f ? "active" : ""}" data-doctor-filter="${f}">${f === "all" ? "All specialities" : f}</button>`).join("")}</div>${docs.length ? docs.map((doc) => `<article class="panel doctor-card">${avatar(doc)}<div class="doctor-info"><button data-go="doctor/${doc.id}" style="padding:0;text-align:left"><h3>${esc(doc.name)}</h3></button><p>${esc(doc.specialty)} · ${doc.experience} years experience</p><p>${esc(doc.area)} · ${esc(doc.clinic)}</p><div class="rating">${doc.rating}% recommended · ${doc.stories} demo stories</div></div><div class="doctor-cta"><span><span class="price">₹${doc.fee}</span><p>Illustrative consultation fee</p></span>${btn("View profile", "doctor/" + doc.id, "chevron", "outline-btn")}</div></article>`).join("") : empty("No matching demo doctors", "This speciality is part of the interface. Try All specialities to explore available profiles.", "stethoscope")}`;
}
function doctor(id) {
  const doc = d(id);
  if (!doc) return notFound();
  return `${header("Doctor profile", "Fictional profile for interface testing", "doctors")}<div class="panel detail-card">${doctorRow(doc)}<p class="small muted" style="margin-top:15px">${esc(doc.qualification)} · ${doc.experience} years of experience</p><hr class="divider"><h3>About ${esc(doc.name)}</h3><p class="small muted" style="margin-top:10px;line-height:1.9">A fictional ${doc.specialty.toLowerCase()} profile created to demonstrate Practo-style doctor discovery. Credentials, ratings, fees and clinic details are illustrative.</p><hr class="divider"><dl class="data-grid"><div><dt>Clinic</dt><dd>${esc(doc.clinic)}</dd></div><div><dt>Location</dt><dd>${esc(doc.area)}, ${esc(state.profile.city)}</dd></div><div><dt>Consultation fee</dt><dd>₹${doc.fee} · Demo price</dd></div><div><dt>Patient stories</dt><dd>${doc.stories} · Illustrative</dd></div></dl><div class="card-actions" style="margin-top:25px"><button class="outline-btn" data-action="unavailable">${I("phone")}Contact clinic</button><button class="primary-btn" data-action="unavailable">${I("calendar")}Book clinic visit</button></div></div>`;
}
const catalogs = {
  medicines: {
    title: "Medicines",
    sub: "Everyday health essentials, in one place.",
    icon: "pill",
    banner: "Your care, delivered.",
    desc: "Explore medicine categories and health essentials.",
    items: [
      ["Health essentials", "Everyday wellness and personal care", "shield"],
      ["Vitamins & supplements", "Browse the wellness collection", "sun"],
      ["Personal care", "Care for skin, hair and daily hygiene", "sparkles"],
      ["First aid", "At-home care essentials", "heart"],
      ["Health devices", "Thermometers and everyday devices", "stethoscope"],
      [
        "Prescription medicines",
        "Prescription upload is unavailable in this demo",
        "file",
      ],
    ],
  },
  tests: {
    title: "Lab tests",
    sub: "Explore health checks from the comfort of home.",
    icon: "flask",
    banner: "A clearer picture of your health.",
    desc: "Browse health checks and popular test categories.",
    items: [
      ["Full body health check", "A sample preventive health package", "heart"],
      ["Blood tests", "Popular blood test categories", "flask"],
      ["Thyroid profile", "Explore diagnostic test information", "file"],
      ["Vitamin checks", "Browse vitamin test categories", "sun"],
    ],
  },
  surgeries: {
    title: "Surgeries",
    sub: "Explore surgical care and specialist categories.",
    icon: "surgery",
    banner: "Care at every step.",
    desc: "Consultation, treatment and recovery support.",
    items: [
      ["Orthopaedics", "Joint and mobility care", "bone"],
      ["Ophthalmology", "Eye care and vision procedures", "sparkles"],
      ["General surgery", "Explore general surgery care", "surgery"],
      ["ENT care", "Ear, nose and throat care", "ear"],
    ],
  },
};
function catalog(type) {
  const cat = catalogs[type];
  return `${header(cat.title, cat.sub)}<div class="split-banner">${I(cat.icon)}<div><h2>${cat.banner}</h2><p>${cat.desc}</p></div></div><div class="catalog-grid">${cat.items.map(([title, desc, ico], i) => `<div class="panel catalog-card"><span class="specialty-circle ${["lavender", "blue", "peach", "green"][i % 4]}">${I(ico)}</span><h3>${title}</h3><p>${desc}</p><button class="text-link" data-action="unavailable">Explore ${I("arrow")}</button></div>`).join("")}</div><div class="soft-info">${I("help")}This section is a UI preview. Ordering, payment, clinical care and bookings are not connected.</div>`;
}
function records() {
  const docs = state.documents.filter(
    (d) => d.patientId === state.profile.id && d.status === "shared",
  );
  return `${header("Medical records", "Documents shared by your fictional doctors.")}<div class="split-banner">${I("file")}<div><h2>All your records. One place.</h2><p>Summaries, prescription drafts and demo medical documents.</p></div></div>${docs.map((doc) => `<div class="panel" style="margin-bottom:15px;padding:6px 22px"><button class="setting-row" data-pro-document="${doc.id}">${I("file")}<span><h3>${esc(doc.title)}</h3><p>${esc(d(doc.doctorId).name)} · ${fmt(doc.sharedAt || doc.createdAt)} · DEMO</p></span>${I("chevron")}</button></div>`).join("") || empty("No shared documents yet", "Create and share a document from the doctor workspace to see it here.", "file")}<div class="soft-info">${I("shield")}All documents are fictional, visibly marked DEMO and not valid for medical use.</div>`;
}

function plus() {
  return `${header("Practo Plus", "A preview of family health plans.")}<div class="plus-banner" style="margin:0 0 25px;padding:35px"><div><div class="plus-word">practo <b>PLUS</b></div><h2>Great care is better together.</h2><p>Explore a single place for your family’s healthcare.</p></div><div class="banner-icon">${I("shield")}</div></div><div class="catalog-grid">${[
    ["Personal care", "For everyday peace of mind", "user"],
    ["Family care", "For you and the people you love", "users"],
    ["Complete care", "Explore a wider range of benefits", "shield"],
  ]
    .map(
      ([t, s, ico]) =>
        `<div class="panel catalog-card"><span class="specialty-circle lavender">${I(ico)}</span><h3>${t}</h3><p>${s}</p><p>Online consultation benefits<br>Family health records<br>Follow-up care options</p><button class="outline-btn full" data-action="unavailable">Explore plan</button></div>`,
    )
    .join(
      "",
    )}</div><div class="soft-info">${I("help")}Plan names and benefits are illustrative. No subscription or payment will be created.</div>`;
}
function account() {
  const rows = [
    [
      "pro/dashboard",
      "stethoscope",
      "Doctor workspace",
      "10 fictional doctors · Manage consultations and documents",
    ],
    ["family", "users", "Family members", "Manage your family’s demo profiles"],
    ["appointments", "calendar", "Appointments", "Your clinic visits"],
    ["tests", "flask", "Test bookings", "Manage sample collection"],
    ["orders", "pill", "Orders", "Your medicine orders"],
    ["consultations", "chat", "Consultations", "Your online conversations"],
    [
      "my-doctors",
      "stethoscope",
      "My doctors",
      "Doctors from your consultations",
    ],
    [
      "records",
      "file",
      "Medical records",
      "Your reports and consultation summaries",
    ],
    ["insurance", "shield", "My insurance policy", "Your health coverage"],
    ["reminders", "bell", "Reminders", "Your daily health routine"],
    [
      "payments",
      "wallet",
      "Payments & HealthCash",
      "Payment history and credits",
    ],
    ["abha", "heart", "ABHA", "Ayushman Bharat Health Account"],
    ["help", "help", "Help center", "Find answers and support"],
  ];
  return `${header("My account", "Manage your health and preferences.")}<div class="panel settings-panel"><div class="account-head"><div class="profile-avatar">AM</div><div><h2>${esc(state.profile.name)}</h2><p>${state.profile.age} years · ${state.profile.gender} · Fictional patient</p><button class="text-link" data-action="edit-profile" style="padding:7px 0 0">View and edit profile ${I("chevron")}</button></div></div>${rows.map(([path, ico, t, s]) => `<button class="setting-row" data-go="${path}">${I(ico)}<span><h3>${t}</h3><p>${s}</p></span>${I("chevron", "chev")}</button>`).join("")}<button class="setting-row" data-action="controls">${I("settings")}<span><h3>Demo controls</h3><p>Role, messaging and failure simulation</p></span>${I("chevron", "chev")}</button></div>`;
}
function articles() {
  return `${header("Health articles", "A little inspiration for your everyday wellbeing.")}<div class="catalog-grid">${[
    [
      "leaf",
      "Make a little space for yourself",
      "Build a quiet moment into your day.",
    ],
    [
      "sun",
      "Build a routine that works for you",
      "Start small and keep it simple.",
    ],
    [
      "heart",
      "Preparing for a consultation",
      "Keep your questions and records handy.",
    ],
  ]
    .map(
      ([ico, t, s], i) =>
        `<button class="panel catalog-card" data-article="${i}"><span class="specialty-circle ${["green", "yellow", "pink"][i]}">${I(ico)}</span><h3>${t}</h3><p>${s}</p><span class="text-link">Read article ${I("arrow")}</span></button>`,
    )
    .join("")}</div>`;
}
function help() {
  return `${header("Help & support", "Find your way around the demo.")}<div class="panel settings-panel">${["How do I continue a consultation?", "Are these real doctors?", "Where are my messages saved?", "Can I book or make a payment?", "How do I test failed messages?"].map((q, i) => `<button class="support-question" data-faq="${i}">${q}${I("chevron")}</button>`).join("")}<button class="primary-btn full" style="margin-top:23px" data-action="unavailable">${I("chat")}Contact support</button></div>`;
}
function generic(type) {
  const config = {
    appointments: [
      "Appointments",
      "No upcoming appointments",
      "Clinic booking is not connected in this demo.",
      "calendar",
    ],
    orders: [
      "Medicine orders",
      "No orders yet",
      "Medicine checkout is not connected in this demo.",
      "pill",
    ],
    insurance: [
      "My insurance policy",
      "No policy added",
      "Insurance integrations are not connected in this demo.",
      "shield",
    ],
    payments: [
      "Payments & HealthCash",
      "No transactions",
      "No payments have been made. Demo consultations have no real charges.",
      "wallet",
    ],
    abha: [
      "ABHA",
      "Your health records, connected",
      "ABHA creation and identity verification are unavailable in this demo.",
      "heart",
    ],
  };
  if (type === "family")
    return `${header("Family members", "Demo patient profile", "account")}<div class="panel settings-panel"><div class="account-head"><span class="profile-avatar">AM</span><div><h2>${esc(state.profile.name)}</h2><p>Self · ${state.profile.age} years · ${state.profile.gender}</p></div></div><button class="outline-btn full" data-action="unavailable">${I("plus")}Add family member</button></div>`;
  if (type === "my-doctors") {
    const ids = new Set(patientCons().map((c) => c.doctorId));
    return `${header("My doctors", "Doctors from your demo consultations", "account")}${doctorData()
      .filter((x) => ids.has(x.id))
      .map(
        (doc) =>
          `<div class="panel" style="padding:23px;margin-bottom:15px">${doctorRow(doc)}<button class="text-link" style="margin-top:16px" data-go="doctor/${doc.id}">View profile ${I("chevron")}</button></div>`,
      )
      .join("")}`;
  }
  if (type === "reminders")
    return `${header("Health reminders", "A place for everyday habits", "account")}${empty("Your routine starts here", "Reminder notifications are not available in this demo.", "bell")}`;
  const x = config[type];
  return x
    ? `${header(x[0], "", "account")}${empty(x[1], x[2], x[3])}`
    : notFound();
}
function render() {
  route = location.hash.slice(1).split("/").filter(Boolean);
  const view = current();
  if (view === "pro") {
    role = "doctor";
    pro.render();
    return;
  }
  role = "patient";
  app.innerHTML = shell(
    view === "home"
      ? home()
      : view === "consultations"
        ? consultations()
        : view === "consultation"
          ? consultation(route[1])
          : view === "chat"
            ? chat(route[1])
            : view === "doctors"
              ? doctors()
              : view === "doctor"
                ? doctor(route[1])
                : view === "records"
                  ? records()
                  : view === "account"
                    ? account()
                    : view === "plus"
                      ? plus()
                      : view === "articles"
                        ? articles()
                        : view === "help"
                          ? help()
                          : catalogs[view]
                            ? catalog(view)
                            : view === "specialties" || view === "online"
                              ? `${header(view === "online" ? "Online consultation" : "Find your speciality", "Explore care by health concern.")}<div class="panel panel-pad">${specialtyGrid()}</div><div style="margin-top:25px">${activePanel()}</div><div class="soft-info">${I("help")}New consultations and video calls are not connected. Use your existing demo consultation to try text chat.</div>`
                              : generic(view),
  );
  if (view === "chat") {
    requestAnimationFrame(() => {
      const el = document.querySelector("#chat-messages");
      if (el) el.scrollTop = el.scrollHeight;
    });
    bindComposer();
  }
  document
    .querySelector("#global-search")
    ?.addEventListener("input", (e) => search(e.target.value));
}
function bindComposer() {
  const input = document.querySelector("#message-input");
  if (!input) return;
  input.addEventListener("input", () => {
    draft[route[1] + role] = input.value;
    document.querySelector("#send-message").disabled = !input.value.trim();
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 130) + "px";
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      submit();
    }
  });
  document.querySelector("#composer")?.addEventListener("submit", (e) => {
    e.preventDefault();
    submit();
  });
}
function submit() {
  const input = document.querySelector("#message-input"),
    id = route[1],
    body = input?.value.trim();
  if (!body || c(id)?.status !== "active") return;
  const key = id + role,
    prior = lastSubmit[key];
  if (prior && prior.text === body && Date.now() - prior.at < 1500) return;
  lastSubmit[key] = { text: body, at: Date.now() };
  const m = {
    id: crypto.randomUUID(),
    consultationId: id,
    sender: role,
    text: body,
    timestamp: ts(),
    status: "sending",
  };
  const fresh = localStorage.getItem(KEY);
  if (fresh) state = JSON.parse(fresh);
  state.messages.push(m);
  if (!save()) {
    state.messages.pop();
    return;
  }
  input.value = "";
  draft[key] = "";
  input.style.height = "auto";
  document.querySelector("#send-message").disabled = true;
  refreshChat(true);
  deliver(m.id);
  input.focus();
}
function deliver(id) {
  if (pending.has(id)) return;
  pending.add(id);
  const m = state.messages.find((x) => x.id === id);
  const fail = offline || !navigator.onLine || failNext;
  failNext = false;
  setTimeout(() => {
    pending.delete(id);
    const raw = localStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw);
    const msg = state.messages.find((x) => x.id === id);
    if (!msg) return;
    msg.status = fail ? "failed" : "sent";
    save();
    if (current() === "chat" && route[1] === msg.consultationId) refreshChat();
    else render();
    if (!fail && msg.sender === "patient" && autoReplies) {
      setTimeout(() => {
        const raw = localStorage.getItem(KEY);
        if (raw) state = JSON.parse(raw);
        if (
          state.messages.some((x) => x.replyTo === id) ||
          !state.messages.some((x) => x.id === id)
        )
          return;
        const count = state.messages.filter((x) => x.replyTo).length;
        state.messages.push({
          id: crypto.randomUUID(),
          consultationId: msg.consultationId,
          sender: "doctor",
          text: seed.demoReplies[count % seed.demoReplies.length],
          timestamp: ts(),
          status: "sent",
          replyTo: id,
        });
        save();
        if (current() === "chat" && route[1] === msg.consultationId)
          refreshChat();
        else render();
      }, 1500);
    }
  }, 650);
}
function search(q) {
  const el = document.querySelector("#search-results");
  q = q.trim().toLowerCase();
  el.classList.toggle("hide", !q);
  if (!q) return;
  const docs = doctorData().filter((x) =>
    (x.name + " " + x.specialty).toLowerCase().includes(q),
  );
  const cons = patientCons().filter((x) =>
    (
      x.id +
      " " +
      x.reason +
      " " +
      d(x.doctorId).name +
      " " +
      state.profile.name
    )
      .toLowerCase()
      .includes(q),
  );
  el.innerHTML =
    (docs.length ? '<div class="result-label">DOCTORS</div>' : "") +
      docs
        .map(
          (doc) =>
            `<button data-go="doctor/${doc.id}">${I("stethoscope")}<span><h3>${esc(doc.name)}</h3><p>${esc(doc.specialty)}</p></span></button>`,
        )
        .join("") +
      (cons.length ? '<div class="result-label">CONSULTATIONS</div>' : "") +
      cons
        .map(
          (x) =>
            `<button data-go="consultation/${x.id}">${I("chat")}<span><h3>${esc(d(x.doctorId).name)}</h3><p>${x.id} · ${fmt(x.date)} · ${x.status}</p></span></button>`,
        )
        .join("") ||
    '<p class="no-results">No matching demo doctors or consultations.</p>';
}
function modal(title, body) {
  overlay.innerHTML = `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="${title}"><div class="modal-head"><h2>${title}</h2><button class="icon-button" data-action="close" aria-label="Close dialog">${I("close")}</button></div>${body}</section></div>`;
  overlay.querySelector("button,input,select")?.focus();
}
function controls() {
  modal(
    "Demo controls",
    `<p>Test a persistent local conversation. This preview is not connected to Practo, Firebase or Supabase. Real multi-device messaging is unavailable.</p><label>Session role<select id="role-select"><option value="patient" ${role === "patient" ? "selected" : ""}>Patient</option><option value="doctor" ${role === "doctor" ? "selected" : ""}>Test doctor</option></select></label><label>Simulated doctor replies<input id="auto-replies" type="checkbox" ${autoReplies ? "checked" : ""}></label><label>Simulate offline<input id="offline-toggle" type="checkbox" ${offline ? "checked" : ""}></label><label>Fail next message<input id="fail-toggle" type="checkbox" ${failNext ? "checked" : ""}></label><p style="margin-top:15px;font-size:10px">For two local test sessions, open this URL in another tab, disable simulated replies in the patient tab, then choose Test doctor in the second tab. Both tabs share this browser’s storage.</p><div class="modal-actions"><button class="primary-btn full" data-action="apply-controls">Apply controls</button></div><button class="danger" data-action="confirm-reset">Reset local demo data</button>`,
  );
}
document.addEventListener("click", (e) => {
  const t = e.target.closest("button,a");
  if (e.target.classList.contains("modal-backdrop")) overlay.innerHTML = "";
  if (!t) return;
  if (t.dataset.go) {
    go(t.dataset.go);
    return;
  }
  if (t.dataset.filter) {
    filter = t.dataset.filter;
    render();
    return;
  }
  if (t.dataset.doctorFilter) {
    doctorFilter = t.dataset.doctorFilter;
    render();
    return;
  }
  if (t.dataset.specialty) {
    doctorFilter = t.dataset.specialty;
    go("doctors");
    return;
  }
  if (t.dataset.retry) {
    const m = state.messages.find((x) => x.id === t.dataset.retry);
    if (m && m.status === "failed") {
      m.status = "sending";
      save();
      refreshChat();
      deliver(m.id);
    }
    return;
  }
  if (t.dataset.record) {
    const x = c(t.dataset.record);
    modal(
      "Demo consultation summary",
      `<p><strong>DEMO RECORD — NOT A PRESCRIPTION</strong></p><dl class="data-grid"><div><dt>Patient</dt><dd>${esc(state.profile.name)}</dd></div><div><dt>Doctor</dt><dd>${esc(d(x.doctorId).name)}</dd></div><div><dt>Date</dt><dd>${fmt(x.date)}</dd></div><div><dt>Consultation</dt><dd>${x.id}</dd></div></dl><hr class="divider"><p>This fictional record demonstrates the record viewer. No diagnosis, medicine, signature or clinical instruction has been issued.</p>`,
    );
    return;
  }
  if (t.dataset.article !== undefined) {
    const texts = [
      [
        "Make a little space for yourself",
        "A pause between tasks. A few minutes outdoors. A conversation with someone you care about. Everyday wellbeing can begin with the things that fit naturally into your day.",
        "Choose a small habit you enjoy and make room for it. This is sample editorial content for the interface, not medical advice.",
      ],
      [
        "Build a routine that works for you",
        "Start by noticing what makes a day feel manageable. Keep your routine simple, allow room for change, and focus on consistency rather than perfection.",
        "This is sample editorial content, not medical advice.",
      ],
      [
        "Preparing for a consultation",
        "Write down your questions, the reason for your visit and any information you want to discuss. Keep previous records together so they are easy to find.",
        "This is sample editorial content, not medical advice.",
      ],
    ][+t.dataset.article];
    modal(
      texts[0],
      texts
        .slice(1)
        .map((p) => `<p>${p}</p>`)
        .join(""),
    );
    return;
  }
  if (t.dataset.faq !== undefined) {
    const answer = [
      "Open My consultations, select an active consultation and choose Continue chat.",
      "No. Every doctor and patient is fictional. Messages are local demo exchanges, not medical advice.",
      "Messages are saved in this browser’s local storage. Clearing site data removes them. Other tabs on this browser can share the conversation; other devices cannot.",
      "No. Booking, payment, calls and ordering are UI placeholders. No real transaction occurs.",
      "Open Demo controls, enable Fail next message or Simulate offline, then send a message. Disable offline mode and tap Failed · Tap to retry.",
    ][+t.dataset.faq];
    modal("Help & support", `<p>${answer}</p>`);
    return;
  }
  const action = t.dataset.action;
  if (action === "unavailable") toast("Not available in this demo");
  if (action === "close") overlay.innerHTML = "";
  if (action === "controls") controls();
  if (action === "scroll-chat") {
    const el = document.querySelector("#chat-messages");
    el.scrollTop = el.scrollHeight;
    t.classList.add("hide");
  }
  if (action === "notifications")
    modal(
      "Notifications",
      `<p>${totalUnread() ? `You have ${totalUnread()} unread demo messages.` : "You’re all caught up."}</p>${btn("View consultations", "consultations", "chat", "primary-btn full")}`,
    );
  if (action === "location")
    modal(
      "Choose your location",
      `<p>Location changes are local to this demo.</p><select class="form-input" id="location-select">${["Gurugram", "Bengaluru", "New Delhi", "Mumbai", "Pune", "Hyderabad"].map((x) => `<option ${state.profile.city === x ? "selected" : ""}>${x}</option>`).join("")}</select><button class="primary-btn full" data-action="save-location">Use location</button>`,
    );
  if (action === "save-location") {
    state.profile.city = document.querySelector("#location-select").value;
    save();
    overlay.innerHTML = "";
    render();
  }
  if (action === "edit-profile")
    modal(
      "Edit demo profile",
      `<p>Keep this fictional. Changes update every screen.</p><label for="profile-name">Patient name</label><input class="form-input" id="profile-name" maxlength="45" value="${esc(state.profile.name)}"><button class="primary-btn full" data-action="save-profile">Save profile</button>`,
    );
  if (action === "save-profile") {
    const name = document.querySelector("#profile-name").value.trim();
    if (!name) {
      toast("Enter a patient name");
      return;
    }
    state.profile.name = name;
    state.patients = state.patients.map((p) =>
      p.id === state.profile.id ? { ...p, name } : p,
    );
    save();
    overlay.innerHTML = "";
    render();
    toast("Demo profile updated");
  }
  if (action === "apply-controls") {
    role = document.querySelector("#role-select").value;
    sessionStorage.setItem("practo-role", role);
    autoReplies = document.querySelector("#auto-replies").checked;
    offline = document.querySelector("#offline-toggle").checked;
    failNext = document.querySelector("#fail-toggle").checked;
    overlay.innerHTML = "";
    if (role === "doctor") {
      if (location.hash.startsWith("#pro")) pro.render(true);
      else go("pro/dashboard");
    } else if (location.hash.startsWith("#pro")) go("home");
    else render();
    toast("Demo controls updated");
  }
  if (action === "confirm-reset")
    modal(
      "Reset demo data?",
      `<p>This removes messages and profile edits from this demo in this browser and restores the fictional seed data.</p><div class="modal-actions"><button class="outline-btn full" data-action="close">Keep my data</button><button class="primary-btn full" data-action="reset">Reset demo</button></div>`,
    );
  if (action === "reset") {
    localStorage.removeItem(KEY);
    load();
    draft = {};
    overlay.innerHTML = "";
    go("home");
    render();
    toast("Demo data restored");
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    overlay.innerHTML = "";
    document.querySelector("#search-results")?.classList.add("hide");
  }
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    document.querySelector("#global-search")?.focus();
  }
});
window.addEventListener("hashchange", () => {
  window.scrollTo(0, 0);
  render();
});
window.addEventListener("storage", (e) => {
  if (e.key === KEY && e.newValue) {
    try {
      state = JSON.parse(e.newValue);
      if (current() === "chat") refreshChat();
      else render();
    } catch {
      toast("Could not read updated demo data. Reload to recover.");
    }
  }
});
window.addEventListener("online", () => render());
window.addEventListener("offline", () => render());
async function start() {
  try {
    const response = await fetch("seed-data.json");
    if (!response.ok) throw Error("Seed data unavailable");
    seed = await response.json();
    load();
    initPro();
    render();
  } catch (e) {
    app.innerHTML = `<div class="initial-loading"><b>practo<span>•</span></b><h2>We couldn’t load your demo</h2><p>Check your connection, or restore the local demo if saved data is damaged.</p><button class="primary-btn" id="reload">Try again</button><button class="text-link" id="restore">Restore demo data</button></div>`;
    document.querySelector("#reload").onclick = () => location.reload();
    document.querySelector("#restore").onclick = () => {
      if (confirm("Remove saved local demo data and start again?")) {
        localStorage.removeItem(KEY);
        location.reload();
      }
    };
  }
}
start();
