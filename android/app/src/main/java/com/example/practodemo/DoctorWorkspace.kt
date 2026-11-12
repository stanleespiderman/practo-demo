@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package com.example.practodemo

import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.time.LocalDate
import java.time.LocalTime
import java.util.UUID
import kotlinx.coroutines.launch

private val ProBlue = Color(0xFF159DC3)
private val ProInk = Color(0xFF35445F)
private val ProMuted = Color(0xFF8493A9)
private val ProBg = Color(0xFFF6F8FB)
private const val DemoMark = "DEMO — NOT VALID FOR MEDICAL USE"

@Composable
private fun ProCard(content: @Composable ColumnScope.() -> Unit) {
    Surface(
        color = Color.White,
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(
            Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            content = content,
        )
    }
}

@Composable
private fun ProTitle(title: String, subtitle: String = "") {
    Column {
        Text(title, fontSize = 22.sp, fontWeight = FontWeight.SemiBold, color = ProInk)
        if (subtitle.isNotBlank())
            Text(
                subtitle,
                fontSize = 11.sp,
                color = ProMuted,
                modifier = Modifier.padding(top = 7.dp),
            )
    }
}

@Composable
private fun ProHint(text: String) {
    Text(text, fontSize = 11.sp, color = ProMuted, lineHeight = 17.sp)
}

@Composable
private fun ProButton(text: String, enabled: Boolean = true, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        enabled = enabled,
        colors = ButtonDefaults.buttonColors(containerColor = ProBlue),
        shape = RoundedCornerShape(7.dp),
    ) {
        Text(text, fontSize = 12.sp)
    }
}

@Composable
private fun ProField(label: String, value: String, lines: Int = 1, onChange: (String) -> Unit) {
    OutlinedTextField(
        value = value,
        onValueChange = { onChange(it.take(if (lines > 1) 4000 else 200)) },
        label = { Text(label, fontSize = 11.sp) },
        modifier = Modifier.fillMaxWidth(),
        minLines = lines,
        singleLine = lines == 1,
        shape = RoundedCornerShape(7.dp),
    )
}

@Composable
private fun ProSelect(
    label: String,
    value: String,
    options: List<Pair<String, String>>,
    enabled: Boolean = true,
    onSelect: (String) -> Unit,
) {
    var expanded by remember { mutableStateOf(false) }
    Box {
        OutlinedButton(
            onClick = { expanded = true },
            enabled = enabled,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(7.dp),
        ) {
            Column(Modifier.weight(1f), horizontalAlignment = Alignment.Start) {
                Text(label, fontSize = 9.sp, color = ProMuted)
                Text(
                    options.find { it.first == value }?.second ?: value,
                    fontSize = 12.sp,
                    color = ProInk,
                )
            }
            Icon(Icons.Default.ExpandMore, null)
        }
        DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            options.forEach { (id, title) ->
                DropdownMenuItem(
                    text = { Text(title, fontSize = 12.sp) },
                    onClick = {
                        expanded = false
                        onSelect(id)
                    },
                )
            }
        }
    }
}

/** Development-only local role switching. This is not an authentication boundary. */
@Composable
fun DoctorWorkspace(
    data: SavedData,
    seed: SeedData,
    vm: AppViewModel,
    exit: () -> Unit,
    patientChat: (String) -> Unit,
) {
    var route by rememberSaveable { mutableStateOf("overview") }
    var history by rememberSaveable { mutableStateOf(arrayListOf<String>()) }
    var showDoctors by rememberSaveable { mutableStateOf(false) }
    var showControls by rememberSaveable { mutableStateOf(false) }
    var noteId by rememberSaveable { mutableStateOf("") }
    var openDocumentId by rememberSaveable { mutableStateOf("") }
    var appointmentId by rememberSaveable { mutableStateOf("") }
    var practiceKind by rememberSaveable { mutableStateOf("") }
    var practiceId by rememberSaveable { mutableStateOf("") }
    var feedbackId by rememberSaveable { mutableStateOf("") }
    var day by rememberSaveable { mutableStateOf("2026-11-04") }
    var search by rememberSaveable { mutableStateOf("") }
    var filter by rememberSaveable { mutableStateOf("all") }
    val doctor = data.doctors.find { it.id == vm.selectedDoctorId } ?: data.doctors.first()
    val own = data.consultations.filter { it.doctorId == doctor.id }
    val docs = data.documents.filter { it.doctorId == doctor.id }
    val appointments = data.appointments.filter { it.doctorId == doctor.id }
    val patients =
        data.patients.filter { p ->
            own.any { it.patientId == p.id } || appointments.any { it.patientId == p.id }
        }
    fun patient(id: String) = data.patients.first { it.id == id }
    val page = route.substringBefore('/')
    val id = route.substringAfter('/', "")
    val selected = own.find { it.id == id }
    val snack = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val notice: (String) -> Unit = {
        scope.launch { snack.showSnackbar(it) }
        Unit
    }
    val go: (String) -> Unit = {
        if (route != it) {
            history = ArrayList(history + route)
            route = it
        }
    }
    val back: () -> Unit = {
        if (history.isNotEmpty()) {
            route = history.last()
            history = ArrayList(history.dropLast(1))
        } else {
            vm.role = "patient"
            exit()
        }
    }
    LaunchedEffect(doctor.id) {
        vm.role = "doctor"
        vm.autoReplies = false
    }
    BackHandler { back() }
    val sections =
        listOf(
            "overview" to "Overview",
            "calendar" to "Calendar",
            "consultations" to "Consults",
            "patients" to "Patients",
            "documents" to "Summary & Rx",
            "billing" to "Billing",
            "reports" to "Reports",
            "feedback" to "Feedback",
            "feed" to "Health feed",
            "communications" to "Reminders",
            "inventory" to "Inventory",
            "profile" to "Profile",
        )
    Scaffold(
        containerColor = ProBg,
        snackbarHost = { SnackbarHost(snack) },
        topBar = {
            Column(Modifier.background(Color.White)) {
                TopAppBar(
                    title = {
                        Column {
                            Text(
                                "practo • PRO",
                                color = Color(0xFF28328C),
                                fontWeight = FontWeight.Bold,
                                fontSize = 22.sp,
                            )
                            Text(doctor.name + " · LOCAL DEMO", fontSize = 9.sp, color = ProMuted)
                        }
                    },
                    navigationIcon = {
                        IconButton(onClick = back) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
                        }
                    },
                    actions = {
                        IconButton(onClick = { showDoctors = true }) {
                            Icon(Icons.Default.SwitchAccount, "Switch doctor")
                        }
                        IconButton(onClick = { showControls = true }) {
                            Icon(Icons.Default.Settings, "Doctor demo controls")
                        }
                    },
                )
                if (page != "chat")
                    Row(
                        Modifier.horizontalScroll(rememberScrollState())
                            .padding(horizontal = 14.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        sections.forEach { (path, title) ->
                            FilterChip(
                                selected = page == path,
                                onClick = { go(path) },
                                label = { Text(title, fontSize = 10.sp) },
                            )
                        }
                    }
            }
        },
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding)) {
            if (vm.state.value.error != null)
                Text(
                    vm.state.value.error!!,
                    Modifier.fillMaxWidth().background(Color(0xFFFFEDED)).padding(12.dp),
                    fontSize = 11.sp,
                )
            if (page == "chat" && selected != null) {
                Row(
                    Modifier.horizontalScroll(rememberScrollState()).padding(horizontal = 12.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    TextButton(onClick = { go("editor/${selected.id}") }) {
                        Text("Summary & Rx", fontSize = 11.sp)
                    }
                    TextButton(onClick = { noteId = selected.id }) {
                        Text("Private note", fontSize = 11.sp)
                    }
                    TextButton(onClick = { go("patient/${selected.patientId}") }) {
                        Text("Patient chart", fontSize = 11.sp)
                    }
                    TextButton(
                        onClick = {
                            vm.selectPatient(selected.patientId) { patientChat(selected.id) }
                        }
                    ) {
                        Text("View as patient", fontSize = 11.sp)
                    }
                    if (selected.status == "active")
                        TextButton(onClick = { vm.completeConsultation(selected.id) }) {
                            Text("Complete demo", fontSize = 11.sp)
                        }
                }
                ChatScreen(
                    selected,
                    doctor,
                    data.copy(patient = patient(selected.patientId)),
                    vm,
                    back,
                    { showControls = true },
                    { notice("Not available in this demo") },
                    documentOpen = { openDocumentId = it },
                )
            } else if (page == "editor") {
                val parts = id.split('/')
                val c = own.find { it.id == parts[0] }
                val existing = docs.find { it.id == parts.getOrNull(1) }
                if (c != null && existing?.status != "shared")
                    MedicalDocumentEditor(c, doctor, patient(c.patientId), existing, vm) {
                        openDocumentId = it
                        go("documents")
                    }
                else Text("This document is unavailable for editing.", Modifier.padding(24.dp))
            } else
                LazyColumn(
                    Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(20.dp),
                    verticalArrangement = Arrangement.spacedBy(17.dp),
                ) {
                    item {
                        when (page) {
                            "overview" -> {
                                Column(verticalArrangement = Arrangement.spacedBy(17.dp)) {
                                    ProTitle(
                                        "Welcome back, ${doctor.name.removePrefix("Dr. ").substringBefore(' ')}.",
                                        "${doctor.specialty} · ${doctor.demoCode}",
                                    )
                                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                        Box(Modifier.weight(1f)) {
                                            ProCard {
                                                Text(
                                                    appointments
                                                        .count {
                                                            it.date == day &&
                                                                it.status != "cancelled"
                                                        }
                                                        .toString(),
                                                    fontSize = 27.sp,
                                                    color = ProInk,
                                                )
                                                ProHint("Appointments today")
                                            }
                                        }
                                        Box(Modifier.weight(1f)) {
                                            ProCard {
                                                Text(
                                                    own.count {
                                                            unreadMessages(data, it.id, "doctor") >
                                                                0
                                                        }
                                                        .toString(),
                                                    fontSize = 27.sp,
                                                    color = ProInk,
                                                )
                                                ProHint("Awaiting your reply")
                                            }
                                        }
                                    }
                                    ProCard {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Column(Modifier.weight(1f)) {
                                                Text(
                                                    "Demo availability",
                                                    fontWeight = FontWeight.SemiBold,
                                                )
                                                ProHint(
                                                    if (doctor.available)
                                                        "Available for demo consultations"
                                                    else "Taking a break"
                                                )
                                            }
                                            Switch(
                                                checked = doctor.available,
                                                onCheckedChange = {
                                                    vm.saveDoctor(doctor.copy(available = it)) {}
                                                },
                                            )
                                        }
                                        ProButton("New demo appointment") { appointmentId = "new" }
                                    }
                                    ProCard {
                                        Text("Your practice", fontWeight = FontWeight.SemiBold)
                                        ProButton("Open consultation inbox") { go("consultations") }
                                        OutlinedButton(onClick = { go("documents") }) {
                                            Text("Create Summary & Rx")
                                        }
                                        OutlinedButton(onClick = { go("patients") }) {
                                            Text("Patient charts")
                                        }
                                    }
                                    ProHint(
                                        "10 fictional doctors. Persistent local records. No real clinical service is connected."
                                    )
                                }
                            }
                            "consultations" -> {
                                Row(
                                    Modifier.horizontalScroll(rememberScrollState()),
                                    horizontalArrangement = Arrangement.spacedBy(7.dp),
                                ) {
                                    listOf("all", "unread", "active", "completed").forEach { t ->
                                        FilterChip(
                                            selected = filter == t,
                                            onClick = { filter = t },
                                            label = {
                                                Text(
                                                    t.replaceFirstChar { it.uppercase() },
                                                    fontSize = 10.sp,
                                                )
                                            },
                                        )
                                    }
                                }
                            }
                            "patients" -> {
                                Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                                    ProTitle(
                                        "Your patients",
                                        "Charts are scoped to the selected doctor.",
                                    )
                                    ProField("Search patients", search) { search = it }
                                }
                            }
                            "patient" -> {
                                val p = patients.find { it.id == id }
                                if (p == null) ProHint("Patient is not assigned to this doctor.")
                                else
                                    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                                        ProTitle(p.name, "${p.age} years · ${p.gender}")
                                        ProCard {
                                            Text(
                                                "Patient information",
                                                fontWeight = FontWeight.SemiBold,
                                            )
                                            ProHint("Allergies: ${p.allergies}")
                                            ProHint("History: ${p.history}")
                                        }
                                        own.filter { it.patientId == id }
                                            .forEach { c ->
                                                ProCard {
                                                    Text(c.reason)
                                                    ProHint("${c.id} · ${c.status}")
                                                    ProButton("Open consultation") {
                                                        go("chat/${c.id}")
                                                    }
                                                }
                                            }
                                        ProTitle("Private notes")
                                        data.notes
                                            .filter {
                                                it.doctorId == doctor.id && it.patientId == id
                                            }
                                            .forEach { n ->
                                                ProCard {
                                                    ProHint(n.consultationId)
                                                    Text(n.text, fontSize = 12.sp)
                                                }
                                            }
                                        ProTitle("Documents")
                                        docs
                                            .filter { it.patientId == id }
                                            .forEach { d ->
                                                OutlinedButton(
                                                    onClick = { openDocumentId = d.id }
                                                ) {
                                                    Text(d.title + " · " + d.status)
                                                }
                                            }
                                    }
                            }
                            "calendar" -> {
                                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                    ProTitle(
                                        "Your calendar",
                                        "Local scheduling only; no bookings are transmitted.",
                                    )
                                    ProField("Date (YYYY-MM-DD)", day) { day = it }
                                    ProButton("New appointment") { appointmentId = "new" }
                                }
                            }
                            "documents" -> {
                                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                    ProTitle(
                                        "Summary & Rx",
                                        "Review a draft before sharing it with a demo patient.",
                                    )
                                    ProHint(DemoMark)
                                    ProSelect(
                                        "Create for consultation",
                                        "",
                                        listOf("" to "Choose a consultation") +
                                            own.map {
                                                it.id to "${patient(it.patientId).name} · ${it.id}"
                                            },
                                    ) {
                                        if (it.isNotBlank()) go("editor/$it")
                                    }
                                }
                            }
                            "profile" ->
                                NativeDoctorProfile(doctor, vm) {
                                    notice("Fictional profile saved")
                                }
                            "reports" -> {
                                Column(verticalArrangement = Arrangement.spacedBy(15.dp)) {
                                    ProTitle(
                                        "Practice reports",
                                        "Calculated from saved local records.",
                                    )
                                    listOf(
                                            "Consultations" to own.size.toString(),
                                            "Completed" to
                                                own.count { it.status == "completed" }.toString(),
                                            "Shared documents" to
                                                docs.count { it.status == "shared" }.toString(),
                                            "Demo collections" to
                                                ("₹" +
                                                    data.practiceItems
                                                        .filter {
                                                            it.doctorId == doctor.id &&
                                                                it.kind == "billing" &&
                                                                it.status == "paid"
                                                        }
                                                        .sumOf { it.amount }),
                                        )
                                        .forEach { (t, n) ->
                                            ProCard {
                                                Text(t, fontSize = 12.sp, color = ProMuted)
                                                Text(n, fontSize = 27.sp, color = ProInk)
                                            }
                                        }
                                }
                            }
                            "feedback" ->
                                ProTitle(
                                    "Patient feedback",
                                    "Replies remain local to this fictional demo.",
                                )
                            "billing",
                            "feed",
                            "communications",
                            "inventory" -> {
                                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                    ProTitle(
                                        sections.first { it.first == page }.second,
                                        when (page) {
                                            "billing" ->
                                                "Illustrative invoices only. No money is collected."
                                            "communications" ->
                                                "SMS / email drafts only. Nothing is sent."
                                            "feed" ->
                                                "Articles are published only within this local demo."
                                            else -> "Fictional clinic stock."
                                        },
                                    )
                                    ProButton(
                                        when (page) {
                                            "billing" -> "Create demo invoice"
                                            "feed" -> "Write article"
                                            "communications" -> "Draft reminder"
                                            else -> "Add stock item"
                                        }
                                    ) {
                                        practiceKind = page
                                        practiceId = ""
                                    }
                                }
                            }
                            else ->
                                ProHint(
                                    "Record unavailable. Select an assigned patient or consultation."
                                )
                        }
                    }
                    if (page == "consultations") {
                        val list =
                            own.filter {
                                filter == "all" ||
                                    it.status == filter ||
                                    (filter == "unread" &&
                                        unreadMessages(data, it.id, "doctor") > 0)
                            }
                        if (list.isEmpty()) item { ProHint("No consultations in this view.") }
                        items(list, key = { it.id }) { c ->
                            ProCard {
                                Text(
                                    patient(c.patientId).name,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.SemiBold,
                                )
                                ProHint("${c.id} · ${c.status}")
                                Text(c.reason, fontSize = 12.sp)
                                ProHint("${unreadMessages(data,c.id,"doctor")} unread messages")
                                ProButton("Open workspace") { go("chat/${c.id}") }
                            }
                        }
                    }
                    if (page == "patients")
                        items(
                            patients.filter { it.name.contains(search, true) },
                            key = { it.id },
                        ) { p ->
                            ProCard {
                                Text(p.name, fontWeight = FontWeight.SemiBold)
                                ProHint("${p.age} years · ${p.gender}")
                                ProButton("Open patient chart") { go("patient/${p.id}") }
                            }
                        }
                    if (page == "calendar") {
                        val list = appointments.filter { it.date == day }.sortedBy { it.time }
                        if (list.isEmpty()) item { ProHint("No appointments on this date.") }
                        items(list, key = { it.id }) { a ->
                            ProCard {
                                Text(
                                    "${a.time} · ${patient(a.patientId).name}",
                                    fontWeight = FontWeight.SemiBold,
                                )
                                ProHint("${a.mode} · ${a.status}")
                                ProHint(a.reason)
                                ProButton("Manage appointment") { appointmentId = a.id }
                                TextButton(onClick = { go("chat/${a.consultationId}") }) {
                                    Text("Open consultation")
                                }
                            }
                        }
                    }
                    if (page == "documents") {
                        if (docs.isEmpty())
                            item {
                                ProHint(
                                    "No documents yet. Choose a consultation above to create one."
                                )
                            }
                        items(docs.sortedByDescending { it.updatedAt }, key = { it.id }) { d ->
                            ProCard {
                                Text(d.title, fontWeight = FontWeight.SemiBold)
                                ProHint("${patient(d.patientId).name} · ${d.status}")
                                ProButton("Review document") { openDocumentId = d.id }
                                if (d.status == "draft")
                                    TextButton(
                                        onClick = { go("editor/${d.consultationId}/${d.id}") }
                                    ) {
                                        Text("Edit draft")
                                    }
                            }
                        }
                    }
                    if (page == "feedback")
                        items(data.feedback.filter { it.doctorId == doctor.id }, key = { it.id }) {
                            f ->
                            ProCard {
                                Text(patient(f.patientId).name, fontWeight = FontWeight.SemiBold)
                                Text("★".repeat(f.rating), color = Color(0xFFCCA545))
                                Text(f.text, fontSize = 12.sp)
                                if (f.reply.isNotBlank()) ProHint("Your reply: ${f.reply}")
                                ProButton("Reply locally") { feedbackId = f.id }
                            }
                        }
                    if (page in listOf("billing", "feed", "communications", "inventory")) {
                        val list =
                            data.practiceItems.filter {
                                it.doctorId == doctor.id && it.kind == page
                            }
                        if (list.isEmpty()) item { ProHint("No saved records yet.") }
                        items(list, key = { it.id }) { item ->
                            ProCard {
                                Text(item.title, fontWeight = FontWeight.SemiBold)
                                ProHint(item.body)
                                if (item.patientId.isNotBlank())
                                    ProHint(patient(item.patientId).name)
                                if (page == "billing")
                                    Text(
                                        "₹${item.amount} · ${if(item.status=="paid")"Demo paid" else "Unpaid"}"
                                    )
                                if (page == "inventory") Text("Quantity: ${item.quantity}")
                                if (page == "feed") ProHint(item.status + " · local only")
                                ProButton("Edit local record") {
                                    practiceKind = page
                                    practiceId = item.id
                                }
                                if (page == "billing" && item.status != "paid")
                                    TextButton(
                                        onClick = {
                                            vm.savePracticeItem(item.copy(status = "paid")) {
                                                notice("Demo ledger updated — no payment processed")
                                            }
                                        }
                                    ) {
                                        Text("Record demo payment")
                                    }
                            }
                        }
                    }
                }
        }
    }
    if (showDoctors)
        AlertDialog(
            onDismissRequest = { showDoctors = false },
            title = { Text("Choose a demo doctor") },
            text = {
                Column(Modifier.verticalScroll(rememberScrollState())) {
                    data.doctors.forEach { d ->
                        TextButton(
                            onClick = {
                                vm.selectedDoctorId = d.id
                                route = "overview"
                                history = arrayListOf()
                                showDoctors = false
                            }
                        ) {
                            Column(Modifier.fillMaxWidth()) {
                                Text(d.name)
                                ProHint(d.specialty)
                            }
                        }
                    }
                }
            },
            confirmButton = { TextButton(onClick = { showDoctors = false }) { Text("Close") } },
        )
    if (showControls)
        AlertDialog(
            onDismissRequest = { showControls = false },
            title = { Text("Local demo controls") },
            text = {
                Column {
                    ProHint(
                        "No Firebase or Supabase session is connected. Test roles on this device."
                    )
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(checked = vm.offline, onCheckedChange = { vm.offline = it })
                        Text("Simulate offline")
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(checked = vm.failNext, onCheckedChange = { vm.failNext = it })
                        Text("Fail next message")
                    }
                    TextButton(
                        onClick = {
                            showControls = false
                            vm.role = "patient"
                            exit()
                        }
                    ) {
                        Text("Open patient app")
                    }
                }
            },
            confirmButton = { TextButton(onClick = { showControls = false }) { Text("Done") } },
        )
    if (noteId.isNotBlank()) {
        var text by
            rememberSaveable(noteId) {
                mutableStateOf(
                    data.notes
                        .find { it.consultationId == noteId && it.doctorId == doctor.id }
                        ?.text ?: ""
                )
            }
        AlertDialog(
            onDismissRequest = { noteId = "" },
            title = { Text("Private clinical note") },
            text = {
                Column {
                    ProHint("Only visible in this doctor's workspace.")
                    ProField("Note", text, 5) { text = it }
                }
            },
            confirmButton = {
                TextButton(
                    enabled = text.isNotBlank(),
                    onClick = {
                        vm.saveNote(noteId, text) {
                            noteId = ""
                            notice("Private note saved")
                        }
                    },
                ) {
                    Text("Save locally")
                }
            },
            dismissButton = { TextButton(onClick = { noteId = "" }) { Text("Cancel") } },
        )
    }
    docs
        .find { it.id == openDocumentId }
        ?.let { doc ->
            MedicalDocumentDialog(
                doc,
                doctor,
                patient(doc.patientId),
                onClose = { openDocumentId = "" },
                onShare =
                    if (doc.status == "draft") {
                        {
                            vm.shareDocument(doc.id) {
                                openDocumentId = ""
                                go("chat/${doc.consultationId}")
                                notice("Shared in local patient chat")
                            }
                        }
                    } else null,
            )
        }
    if (appointmentId.isNotBlank())
        NativeAppointmentForm(
            appointments.find { it.id == appointmentId },
            doctor,
            data,
            day,
            vm,
            onClose = { appointmentId = "" },
            onSaved = {
                appointmentId = ""
                notice("Demo appointment saved")
            },
        )
    if (practiceKind.isNotBlank())
        NativePracticeForm(
            data.practiceItems.find { it.id == practiceId },
            practiceKind,
            doctor,
            patients,
            vm,
            onClose = { practiceKind = "" },
            onSaved = {
                practiceKind = ""
                notice("Saved locally")
            },
        )
    if (feedbackId.isNotBlank()) {
        var reply by
            rememberSaveable(feedbackId) {
                mutableStateOf(data.feedback.find { it.id == feedbackId }?.reply ?: "")
            }
        AlertDialog(
            onDismissRequest = { feedbackId = "" },
            title = { Text("Reply to demo feedback") },
            text = { ProField("Reply", reply, 4) { reply = it } },
            confirmButton = {
                TextButton(
                    enabled = reply.isNotBlank(),
                    onClick = { vm.replyFeedback(feedbackId, reply) { feedbackId = "" } },
                ) {
                    Text("Save locally")
                }
            },
            dismissButton = { TextButton(onClick = { feedbackId = "" }) { Text("Cancel") } },
        )
    }
}

@Composable
private fun MedicalDocumentEditor(
    c: Consultation,
    doctor: Doctor,
    patient: Patient,
    existing: MedicalDocument?,
    vm: AppViewModel,
    saved: (String) -> Unit,
) {
    val key = existing?.id ?: c.id
    var type by rememberSaveable(key) { mutableStateOf(existing?.type ?: "Consultation summary") }
    var title by rememberSaveable(key) { mutableStateOf(existing?.title ?: "Consultation summary") }
    var concern by rememberSaveable(key) { mutableStateOf(existing?.complaint ?: "") }
    var observations by rememberSaveable(key) { mutableStateOf(existing?.observations ?: "") }
    var assessment by rememberSaveable(key) { mutableStateOf(existing?.assessment ?: "") }
    var medicines by rememberSaveable(key) { mutableStateOf(existing?.medicines ?: "") }
    var tests by rememberSaveable(key) { mutableStateOf(existing?.tests ?: "") }
    var advice by rememberSaveable(key) { mutableStateOf(existing?.advice ?: "") }
    var followUp by rememberSaveable(key) { mutableStateOf(existing?.followUp ?: "") }
    var saving by remember { mutableStateOf(false) }
    val docId =
        rememberSaveable(key) {
            existing?.id ?: "DEMO-DOC-" + UUID.randomUUID().toString().take(8).uppercase()
        }
    Column(
        Modifier.fillMaxSize().imePadding().verticalScroll(rememberScrollState()).padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        ProTitle("Create medical document", "${patient.name} · ${c.id}")
        Text(
            DemoMark,
            Modifier.fillMaxWidth().background(Color(0xFFFFF2DD)).padding(12.dp),
            fontSize = 10.sp,
            color = Color(0xFFAF874A),
        )
        ProCard {
            ProSelect(
                "Document type",
                type,
                listOf(
                        "Consultation summary",
                        "Prescription draft",
                        "Lab request",
                        "Medical certificate demo",
                    )
                    .map { it to it },
            ) {
                type = it
            }
            ProField("Document title", title) { title = it }
            ProHint("Fictional doctor: ${doctor.name}\nFictional patient: ${patient.name}")
            ProField("Presenting concern", concern, 2) { concern = it }
            ProField("Observations / examination", observations, 3) { observations = it }
            ProField("Assessment", assessment, 3) { assessment = it }
            ProField("Medicine entries — manual demo only", medicines, 3) { medicines = it }
            ProHint("No automatic treatment suggestions or real prescriptions are generated.")
            ProField("Investigations / tests", tests, 2) { tests = it }
            ProField("Advice / plan", advice, 3) { advice = it }
            ProField("Follow-up date (optional)", followUp) { followUp = it }
            ProButton("Save private draft", enabled = title.isNotBlank() && !saving) {
                saving = true
                vm.saveDocument(
                    MedicalDocument(
                        docId,
                        doctor.id,
                        patient.id,
                        c.id,
                        type,
                        title,
                        concern,
                        observations,
                        assessment,
                        medicines,
                        tests,
                        advice,
                        followUp,
                        createdAt = existing?.createdAt ?: System.currentTimeMillis(),
                    )
                ) {
                    saving = false
                    saved(docId)
                }
            }
            if (vm.state.value.error != null) {
                ProHint(vm.state.value.error!!)
                TextButton(onClick = { saving = false }) { Text("Try saving again") }
            }
            ProHint("Saving does not share. Review the draft, then choose Share in local chat.")
        }
    }
}

@Composable
private fun NativeDoctorProfile(d: Doctor, vm: AppViewModel, saved: () -> Unit) {
    var name by rememberSaveable(d.id) { mutableStateOf(d.name) }
    var specialty by rememberSaveable(d.id) { mutableStateOf(d.specialty) }
    var qualifications by rememberSaveable(d.id) { mutableStateOf(d.qualification) }
    var fee by rememberSaveable(d.id) { mutableStateOf(d.fee.toString()) }
    var clinic by rememberSaveable(d.id) { mutableStateOf(d.clinic) }
    var hours by rememberSaveable(d.id) { mutableStateOf(d.workHours) }
    var bio by rememberSaveable(d.id) { mutableStateOf(d.bio) }
    ProCard {
        ProTitle("My doctor profile", d.demoCode + " · Fictional identity")
        ProField("Name", name) { name = it }
        ProField("Speciality", specialty) { specialty = it }
        ProField("Qualifications", qualifications) { qualifications = it }
        ProField("Demo fee (₹)", fee) { fee = it }
        ProField("Clinic", clinic) { clinic = it }
        ProField("Working hours", hours) { hours = it }
        ProField("Bio", bio, 3) { bio = it }
        ProButton(
            "Save profile",
            enabled =
                name.isNotBlank() &&
                    specialty.isNotBlank() &&
                    (fee.toIntOrNull() ?: -1) in 0..100000,
        ) {
            vm.saveDoctor(
                d.copy(
                    name = name.trim(),
                    specialty = specialty.trim(),
                    qualification = qualifications,
                    fee = fee.toInt(),
                    clinic = clinic,
                    workHours = hours,
                    bio = bio,
                ),
                saved,
            )
        }
    }
}

@Composable
private fun NativeAppointmentForm(
    a: DemoAppointment?,
    doctor: Doctor,
    data: SavedData,
    initialDay: String,
    vm: AppViewModel,
    onClose: () -> Unit,
    onSaved: () -> Unit,
) {
    var pid by rememberSaveable(a?.id) { mutableStateOf(a?.patientId ?: data.patients.first().id) }
    var date by rememberSaveable(a?.id) { mutableStateOf(a?.date ?: initialDay) }
    var time by rememberSaveable(a?.id) { mutableStateOf(a?.time ?: "10:00") }
    var mode by rememberSaveable(a?.id) { mutableStateOf(a?.mode ?: "Video") }
    var status by rememberSaveable(a?.id) { mutableStateOf(a?.status ?: "scheduled") }
    var reason by rememberSaveable(a?.id) { mutableStateOf(a?.reason ?: "Demo consultation") }
    var error by remember { mutableStateOf("") }
    AlertDialog(
        onDismissRequest = onClose,
        title = { Text(if (a == null) "New demo appointment" else "Manage appointment") },
        text = {
            Column(
                Modifier.verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                ProHint("No external booking or confirmation will be sent.")
                ProSelect(
                    "Patient",
                    pid,
                    data.patients.map { it.id to it.name },
                    enabled = a == null,
                ) {
                    pid = it
                }
                ProField("Date (YYYY-MM-DD)", date) { date = it }
                ProField("Time (HH:mm)", time) { time = it }
                ProSelect("Visit", mode, listOf("Video" to "Video", "In-clinic" to "In-clinic")) {
                    mode = it
                }
                ProField("Reason", reason) { reason = it }
                ProSelect(
                    "Status",
                    status,
                    listOf("scheduled", "checked-in", "cancelled").map { it to it },
                ) {
                    status = it
                }
                if (error.isNotEmpty()) Text(error, color = Color(0xFFB76B5F), fontSize = 11.sp)
            }
        },
        confirmButton = {
            TextButton(
                onClick = {
                    val valid =
                        runCatching {
                                LocalDate.parse(date)
                                LocalTime.parse(time)
                                require(time.matches(Regex("\\d{2}:\\d{2}")))
                                true
                            }
                            .getOrDefault(false)
                    val clash =
                        data.appointments.any {
                            it.doctorId == doctor.id &&
                                it.id != a?.id &&
                                it.date == date &&
                                it.time == time &&
                                it.status != "cancelled" &&
                                status != "cancelled"
                        }
                    if (!valid || reason.isBlank()) error = "Enter a valid date, time and reason."
                    else if (clash) error = "This time is occupied. Choose another slot."
                    else
                        vm.saveAppointment(
                            DemoAppointment(
                                a?.id ?: "DEMO-APT-" + UUID.randomUUID().toString().take(6),
                                doctor.id,
                                pid,
                                a?.consultationId
                                    ?: "DEMO-C-" + UUID.randomUUID().toString().take(8),
                                date,
                                time,
                                mode,
                                status,
                                reason,
                            ),
                            onSaved,
                        )
                }
            ) {
                Text("Save locally")
            }
        },
        dismissButton = { TextButton(onClick = onClose) { Text("Cancel") } },
    )
}

@Composable
private fun NativePracticeForm(
    existing: PracticeItem?,
    kind: String,
    doctor: Doctor,
    patients: List<Patient>,
    vm: AppViewModel,
    onClose: () -> Unit,
    onSaved: () -> Unit,
) {
    var title by rememberSaveable {
        mutableStateOf(existing?.title ?: if (kind == "billing") "Demo consultation" else "")
    }
    var body by rememberSaveable { mutableStateOf(existing?.body ?: "") }
    var pid by rememberSaveable {
        mutableStateOf(existing?.patientId ?: patients.firstOrNull()?.id.orEmpty())
    }
    var number by rememberSaveable {
        mutableStateOf(
            if (kind == "inventory") (existing?.quantity ?: 0).toString()
            else (existing?.amount ?: doctor.fee.toDouble()).toString()
        )
    }
    var status by rememberSaveable { mutableStateOf(existing?.status ?: "draft") }
    AlertDialog(
        onDismissRequest = onClose,
        title = {
            Text(
                when (kind) {
                    "billing" -> "Demo invoice"
                    "feed" -> "Article draft"
                    "communications" -> "Reminder draft"
                    else -> "Demo stock item"
                }
            )
        },
        text = {
            Column(
                Modifier.verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                ProHint("Local demo only. No payments, emails or SMS are processed.")
                ProField(if (kind == "inventory") "Item name" else "Title", title) { title = it }
                ProField(
                    if (kind == "inventory") "Category / notes" else "Description / text",
                    body,
                    3,
                ) {
                    body = it
                }
                if (kind in listOf("billing", "communications"))
                    ProSelect("Patient", pid, patients.map { it.id to it.name }) { pid = it }
                if (kind in listOf("billing", "inventory"))
                    ProField(if (kind == "billing") "Demo amount (₹)" else "Quantity", number) {
                        number = it
                    }
                if (kind == "feed")
                    ProSelect(
                        "Status",
                        status,
                        listOf("draft" to "Draft", "published" to "Published locally"),
                    ) {
                        status = it
                    }
            }
        },
        confirmButton = {
            TextButton(
                enabled =
                    title.isNotBlank() &&
                        (kind !in listOf("billing", "inventory") ||
                            (number.toDoubleOrNull() ?: -1.0) in 0.0..1000000.0) &&
                        (kind != "inventory" || number.toIntOrNull() != null),
                onClick = {
                    vm.savePracticeItem(
                        PracticeItem(
                            existing?.id ?: "DEMO-" + UUID.randomUUID().toString().take(8),
                            doctor.id,
                            kind,
                            if (kind in listOf("billing", "communications")) pid else "",
                            title,
                            body,
                            if (kind == "billing") number.toDouble() else 0.0,
                            if (kind == "inventory") number.toInt() else 0,
                            if (kind == "billing") existing?.status ?: "unpaid" else status,
                        ),
                        onSaved,
                    )
                },
            ) {
                Text("Save locally")
            }
        },
        dismissButton = { TextButton(onClick = onClose) { Text("Cancel") } },
    )
}

@Composable
fun MedicalDocumentDialog(
    doc: MedicalDocument,
    doctor: Doctor,
    patient: Patient,
    onClose: () -> Unit,
    onShare: (() -> Unit)? = null,
) {
    val context = LocalContext.current
    var exportResult by remember { mutableStateOf("") }
    val exporter =
        rememberLauncherForActivityResult(
            ActivityResultContracts.CreateDocument("application/pdf")
        ) { uri ->
            if (uri != null)
                try {
                    context.contentResolver.openOutputStream(uri)?.use {
                        writeDemoPdf(it, doc, doctor, patient)
                    } ?: error("No destination")
                    exportResult = "Demo PDF saved"
                } catch (e: Exception) {
                    exportResult = "Could not save PDF. Please try again."
                }
        }
    AlertDialog(
        onDismissRequest = onClose,
        title = { Text(doc.title) },
        text = {
            Column(
                Modifier.verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(13.dp),
            ) {
                Text(
                    DemoMark,
                    color = Color(0xFFAA7A37),
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp,
                )
                ProHint(
                    "${doc.type} · ${doc.id}\nFictional patient: ${patient.name}\nFictional doctor: ${doctor.name}\n${doc.consultationId}"
                )
                doc.fields().forEach { (title, value) ->
                    Text(title, fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
                    Text(value, fontSize = 12.sp)
                }
                ProHint("SIMULATED DOCUMENT · NO SIGNATURE · NO CLINICAL VALIDITY")
                OutlinedButton(onClick = { exporter.launch(doc.id + ".pdf") }) {
                    Text("Save demo PDF")
                }
                if (exportResult.isNotBlank()) ProHint(exportResult)
            }
        },
        confirmButton = {
            if (onShare != null) TextButton(onClick = onShare) { Text("Share in local chat") }
            else TextButton(onClick = onClose) { Text("Done") }
        },
        dismissButton = { if (onShare != null) TextButton(onClick = onClose) { Text("Close") } },
    )
}
