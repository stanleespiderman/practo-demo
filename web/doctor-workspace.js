import {
  renderPrescription,
  prescriptionPdf,
  downloadCanvasPng,
} from "./prescription.js";
/* Doctor workspace. Every workflow is a local, fictional demo; no clinical service is connected. */
export function createDoctorWorkspace(api) {
  const { I, esc, avatar, fmt, toast, modal } = api;
  // ?doctor=<id> pins the starting doctor (used by the fixed mobile review frames).
  let selected =
    new URLSearchParams(location.search).get("doctor") ||
    sessionStorage.getItem("practo-doctor-id") ||
    "doc-ananya";
  let page = "dashboard",
    id = "",
    tab = "all",
    query = "",
    day = "2026-11-04",
    signature = "",
    drafts = {},
    editorDraft = {},
    patientQuery = "";
  const S = () => api.getState(),
    D = () => S().doctors.find((d) => d.id === selected) || S().doctors[0];
  const patient = (pid) =>
    S().patients.find((p) => p.id === pid) || S().profile;
  const own = () => S().consultations.filter((c) => c.doctorId === D().id);
  const cons = (cid) => own().find((c) => c.id === cid);
  const documents = () => S().documents.filter((d) => d.doctorId === D().id);
  const messages = (cid) =>
    S()
      .messages.filter(
        (m) =>
          m.consultationId === cid &&
          (m.sender === "doctor" || m.status === "sent"),
      )
      .sort((a, b) => a.timestamp - b.timestamp || a.id.localeCompare(b.id));
  const unread = (cid) => api.unread(cid, "doctor");
  const todayAppointments = () =>
    S().appointments.filter((a) => a.doctorId === D().id && a.date === day);
  const money = (n) => "₹" + Number(n).toLocaleString("en-IN");
  const initials = (p) =>
    p.name
      .split(" ")
      .map((x) => x[0])
      .slice(0, 2)
      .join("");
  const pa = (pid) =>
    `<span class="patient-avatar">${esc(initials(patient(pid)))}</span>`;
  const status = (s) =>
    `<span class="pro-status ${s}">${esc({ active: "Active", completed: "Completed", scheduled: "Scheduled", "checked-in": "Checked in", cancelled: "Cancelled", draft: "Draft", shared: "Shared locally", paid: "Demo paid", unpaid: "Unpaid" }[s] || s)}</span>`;
  const go = (p = "dashboard") => api.go("pro/" + p);
  const actions = (cid) =>
    `<button class="pro-primary" data-pro-go="chat/${cid}">${I("chat")}Open workspace</button>`;
  function update(fn, renderNow = true) {
    const ok = api.commit(fn);
    if (ok && renderNow) render(true);
    return ok;
  }
  function stamp() {
    return Math.max(Date.now(), ...S().messages.map((m) => m.timestamp + 1));
  }
  function isOwnPatient(pid) {
    return (
      own().some((c) => c.patientId === pid) ||
      S().appointments.some((a) => a.doctorId === D().id && a.patientId === pid)
    );
  }
  function stats() {
    const aps = todayAppointments();
    return {
      appointments: aps.filter((x) => x.status !== "cancelled").length,
      active: own().filter((c) => c.status === "active").length,
      waiting: own().filter((c) => unread(c.id) > 0).length,
      drafts: documents().filter((x) => x.status === "draft").length,
      revenue: S()
        .invoices.filter((x) => x.doctorId === D().id && x.status === "paid")
        .reduce((n, x) => n + x.amount, 0),
    };
  }
  const nav = [
    ["dashboard", "home", "Overview"],
    ["calendar", "calendar", "Calendar"],
    ["consultations", "chat", "Consultations"],
    ["patients", "users", "Patients"],
    ["documents", "file", "Summary & Rx"],
    ["billing", "wallet", "Billing"],
    ["reports", "sun", "Reports"],
    ["feedback", "star", "Patient feedback"],
    ["health-feed", "book", "Health feed"],
    ["communications", "bell", "Communications"],
    ["inventory", "pill", "Inventory"],
    ["profile", "user", "My profile"],
  ];
  function shell(body) {
    const dr = D(),
      st = stats();
    return `<div class="pro-app"><aside class="pro-sidebar"><button class="logo" data-pro-go="dashboard">practo<span>•</span><b class="pro-word">PRO</b></button><div class="pro-clinic"><span class="pro-clinic-icon">${I("stethoscope")}</span><div><strong>${esc(dr.clinic)}</strong><small>Fictional demo practice</small></div></div><label class="pro-doctor-label" for="pro-doctor-select">DOCTOR WORKSPACE</label><select id="pro-doctor-select" class="pro-doctor-select">${S()
      .doctors.map(
        (d) =>
          `<option value="${d.id}" ${selected === d.id ? "selected" : ""}>${esc(d.name)}</option>`,
      )
      .join(
        "",
      )}</select><nav>${nav.map(([path, icon, text]) => `<button class="pro-nav ${page === path || (path === "consultations" && page === "chat") || (path === "patients" && page === "patient") ? "selected" : ""}" data-pro-go="${path}">${I(icon)}${text}${path === "consultations" && st.waiting ? `<span>${st.waiting}</span>` : ""}</button>`).join("")}</nav><div class="pro-sidebar-bottom"><button data-pro-action="patient-app" class="pro-nav">${I("logout")}Patient app</button><span class="pro-local">● &nbsp; LOCAL DEMO WORKSPACE</span></div></aside><main class="pro-main"><header class="pro-topbar"><div><span class="pro-breadcrumb">My practice</span>${I("chevron")}<strong>${esc(nav.find((n) => n[0] === page)?.[2] || (page === "chat" ? "Consultation workspace" : page === "patient" ? "Patient chart" : page === "editor" ? "Document editor" : "Page not found"))}</strong></div><div class="pro-top-actions"><button class="icon-button" data-action="controls" aria-label="Demo controls">${I("settings")}</button><button class="pro-switch-mobile" data-pro-action="switch-doctor">${I("users")}Switch doctor</button><button class="pro-ghost" data-pro-action="patient-app">Patient app ${I("arrow")}</button><span class="pro-divider"></span>${avatar(dr)}<span class="pro-top-doctor"><b>${esc(dr.name)}</b><small>${esc(dr.specialty)}</small></span></div></header><div class="pro-body">${body}</div><nav class="pro-mobile-nav">${[
      ["dashboard", "home", "Overview"],
      ["calendar", "calendar", "Calendar"],
      ["consultations", "chat", "Consults"],
      ["patients", "users", "Patients"],
      ["documents", "file", "Summary & Rx"],
    ]
      .map(
        ([p, ico, l]) =>
          `<button data-pro-go="${p}" class="${page === p ? "selected" : ""}">${I(ico)}${l}</button>`,
      )
      .join(
        "",
      )}<button data-pro-action="more">${I("settings")}More</button></nav></main></div>`;
  }
  function heading(title, sub, buttons = "") {
    return `<div class="pro-heading"><div><p class="pro-eyebrow">${esc(D().specialty)} · ${esc(D().demoCode)}</p><h1>${esc(title)}</h1><p>${esc(sub)}</p></div><div class="pro-heading-actions">${buttons}</div></div>`;
  }
  function kpis() {
    const s = stats();
    return `<div class="pro-kpis">${[
      [s.appointments, "Appointments", "calendar", "On the selected day"],
      [s.waiting, "Awaiting a reply", "chat", "Across your conversations"],
      [s.drafts, "Document drafts", "file", "Ready for your review"],
      [
        money(s.revenue),
        "Demo collections",
        "wallet",
        "Recorded locally · no payments",
      ],
    ]
      .map(
        ([v, l, ico, n]) =>
          `<div class="pro-kpi"><span>${I(ico)}</span><div><p>${l}</p><strong>${v}</strong><small>${n}</small></div></div>`,
      )
      .join("")}</div>`;
  }
  function section(title, extra = "") {
    return `<div class="pro-section-heading"><h2>${title}</h2>${extra}</div>`;
  }
  function patientLabel(pid, sub = "") {
    const p = patient(pid);
    return `<div class="pro-patient-cell">${pa(pid)}<span><strong>${esc(p.name)}</strong><small>${sub || `${p.age} years · ${p.gender}`}</small></span></div>`;
  }
  function appointmentRows(list) {
    return list.length
      ? `<div class="pro-table-wrap"><table class="pro-table"><thead><tr><th>Patient</th><th>Time</th><th>Visit</th><th>Status</th><th></th></tr></thead><tbody>${list.map((a) => `<tr><td>${patientLabel(a.patientId)}</td><td><strong>${a.time}</strong><small>${a.date}</small></td><td>${a.mode === "Video" ? I("video") : I("stethoscope")} ${a.mode}</td><td>${status(a.status)}</td><td><button class="pro-text" data-pro-appointment="${a.id}">Manage ${I("chevron")}</button></td></tr>`).join("")}</tbody></table></div>`
      : `<div class="pro-empty">${I("calendar")}<h3>Your calendar is clear</h3><p>Add a fictional appointment to test the workflow.</p></div>`;
  }
  function overview() {
    const dr = D();
    const alerts = own()
      .filter((c) => unread(c.id) > 0)
      .slice(0, 3);
    return `${heading("Welcome back, " + dr.name.replace("Dr. ", "").split(" ")[0] + ".", "A little clarity for your day. Your practice, at a glance.", `<button class="pro-secondary" data-pro-go="documents">${I("file")}Create document</button><button class="pro-primary" data-pro-action="new-appointment">${I("plus")}New appointment</button>`)}${kpis()}<div class="pro-dashboard-grid"><div><section class="pro-card">${section("Your schedule", `<input type="date" class="pro-date" value="${day}" id="pro-day">`)}${appointmentRows(todayAppointments().sort((a, b) => a.time.localeCompare(b.time)))}<button class="pro-card-footer" data-pro-go="calendar">View full calendar ${I("arrow")}</button></section><section class="pro-card" style="margin-top:22px">${section("Conversations needing you", `<button class="pro-text" data-pro-go="consultations">View all ${I("arrow")}</button>`)}${alerts.length ? alerts.map((c) => `<div class="pro-inbox-row">${patientLabel(c.patientId, c.reason)}<span class="pro-unread">${unread(c.id)}</span><button class="pro-secondary" data-pro-go="chat/${c.id}">Reply ${I("arrow")}</button></div>`).join("") : '<div class="pro-empty"><h3>You’re all caught up</h3><p>New messages will appear here.</p></div>'}</section></div><aside><section class="pro-availability"><div><span class="pro-availability-icon">${I("video")}</span><button class="pro-toggle ${dr.available ? "on" : ""}" data-pro-action="availability" aria-label="Toggle demo availability" aria-pressed="${dr.available}"><i></i></button></div><h3>${dr.available ? "Ready for consultations" : "Taking a break"}</h3><p>${dr.available ? "You are available in this demo workspace." : "New demo appointments can still be scheduled."}</p><span class="pro-online">${dr.available ? "● Available for demo care" : "○ Not available"}</span></section><section class="pro-card pro-quick">${section("Quick actions")}<button data-pro-action="new-document">${I("file")}Create Summary & Rx ${I("chevron")}</button><button data-pro-go="patients">${I("users")}View patient charts ${I("chevron")}</button><button data-pro-action="new-invoice">${I("wallet")}Create demo invoice ${I("chevron")}</button><button data-pro-go="profile">${I("user")}Manage doctor profile ${I("chevron")}</button></section><div class="pro-notice">${I("shield")}<div><b>A safe place to explore.</b><p>10 fictional doctors. Demo patient data. Medical documents are clearly marked and have no clinical validity.</p></div></div></aside></div>`;
  }
  function inbox() {
    let list = own().filter(
      (c) =>
        tab === "all" ||
        (tab === "unread" ? unread(c.id) > 0 : c.status === tab),
    );
    return `${heading("Your consultations", "Keep the conversation going. Review and respond to your patients.")}<div class="pro-toolbar"><div class="pro-tabs">${[
      ["all", "All consultations"],
      ["unread", "Needs reply"],
      ["active", "Active"],
      ["completed", "Completed"],
    ]
      .map(
        ([v, l]) =>
          `<button data-pro-filter="${v}" class="${tab === v ? "selected" : ""}">${l} <small>${own().filter((c) => v === "all" || (v === "unread" ? unread(c.id) > 0 : c.status === v)).length}</small></button>`,
      )
      .join(
        "",
      )}</div></div><div class="pro-consult-grid">${list.map((c) => `<section class="pro-card pro-consult-card"><div class="pro-card-title">${patientLabel(c.patientId)}${status(c.status)}</div><p>${esc(c.reason)}</p><div class="pro-consult-meta"><span>${I("calendar")}${fmt(c.date)}</span><span>${I("clock")}${fmt(c.date, "time")}</span><small>${c.id}</small></div><div class="pro-consult-bottom"><span>${unread(c.id) ? `<i class="pro-unread">${unread(c.id)}</i> unread messages` : "Conversation up to date"}</span>${actions(c.id)}</div></section>`).join("") || '<div class="pro-empty pro-card"><h3>No consultations in this view</h3><p>Choose another filter.</p></div>'}</div>`;
  }
  function chatMessage(m) {
    return `<div class="message ${m.sender === "doctor" ? "mine" : ""}"><div class="message-bubble">${esc(m.text)}${m.documentId ? `<button class="pro-document-attachment" data-pro-document="${m.documentId}">${I("file")}Open demo document</button>` : ""}</div><div class="message-meta">${fmt(m.timestamp, "time")} · ${m.status === "failed" ? `<button data-pro-retry="${m.id}" class="retry-btn">Failed · Retry</button>` : m.status === "sending" ? "Sending…" : m.sender === "doctor" ? "Sent locally ✓" : "Patient · Demo"}</div></div>`;
  }
  function chatView(cid) {
    const c = cons(cid);
    if (!c) return noAccess();
    const p = patient(c.patientId);
    api.markRead(cid, "doctor");
    return `${heading("Consultation workspace", `${c.id} · Fictional patient`, `<button class="pro-secondary" data-pro-patient-app="${c.id}">${I("user")}View as patient</button><button class="pro-secondary" data-pro-go="consultations">${I("back")}Inbox</button>`)}<div class="pro-workspace"><section class="pro-chat"><header>${patientLabel(p.id, c.reason)}${status(c.status)}<button class="icon-button" data-pro-action="unavailable" aria-label="Start video call">${I("video")}</button></header><div class="pro-chat-note">Local demo · You are ${esc(D().name)} · No live clinical service</div><div id="pro-chat-messages" class="pro-chat-messages">${messages(cid).map(chatMessage).join("")}</div><button id="pro-new-messages" class="new-messages hide" data-pro-action="scroll-chat">New messages ↓</button>${c.status === "active" ? `<form id="pro-chat-form" class="pro-composer"><button type="button" class="icon-button" data-pro-edit="${cid}" aria-label="Add summary or prescription draft">${I("file")}</button><textarea id="pro-message" aria-label="Doctor message" placeholder="Message ${esc(p.name.split(" ")[0])}…" maxlength="2000" rows="1">${esc(drafts[cid] || "")}</textarea><button class="pro-primary" aria-label="Send doctor message" ${drafts[cid]?.trim() ? "" : "disabled"}>${I("send")}</button></form>` : '<div class="pro-chat-note">Consultation completed · History remains available</div>'}</section><aside class="pro-clinical"><section class="pro-card"><div class="pro-card-title"><h3>Patient snapshot</h3><button class="pro-text" data-pro-go="patient/${p.id}">Full chart ${I("arrow")}</button></div><dl><div><dt>Patient</dt><dd>${esc(p.name)}</dd></div><div><dt>Age / gender</dt><dd>${p.age} years · ${p.gender}</dd></div><div><dt>Allergies</dt><dd>${esc(p.allergies || "Not recorded")}</dd></div><div><dt>History</dt><dd>${esc(p.history || "No history recorded")}</dd></div></dl></section><section class="pro-card"><h3>Clinical tools</h3><button class="pro-primary full" data-pro-edit="${cid}">${I("file")}Summary & Rx</button><button class="pro-secondary full" data-pro-note="${cid}">${I("book")}Private clinical note</button>${
      documents()
        .filter((x) => x.consultationId === cid)
        .map(
          (doc) =>
            `<button class="pro-doc-mini" data-pro-document="${doc.id}">${I("file")}<span>${esc(doc.title)}<small>${doc.status === "shared" ? "Shared with patient" : "Draft · only in doctor workspace"}</small></span>${I("chevron")}</button>`,
        )
        .join("") ||
      '<p class="pro-hint">No documents created for this consultation yet.</p>'
    }${c.status === "active" ? `<button class="pro-text pro-complete" data-pro-complete="${cid}">${I("check")}Complete demo consultation</button>` : ""}</section><div class="pro-notice compact">${I("lock")}Private notes stay in this doctor’s workspace. Only shared documents appear in the patient app.</div></aside></div>`;
  }
  function refreshChat() {
    const el = document.querySelector("#pro-chat-messages");
    if (!el || !cons(id)) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 95,
      top = el.scrollTop;
    el.innerHTML = messages(id).map(chatMessage).join("");
    api.markRead(id, "doctor");
    if (near) el.scrollTop = el.scrollHeight;
    else {
      el.scrollTop = top;
      document.querySelector("#pro-new-messages")?.classList.remove("hide");
    }
  }
  function directory() {
    const ids = new Set([
      ...own().map((c) => c.patientId),
      ...S()
        .appointments.filter((a) => a.doctorId === D().id)
        .map((a) => a.patientId),
    ]);
    const list = S().patients.filter(
      (p) =>
        ids.has(p.id) &&
        p.name.toLowerCase().includes(patientQuery.toLowerCase()),
    );
    return `${heading("Your patients", "A clear view of the people in your care.", `<button class="pro-primary" data-pro-action="new-appointment">${I("plus")}Add demo visit</button>`)}<div class="pro-search">${I("search")}<input id="pro-patient-search" value="${esc(patientQuery)}" placeholder="Search your patients…" aria-label="Search your patients"></div><div class="pro-patient-grid">${list.map((p) => `<button class="pro-card pro-patient-card" data-pro-go="patient/${p.id}">${pa(p.id)}<h3>${esc(p.name)}</h3><p>${p.age} years · ${p.gender}</p><small>${own().filter((c) => c.patientId === p.id).length} consultations · ${documents().filter((d) => d.patientId === p.id).length} documents</small><span>Open patient chart ${I("arrow")}</span></button>`).join("") || '<div class="pro-empty pro-card"><h3>No patients found</h3><p>Try another name.</p></div>'}</div>`;
  }
  function chart(pid) {
    if (!isOwnPatient(pid)) return noAccess();
    const p = patient(pid),
      list = own().filter((c) => c.patientId === pid);
    return `${heading(p.name, `${p.age} years · ${p.gender} · ${p.id}`, `<button class="pro-secondary" data-pro-go="patients">${I("back")}All patients</button>`)}<div class="pro-chart-grid"><section class="pro-card pro-chart-info"><h2>Patient information</h2><dl><div><dt>Allergies</dt><dd>${esc(p.allergies || "Not recorded")}</dd></div><div><dt>Medical history</dt><dd>${esc(p.history || "Not recorded")}</dd></div><div><dt>Location</dt><dd>${esc(p.city)}</dd></div></dl><p class="pro-hint">Fictional patient profile. This is not a real medical chart.</p></section><section class="pro-card">${section("Consultation history")}${list.map((c) => `<div class="pro-inbox-row"><div><h3>${esc(c.reason)}</h3><small>${fmt(c.date)} · ${c.id}</small></div>${status(c.status)}<button class="pro-text" data-pro-go="chat/${c.id}">Open ${I("arrow")}</button></div>`).join("")}${section("Private clinical notes")}${
      S()
        .notes.filter((n) => n.doctorId === D().id && n.patientId === pid)
        .map(
          (n) =>
            `<div class="pro-note-entry"><small>${fmt(n.updatedAt)} · ${n.consultationId}</small><p>${esc(n.text)}</p></div>`,
        )
        .join("") || '<p class="pro-empty-inline">No notes saved yet.</p>'
    }${section("Documents")}${
      documents()
        .filter((d) => d.patientId === pid)
        .map(
          (d) =>
            `<button class="pro-doc-mini" data-pro-document="${d.id}">${I("file")}<span>${esc(d.title)}<small>${d.status === "shared" ? "Shared locally" : "Private draft"}</small></span>${I("chevron")}</button>`,
        )
        .join("") || '<p class="pro-empty-inline">No medical documents yet.</p>'
    }</section></div>`;
  }
  function calendar() {
    return `${heading("Your calendar", "Schedule, check in and manage fictional visits.", `<button class="pro-primary" data-pro-action="new-appointment">${I("plus")}New appointment</button>`)}<div class="pro-calendar-toolbar"><button class="pro-secondary" data-pro-day-shift="-1">${I("back")}</button><input type="date" class="pro-date" id="pro-day" value="${day}"><button class="pro-secondary" data-pro-day-shift="1">${I("arrow")}</button><span>${todayAppointments().filter((a) => a.status !== "cancelled").length} visits</span></div><section class="pro-card">${appointmentRows(todayAppointments().sort((a, b) => a.time.localeCompare(b.time)))}</section><p class="pro-hint">Calendar actions update demo records only. No booking confirmations or reminders are sent.</p>`;
  }
  function documentList() {
    return `${heading("Summary & Rx", "Create, review and share clearly marked demo medical records.", `<button class="pro-primary" data-pro-action="new-document">${I("plus")}Create document</button>`)}<div class="pro-documents">${
      documents()
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map(
          (d) =>
            `<section class="pro-card pro-document-card"><div class="pro-document-icon">${I("file")}</div><div><h3>${esc(d.title)}</h3><p>${esc(patient(d.patientId).name)} · ${d.consultationId}</p><small>${fmt(d.updatedAt)} · ${d.id}</small></div>${status(d.status)}<button class="pro-secondary" data-pro-document="${d.id}">Open ${I("arrow")}</button></section>`,
        )
        .join("") ||
      `<div class="pro-card pro-empty">${I("file")}<h3>Your first document starts here</h3><p>Choose a consultation, write a summary or prescription draft, then review before sharing.</p><button class="pro-primary" data-pro-action="new-document">Create a demo document</button></div>`
    }</div><div class="pro-notice">${I("shield")}Every preview and PDF is marked DEMO — NOT VALID FOR MEDICAL USE. No real doctor signature or registration number is included.</div>`;
  }
  function editor(cid, docId = "") {
    const c = cons(cid),
      existing = documents().find((d) => d.id === docId);
    if (!c) return noAccess();
    if (existing?.status === "shared") {
      openDocument(existing.id);
      return documentList();
    }
    const draft = editorDraft[cid] || existing || {};
    const p = patient(c.patientId);
    return `${heading("Create medical document", `${p.name} · ${c.id}`, `<button class="pro-secondary" data-pro-go="chat/${cid}">${I("back")}Consultation</button>`)}<div class="pro-editor-grid"><form id="pro-document-form" data-consultation="${cid}" data-document="${existing?.id || draft.id || ""}" class="pro-card pro-form"><div class="pro-form-banner">${I("shield")}DEMO DOCUMENT · NOT VALID FOR MEDICAL USE</div><div class="pro-form-row"><label>Document type<select name="type">${["Consultation summary", "Prescription draft", "Lab request", "Medical certificate demo"].map((t) => `<option ${draft.type === t ? "selected" : ""}>${t}</option>`).join("")}</select></label><label>Document title<input name="title" maxlength="100" value="${esc(draft.title || "Consultation summary")}" required></label></div><div class="pro-form-row"><label>Patient<input value="${esc(p.name)}" disabled></label><label>Doctor<input value="${esc(D().name)}" disabled></label></div><label>Presenting concern<textarea name="complaint" rows="2" maxlength="2000" placeholder="Enter the fictional presenting concern…">${esc(draft.complaint || "")}</textarea></label><div class="pro-form-row"><label>Observations / examination<textarea name="observations" rows="3" maxlength="2000" placeholder="Demo observations only">${esc(draft.observations || "")}</textarea></label><label>Assessment / provisional diagnosis<textarea name="assessment" rows="3" maxlength="2000" placeholder="Enter a fictional assessment, if needed">${esc(draft.assessment || "")}</textarea></label></div><label>Medicine entries <span class="pro-field-note">Manual demo entries only · no automatic treatment suggestions</span><textarea name="medicines" rows="3" maxlength="2000" placeholder="Medicine name | directions | duration — one per line">${esc(draft.medicines || "")}</textarea></label><div class="pro-form-row"><label>Investigations / tests<textarea name="tests" rows="3" maxlength="2000">${esc(draft.tests || "")}</textarea></label><label>Advice / plan<textarea name="advice" rows="3" maxlength="2000">${esc(draft.advice || "")}</textarea></label></div><label>Follow-up date<input type="date" name="followUp" value="${esc(draft.followUp || "")}"></label><div class="pro-form-actions"><button class="pro-primary" type="submit">${I("check")}Save draft</button><span>Saving does not share the document with the patient.</span></div></form><aside><section class="pro-card pro-editor-aside"><h3>Document checklist</h3><p>${I("check")}Patient and doctor stay linked</p><p>${I("check")}Drafts remain in your workspace</p><p>${I("check")}Review before sharing locally</p><p>${I("check")}Shared versions are read-only</p><p>${I("check")}Demo mark stays on every PDF page</p></section><div class="pro-notice">${I("lock")}Do not enter real health data. This workspace is for development and testing.</div></aside></div>`;
  }
  function billing() {
    const inv = S().invoices.filter((i) => i.doctorId === D().id);
    return `${heading("Billing", "Manage illustrative invoices and local payment records.", `<button class="pro-primary" data-pro-action="new-invoice">${I("plus")}Create demo invoice</button>`)}${kpis()}<section class="pro-card">${section("Invoices")}<div class="pro-table-wrap"><table class="pro-table"><thead><tr><th>Invoice / Patient</th><th>Description</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>${inv.map((i) => `<tr><td><b>${i.id}</b><small>${esc(patient(i.patientId).name)}</small></td><td>${esc(i.description)}</td><td>${money(i.amount)}</td><td>${status(i.status)}</td><td>${i.status === "unpaid" ? `<button class="pro-text" data-pro-pay="${i.id}">Record demo payment</button>` : "Local record only"}</td></tr>`).join("") || '<tr><td colspan="5" class="pro-empty-inline">No invoices yet.</td></tr>'}</tbody></table></div></section><div class="pro-notice">${I("wallet")}No money is collected or transferred. “Demo paid” is a test ledger status, not a payment confirmation.</div>`;
  }
  function reports() {
    const cs = own(),
      completed = cs.filter((c) => c.status === "completed").length;
    return `${heading("Practice reports", "A live summary of your local demo activity.")}<div class="pro-kpis">${[
      [cs.length, "Total consultations"],
      [completed, "Completed"],
      [
        documents().filter((d) => d.status === "shared").length,
        "Shared documents",
      ],
      [money(stats().revenue), "Demo collections"],
    ]
      .map(
        ([v, t]) =>
          `<div class="pro-kpi"><div><p>${t}</p><strong>${v}</strong><small>Derived from saved demo records</small></div></div>`,
      )
      .join(
        "",
      )}</div><div class="pro-chart-grid"><section class="pro-card pro-report"><h2>Consultation outcomes</h2>${[
      ["Active", cs.length - completed],
      ["Completed", completed],
    ]
      .map(
        ([t, n]) =>
          `<div class="pro-bar-row"><span>${t}</span><div><i style="width:${Math.max(0, (n / Math.max(1, cs.length)) * 100)}%"></i></div><b>${n}</b></div>`,
      )
      .join(
        "",
      )}</section><section class="pro-card pro-report"><h2>Document activity</h2>${["draft", "shared"].map((t) => `<div class="pro-report-number"><span>${t === "draft" ? "Private drafts" : "Shared locally"}</span><b>${documents().filter((d) => d.status === t).length}</b></div>`).join("")}</section></div>`;
  }
  function feedback() {
    return `${heading("Patient feedback", "Read fictional patient stories and save local replies.")}<div class="pro-consult-grid">${S()
      .feedback.filter((f) => f.doctorId === D().id)
      .map(
        (f) =>
          `<section class="pro-card pro-feedback"><div class="pro-card-title">${patientLabel(f.patientId)}<span class="pro-stars">${"★".repeat(f.rating)}</span></div><p>${esc(f.text)}</p><small>${f.date} · Demo story</small>${f.reply ? `<blockquote><b>Your local reply</b><p>${esc(f.reply)}</p></blockquote>` : ""}<button class="pro-secondary" data-pro-feedback="${f.id}">${f.reply ? "Edit reply" : "Write a reply"}</button></section>`,
      )
      .join("")}</div>`;
  }
  function feed() {
    return `${heading("Health feed", "Draft articles for your demo practice. Nothing is published to Practo.", `<button class="pro-primary" data-pro-action="new-article">${I("plus")}Write an article</button>`)}<div class="pro-consult-grid">${
      S()
        .articles.filter((a) => a.doctorId === D().id)
        .map(
          (a) =>
            `<section class="pro-card pro-feedback"><span class="pro-status">${a.status === "published" ? "Published in local demo" : "Draft"}</span><h2>${esc(a.title)}</h2><p>${esc(a.body)}</p><button class="pro-secondary" data-pro-article="${a.id}">Edit article</button></section>`,
        )
        .join("") ||
      '<div class="pro-card pro-empty"><h3>Share an idea with your demo patients</h3><p>Create an article draft to explore the health-feed workflow.</p></div>'
    }</div>`;
  }
  function communications() {
    return `${heading("Communications", "Prepare appointment and follow-up messages. No SMS or email is sent.", `<button class="pro-primary" data-pro-action="new-reminder">${I("plus")}Draft reminder</button>`)}<section class="pro-card">${section("Saved drafts")}${
      S()
        .reminderDrafts.filter((r) => r.doctorId === D().id)
        .map(
          (r) =>
            `<div class="pro-inbox-row"><div>${patientLabel(r.patientId)}<p>${esc(r.text)}</p><small>${r.channel} · Saved locally</small></div>${status("draft")}</div>`,
        )
        .join("") ||
      '<div class="pro-empty"><h3>No reminder drafts yet</h3><p>Use a fictional patient to explore the composer.</p></div>'
    }</section>`;
  }
  function inventory() {
    return `${heading("Inventory", "Track sample clinic stock in this local workspace.", `<button class="pro-primary" data-pro-action="new-stock">${I("plus")}Add stock item</button>`)}<section class="pro-card"><div class="pro-table-wrap"><table class="pro-table"><thead><tr><th>Item</th><th>Category</th><th>Quantity</th><th></th></tr></thead><tbody>${
      S()
        .inventory.filter((i) => i.doctorId === D().id)
        .map(
          (i) =>
            `<tr><td><b>${esc(i.name)}</b><small>${i.id}</small></td><td>${esc(i.category)}</td><td>${i.quantity}</td><td><button class="pro-text" data-pro-stock="${i.id}">Update stock</button></td></tr>`,
        )
        .join("") ||
      '<tr><td colspan="4" class="pro-empty-inline">No sample stock items yet.</td></tr>'
    }</tbody></table></div></section>`;
  }
  function profile() {
    const dr = D();
    return `${heading("My doctor profile", "Fictional identity and practice preferences. Changes appear in the patient app.")}<form id="pro-profile-form" class="pro-card pro-form" style="max-width:850px"><div class="pro-profile-head">${avatar(dr)}<div><h2>${esc(dr.name)}</h2><p>${dr.demoCode} · ${dr.age ? dr.age + " years · " : ""}Fictional profile</p></div></div><div class="pro-form-row"><label>Display name<input name="name" required maxlength="70" value="${esc(dr.name)}"></label><label>Speciality<input name="specialty" required maxlength="70" value="${esc(dr.specialty)}"></label></div><label>Qualifications (fictional)<input name="qualification" required maxlength="120" value="${esc(dr.qualification)}"></label><div class="pro-form-row"><label>Experience (years)<input name="experience" type="number" min="0" max="60" required value="${dr.experience}"></label><label>Demo fee (₹)<input name="fee" type="number" min="0" max="100000" required value="${dr.fee}"></label></div><div class="pro-form-row"><label>Clinic name<input name="clinic" required maxlength="100" value="${esc(dr.clinic)}"></label><label>Working hours<input name="workHours" maxlength="60" value="${esc(dr.workHours || "09:00–18:00")}"></label></div><label>Profile bio<textarea name="bio" rows="4" maxlength="1500">${esc(dr.bio || "")}</textarea></label><label class="pro-checkbox"><input name="available" type="checkbox" ${dr.available ? "checked" : ""}>Available in demo</label><button class="pro-primary" type="submit">${I("check")}Save profile</button><p class="pro-hint">No registration numbers, verification badges or real credentials are created.</p></form>`;
  }
  function pageNotFound() {
    return '<div class="pro-empty pro-card"><h3>Page not found</h3><p>This workspace page does not exist.</p><button class="pro-primary" data-pro-go="dashboard">Back to overview</button></div>';
  }
  function noAccess() {
    return '<div class="pro-empty pro-card"><h3>This record is not in this doctor’s workspace</h3><p>Select an assigned patient or consultation.</p><button class="pro-primary" data-pro-go="consultations">Open consultation inbox</button></div>';
  }
  function render(force = false) {
    selected = S().doctors.some((d) => d.id === selected)
      ? selected
      : S().doctors[0].id;
    const parts = location.hash.slice(1).split("/");
    page = parts[1] || "dashboard";
    id = decodeURIComponent(parts[2] || "");
    const sig =
      selected + ":" + page + ":" + id + ":" + (cons(id)?.status || "");
    if (
      !force &&
      signature === sig &&
      page === "chat" &&
      document.querySelector("#pro-chat-messages")
    ) {
      refreshChat();
      return;
    }
    signature = sig;
    const body =
      page === "dashboard"
        ? overview()
        : page === "consultations"
          ? inbox()
          : page === "chat"
            ? chatView(id)
            : page === "patients"
              ? directory()
              : page === "patient"
                ? chart(id)
                : page === "calendar"
                  ? calendar()
                  : page === "documents"
                    ? documentList()
                    : page === "editor"
                      ? editor(id, parts[3] || "")
                      : page === "billing"
                        ? billing()
                        : page === "reports"
                          ? reports()
                          : page === "feedback"
                            ? feedback()
                            : page === "health-feed"
                              ? feed()
                              : page === "communications"
                                ? communications()
                                : page === "inventory"
                                  ? inventory()
                                  : page === "profile"
                                    ? profile()
                                    : pageNotFound();
    document.querySelector("#app").innerHTML = shell(body);
    bind();
    if (page === "chat")
      requestAnimationFrame(() => {
        const e = document.querySelector("#pro-chat-messages");
        if (e) e.scrollTop = e.scrollHeight;
      });
  }
  function chooseConsultation() {
    modal(
      "Create demo medical document",
      `<p>Select a consultation assigned to ${esc(D().name)}.</p><div class="pro-modal-list">${own()
        .map(
          (c) =>
            `<button data-pro-edit="${c.id}">${patientLabel(c.patientId, c.id)}${status(c.status)}${I("chevron")}</button>`,
        )
        .join("")}</div>`,
    );
  }
  function bind() {
    document
      .querySelector("#pro-doctor-select")
      ?.addEventListener("change", (e) => switchDoctor(e.target.value));
    document.querySelector("#pro-day")?.addEventListener("change", (e) => {
      if (e.target.value) {
        day = e.target.value;
        render(true);
      }
    });
    const pi = document.querySelector("#pro-patient-search");
    pi?.addEventListener("input", (e) => {
      patientQuery = e.target.value;
      const start = e.target.selectionStart;
      render(true);
      const n = document.querySelector("#pro-patient-search");
      n.focus();
      n.setSelectionRange(start, start);
    });
    const input = document.querySelector("#pro-message");
    input?.addEventListener("input", () => {
      drafts[id] = input.value;
      document.querySelector(
        '#pro-chat-form button[aria-label="Send doctor message"]',
      ).disabled = !input.value.trim();
    });
    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        sendChat();
      }
    });
    document
      .querySelector("#pro-chat-form")
      ?.addEventListener("submit", (e) => {
        e.preventDefault();
        sendChat();
      });
    const f = document.querySelector("#pro-document-form");
    f?.addEventListener("input", () => {
      editorDraft[f.dataset.consultation] = {
        ...Object.fromEntries(new FormData(f)),
        id: f.dataset.document,
      };
    });
    f?.addEventListener("submit", saveDocument);
    document
      .querySelector("#pro-profile-form")
      ?.addEventListener("submit", (e) => {
        e.preventDefault();
        const f = e.target,
          values = Object.fromEntries(new FormData(f));
        update((s) => {
          const d = s.doctors.find((x) => x.id === D().id);
          Object.assign(d, values, {
            experience: Number(values.experience),
            fee: Number(values.fee),
            available: f.available.checked,
          });
        });
        toast("Fictional profile saved");
      });
  }
  function switchDoctor(value) {
    selected = value;
    sessionStorage.setItem("practo-doctor-id", selected);
    tab = "all";
    signature = "";
    api.closeModal();
    go("dashboard");
    render(true);
  }
  function sendChat() {
    const input = document.querySelector("#pro-message"),
      text = input?.value.trim(),
      cid = id;
    if (!text || !cons(cid) || cons(cid).status !== "active") return;
    if (api.sendDoctor(cid, text)) {
      drafts[cid] = "";
      input.value = "";
      input.focus();
      document.querySelector(
        '#pro-chat-form button[aria-label="Send doctor message"]',
      ).disabled = true;
      refreshChat();
      const el = document.querySelector("#pro-chat-messages");
      el.scrollTop = el.scrollHeight;
    }
  }
  function saveDocument(e) {
    e.preventDefault();
    const f = e.target,
      cid = f.dataset.consultation,
      c = cons(cid);
    if (!c) return;
    const values = Object.fromEntries(new FormData(f));
    if (!Object.values(values).some((v) => String(v).trim())) return;
    const docId =
      f.dataset.document ||
      "DEMO-DOC-" + crypto.randomUUID().slice(0, 8).toUpperCase();
    const existing = documents().find((x) => x.id === docId);
    if (existing?.status === "shared") {
      toast("Shared documents are read-only. Create a new draft.");
      return;
    }
    const doc = {
      ...values,
      id: docId,
      consultationId: cid,
      patientId: c.patientId,
      doctorId: D().id,
      status: "draft",
      updatedAt: Date.now(),
      createdAt: existing?.createdAt || Date.now(),
    };
    if (
      update((s) => {
        const ix = s.documents.findIndex((d) => d.id === docId);
        if (ix >= 0) s.documents[ix] = doc;
        else s.documents.push(doc);
      }, false)
    ) {
      delete editorDraft[cid];
      go("documents");
      openDocument(docId);
      toast("Document draft saved");
    }
  }
  function documentFields(doc) {
    return [
      ["Presenting concern", doc.complaint],
      ["Observations / examination", doc.observations],
      ["Assessment", doc.assessment],
      ["Medicine entries", doc.medicines],
      ["Investigations", doc.tests],
      ["Advice / plan", doc.advice],
      ["Follow-up", doc.followUp],
    ].filter(([, v]) => v?.trim());
  }
  function getDocument(docId) {
    const doc = S().documents.find((d) => d.id === docId);
    if (!doc) return null;
    const pro = location.hash.startsWith("#pro");
    return pro
      ? doc.doctorId === D().id
        ? doc
        : null
      : doc.status === "shared" && doc.patientId === S().profile.id
        ? doc
        : null;
  }
  function openDocument(docId) {
    const doc = getDocument(docId);
    if (!doc) {
      toast("Document unavailable in this session");
      return;
    }
    const dr = S().doctors.find((d) => d.id === doc.doctorId),
      p = patient(doc.patientId),
      pro = location.hash.startsWith("#pro");
    const sheet = sheetPreview(doc);
    modal(
      "Demo medical document",
      `${sheet || ""}<div class="pro-document-preview${sheet ? " pro-sr-only" : ""}"><div class="pro-document-watermark">DEMO — NOT VALID FOR MEDICAL USE</div><h2>${esc(doc.title)}</h2><p>${esc(doc.type)} · ${doc.id}</p><dl><div><dt>Fictional patient</dt><dd>${esc(p.name)} · ${p.age} years</dd></div><div><dt>Fictional doctor</dt><dd>${esc(dr.name)} · ${esc(dr.specialty)}</dd></div><div><dt>Consultation</dt><dd>${doc.consultationId} · ${fmt(doc.createdAt)}</dd></div></dl>${
        documentFields(doc)
          .map(
            ([t, v]) =>
              `<section><h4>${t}</h4><p>${esc(v).replace(/\n/g, "<br>")}</p></section>`,
          )
          .join("") || "<p>No clinical content entered.</p>"
      }<div class="pro-document-watermark">SIMULATED DOCUMENT · NO SIGNATURE · NO CLINICAL VALIDITY</div></div><div class="pro-modal-actions"><button class="outline-btn" data-pro-export="${doc.id}">${I("file")}Download demo PDF</button><button class="outline-btn" data-pro-export-image="${doc.id}">${I("file")}Download image</button>${pro && doc.status === "draft" ? `<button class="outline-btn" data-pro-go="editor/${doc.consultationId}/${doc.id}">Edit draft</button><button class="primary-btn" data-pro-share="${doc.id}">Share in local chat</button>` : `<span class="pro-status shared">Shared locally</span>`}</div>`,
    );
  }
  function shareDocument(docId) {
    const doc = documents().find((d) => d.id === docId);
    if (!doc || doc.status === "shared") return;
    const cid = doc.consultationId;
    if (!cons(cid)) return;
    const messageId = crypto.randomUUID();
    if (
      update((s) => {
        const target = s.documents.find((x) => x.id === docId);
        target.status = "shared";
        target.updatedAt = Date.now();
        target.sharedAt = Date.now();
        target.sharedMessageId = messageId;
        s.messages.push({
          id: messageId,
          consultationId: cid,
          sender: "doctor",
          text:
            "Shared a demo " +
            doc.type.toLowerCase() +
            ": " +
            doc.title +
            ". This document has no clinical validity.",
          timestamp: stamp(),
          status: "sent",
          documentId: docId,
        });
      }, false)
    ) {
      api.closeModal();
      go("chat/" + cid);
      render(true);
      toast("Demo document shared in the patient’s local chat");
    }
  }
  function sheetModel(doc) {
    const dr = S().doctors.find((d) => d.id === doc.doctorId),
      p = patient(doc.patientId);
    return {
      id: doc.id,
      date: fmt(doc.createdAt),
      doctor: {
        name: dr.name,
        line1: dr.specialty,
        line2: `${dr.clinic}, ${dr.area} - ${S().profile.city}`,
        reg: "Demo registration: " + dr.demoCode,
      },
      patient: { name: p.name, meta: `${p.age} years · ${p.gender}` },
      complaint: doc.complaint,
      observations: doc.observations,
      assessment: doc.assessment,
      medicines: doc.medicines,
      tests: doc.tests,
      advice: doc.advice,
      followUp: doc.followUp,
      footer: "DEMO ONLY — NO CLINICAL VALIDITY · " + doc.consultationId,
    };
  }
  function sheetPreview(doc) {
    try {
      const url = renderPrescription(sheetModel(doc), 1.5).toDataURL(
        "image/jpeg",
        0.9,
      );
      return `<div class="rx-preview"><img src="${url}" alt="Demo prescription for ${esc(doc.title)}. Not valid for medical use."></div>`;
    } catch {
      return "";
    }
  }
  function exportPdf(docId) {
    const doc = getDocument(docId);
    if (!doc) return;
    const JsPdf = window.jspdf?.jsPDF;
    if (!JsPdf) {
      toast("PDF module is unavailable. Reload the page.");
      return;
    }
    try {
      prescriptionPdf(JsPdf, renderPrescription(sheetModel(doc))).save(
        doc.id + ".pdf",
      );
    } catch {
      toast("Could not create the PDF. Try Download image instead.");
    }
  }
  async function exportImage(docId) {
    const doc = getDocument(docId);
    if (!doc) return;
    try {
      const ok = await downloadCanvasPng(
        renderPrescription(sheetModel(doc)),
        doc.id + ".png",
      );
      if (!ok) toast("Could not create the image. Try again.");
    } catch {
      toast("Could not create the image. Try again.");
    }
  }
  function modalForm(title, body, submit) {
    modal(
      title,
      `<form id="pro-modal-form" class="pro-form">${body}<button class="pro-primary" type="submit">Save locally</button></form>`,
    );
    document
      .querySelector("#pro-modal-form")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        submit(Object.fromEntries(new FormData(e.target)), e.target);
      });
  }
  function patientOptions(selectedPid = "", onlyOwn = false) {
    return S()
      .patients.filter((p) => !onlyOwn || isOwnPatient(p.id))
      .map(
        (p) =>
          `<option value="${p.id}" ${selectedPid === p.id ? "selected" : ""}>${esc(p.name)} · ${p.age} years</option>`,
      )
      .join("");
  }
  function appointmentModal(aid = "") {
    const a = S().appointments.find(
      (a) => a.id === aid && a.doctorId === D().id,
    );
    modalForm(
      a ? "Manage demo appointment" : "New demo appointment",
      `<p>No external booking or reminder will be sent.</p><label>Patient<select name="patientId">${patientOptions(a?.patientId)}</select></label><div class="pro-form-row"><label>Date<input required type="date" name="date" value="${a?.date || day}"></label><label>Time<input required type="time" name="time" value="${a?.time || "10:00"}"></label></div><label>Visit type<select name="mode">${["Video", "In-clinic"].map((m) => `<option ${m === a?.mode ? "selected" : ""}>${m}</option>`).join("")}</select></label><label>Reason<input name="reason" maxlength="200" required value="${esc(a?.reason || "Demo consultation")}"></label><label>Status<select name="status">${["scheduled", "checked-in", "cancelled"].map((s) => `<option value="${s}" ${s === a?.status ? "selected" : ""}>${s}</option>`).join("")}</select></label>${a?.consultationId ? `<button type="button" class="pro-secondary" data-pro-go="chat/${a.consultationId}">Open consultation</button>` : ""}`,
      (values) => {
        if (a) values.patientId = a.patientId;
        const clash = S().appointments.find(
          (x) =>
            x.doctorId === D().id &&
            x.id !== aid &&
            x.date === values.date &&
            x.time === values.time &&
            x.status !== "cancelled" &&
            values.status !== "cancelled",
        );
        if (clash) {
          toast("That demo time is already occupied. Choose another time.");
          return;
        }
        if (
          update((s) => {
            const cid =
              a?.consultationId ||
              "DEMO-C-" + crypto.randomUUID().slice(0, 8).toUpperCase();
            if (!a) {
              s.consultations.push({
                id: cid,
                doctorId: D().id,
                patientId: values.patientId,
                status: "active",
                date: values.date + "T" + values.time + ":00+05:30",
                reason: values.reason,
                type:
                  values.mode === "Video"
                    ? "Online consultation"
                    : "In-clinic consultation",
              });
            } else {
              const c = s.consultations.find((c) => c.id === cid);
              if (c && c.patientId !== values.patientId) {
                throw new Error(
                  "Patient identity cannot change after a consultation is created.",
                );
              }
              if (c) {
                c.date = values.date + "T" + values.time + ":00+05:30";
                c.reason = values.reason;
                c.type =
                  values.mode === "Video"
                    ? "Online consultation"
                    : "In-clinic consultation";
              }
            }
            const record = {
              ...values,
              id:
                a?.id ||
                "DEMO-APT-" + crypto.randomUUID().slice(0, 6).toUpperCase(),
              doctorId: D().id,
              consultationId: cid,
            };
            const index = s.appointments.findIndex((x) => x.id === aid);
            if (index >= 0) s.appointments[index] = record;
            else s.appointments.push(record);
          }, false)
        ) {
          day = values.date;
          api.closeModal();
          render(true);
          toast("Demo appointment saved");
        }
      },
    );
    if (a)
      document.querySelector(
        '#pro-modal-form select[name="patientId"]',
      ).disabled = true;
  }
  function noteModal(cid) {
    const c = cons(cid);
    if (!c) return;
    const note = S().notes.find(
      (n) => n.doctorId === D().id && n.consultationId === cid,
    );
    modalForm(
      "Private clinical note",
      `<p>This note stays in ${esc(D().name)}’s workspace. It is not sent in chat.</p><label>Note<textarea rows="7" name="text" maxlength="4000" required>${esc(note?.text || "")}</textarea></label>`,
      (v) => {
        update((s) => {
          const note = {
            id: "NOTE-" + cid,
            doctorId: D().id,
            patientId: c.patientId,
            consultationId: cid,
            text: v.text,
            updatedAt: Date.now(),
          };
          const ix = s.notes.findIndex((n) => n.id === note.id);
          if (ix >= 0) s.notes[ix] = note;
          else s.notes.push(note);
        });
        api.closeModal();
        toast("Private note saved");
      },
    );
  }
  function invoiceModal() {
    modalForm(
      "Create demo invoice",
      `<p>Illustrative billing only. No money will be charged.</p><label>Patient<select name="patientId">${[...new Set(own().map((c) => c.patientId))].map((pid) => `<option value="${pid}">${esc(patient(pid).name)}</option>`).join("")}</select></label><label>Description<input name="description" required maxlength="150" value="Demo consultation"></label><label>Amount (₹)<input name="amount" type="number" min="1" max="1000000" step="0.01" required value="${D().fee}"></label>`,
      (v) => {
        update((s) =>
          s.invoices.push({
            ...v,
            id: "DEMO-INV-" + crypto.randomUUID().slice(0, 6).toUpperCase(),
            doctorId: D().id,
            amount: Number(v.amount),
            status: "unpaid",
            createdAt: Date.now(),
          }),
        );
        api.closeModal();
        toast("Demo invoice created");
      },
    );
  }
  function articleModal(aid = "") {
    const a = S().articles.find((a) => a.id === aid && a.doctorId === D().id);
    modalForm(
      "Health-feed draft",
      `<p>Publishing here only makes it visible in this local demo.</p><label>Title<input name="title" maxlength="100" required value="${esc(a?.title || "")}"></label><label>Article<textarea rows="7" name="body" maxlength="5000" required>${esc(a?.body || "")}</textarea></label><label>Status<select name="status"><option value="draft">Draft</option><option value="published" ${a?.status === "published" ? "selected" : ""}>Published in local demo</option></select></label>`,
      (v) => {
        update((s) => {
          const item = {
            ...v,
            id: a?.id || crypto.randomUUID(),
            doctorId: D().id,
            updatedAt: Date.now(),
          };
          const ix = s.articles.findIndex((a) => a.id === aid);
          if (ix >= 0) s.articles[ix] = item;
          else s.articles.push(item);
        });
        api.closeModal();
        toast("Article saved locally");
      },
    );
  }
  function reminderModal() {
    modalForm(
      "Draft a reminder",
      `<p>This saves a draft. No SMS or email is sent.</p><label>Patient<select name="patientId">${patientOptions("", true)}</select></label><label>Channel<select name="channel"><option>SMS draft</option><option>Email draft</option></select></label><label>Message<textarea name="text" rows="5" maxlength="1500" required>Demo appointment reminder: please review your scheduled visit in the app.</textarea></label>`,
      (v) => {
        update((s) =>
          s.reminderDrafts.push({
            ...v,
            id: crypto.randomUUID(),
            doctorId: D().id,
            createdAt: Date.now(),
          }),
        );
        api.closeModal();
        toast("Reminder draft saved — not sent");
      },
    );
  }
  function stockModal(sid = "") {
    const item = S().inventory.find(
      (x) => x.id === sid && x.doctorId === D().id,
    );
    modalForm(
      "Demo stock item",
      `<label>Item name<input name="name" required maxlength="100" value="${esc(item?.name || "")}"></label><label>Category<input name="category" required maxlength="70" value="${esc(item?.category || "Clinic supplies")}"></label><label>Quantity<input type="number" name="quantity" min="0" max="1000000" required value="${item?.quantity || 0}"></label>`,
      (v) => {
        update((s) => {
          const rec = {
            ...v,
            id: item?.id || "STOCK-" + crypto.randomUUID().slice(0, 6),
            doctorId: D().id,
            quantity: Number(v.quantity),
          };
          const ix = s.inventory.findIndex((x) => x.id === sid);
          if (ix >= 0) s.inventory[ix] = rec;
          else s.inventory.push(rec);
        });
        api.closeModal();
        toast("Demo stock updated");
      },
    );
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.proDocument) {
      openDocument(b.dataset.proDocument);
      return;
    }
    if (b.dataset.proExport) {
      exportPdf(b.dataset.proExport);
      return;
    }
    if (b.dataset.proExportImage) {
      exportImage(b.dataset.proExportImage);
      return;
    }
    if (!location.hash.startsWith("#pro")) return;
    if (b.dataset.proGo) {
      api.closeModal();
      go(b.dataset.proGo);
      return;
    }
    if (b.dataset.proFilter) {
      tab = b.dataset.proFilter;
      render(true);
      return;
    }
    if (b.dataset.proEdit) {
      api.closeModal();
      go("editor/" + b.dataset.proEdit);
      return;
    }
    if (b.dataset.proNote) {
      noteModal(b.dataset.proNote);
      return;
    }
    if (b.dataset.proShare) {
      shareDocument(b.dataset.proShare);
      return;
    }
    if (b.dataset.proAppointment) {
      appointmentModal(b.dataset.proAppointment);
      return;
    }
    if (b.dataset.proRetry) {
      const m = S().messages.find((m) => m.id === b.dataset.proRetry);
      if (m && cons(m.consultationId)) api.retry(m.id);
      return;
    }
    if (b.dataset.proPatientApp) {
      const c = cons(b.dataset.proPatientApp);
      if (c) api.viewAsPatient(c.patientId, c.id);
      return;
    }
    if (b.dataset.proComplete) {
      const c = cons(b.dataset.proComplete);
      if (c) {
        update((s) => {
          s.consultations.find((x) => x.id === c.id).status = "completed";
        });
        toast("Demo consultation marked completed");
      }
      return;
    }
    if (b.dataset.proDayShift) {
      day = new Date(
        Date.parse(day + "T12:00:00Z") +
          Number(b.dataset.proDayShift) * 86400000,
      )
        .toISOString()
        .slice(0, 10);
      render(true);
      return;
    }
    if (b.dataset.proPay) {
      const inv = S().invoices.find(
        (i) => i.id === b.dataset.proPay && i.doctorId === D().id,
      );
      if (inv) {
        update((s) => {
          s.invoices.find((i) => i.id === inv.id).status = "paid";
        });
        toast("Demo ledger updated — no payment processed");
      }
      return;
    }
    if (b.dataset.proFeedback) {
      const f = S().feedback.find(
        (f) => f.id === b.dataset.proFeedback && f.doctorId === D().id,
      );
      if (f)
        modalForm(
          "Reply to demo feedback",
          `<label>Reply<textarea name="reply" rows="5" maxlength="2000" required>${esc(f.reply)}</textarea></label>`,
          (v) => {
            update((s) => {
              s.feedback.find((x) => x.id === f.id).reply = v.reply;
            });
            api.closeModal();
            toast("Reply saved locally");
          },
        );
      return;
    }
    if (b.dataset.proArticle) {
      articleModal(b.dataset.proArticle);
      return;
    }
    if (b.dataset.proStock) {
      stockModal(b.dataset.proStock);
      return;
    }
    const a = b.dataset.proAction;
    if (a === "patient-app") {
      api.patientApp();
      return;
    }
    if (a === "new-document") chooseConsultation();
    if (a === "new-appointment") appointmentModal();
    if (a === "new-invoice") invoiceModal();
    if (a === "new-article") articleModal();
    if (a === "new-reminder") reminderModal();
    if (a === "new-stock") stockModal();
    if (a === "availability")
      update((s) => {
        const d = s.doctors.find((d) => d.id === selected);
        d.available = !d.available;
      });
    if (a === "unavailable") toast("Not available in this demo");
    if (a === "scroll-chat") {
      const el = document.querySelector("#pro-chat-messages");
      el.scrollTop = el.scrollHeight;
      b.classList.add("hide");
    }
    if (a === "switch-doctor")
      modal(
        "Choose a demo doctor",
        `<div class="pro-modal-list">${S()
          .doctors.map(
            (d) =>
              `<button data-pro-doctor="${d.id}">${avatar(d)}<span><b>${esc(d.name)}</b><small>${esc(d.specialty)}</small></span>${I("chevron")}</button>`,
          )
          .join("")}</div>`,
      );
    if (b.dataset.proDoctor) switchDoctor(b.dataset.proDoctor);
    if (a === "more")
      modal(
        "Doctor workspace",
        `<div class="pro-modal-list">${nav.map(([p, ico, l]) => `<button data-pro-go="${p}">${I(ico)}${l}${I("chevron")}</button>`).join("")}</div>`,
      );
  });
  return { render, openDocument, selectedDoctor: () => selected };
}
