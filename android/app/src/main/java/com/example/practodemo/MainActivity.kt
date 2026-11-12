@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package com.example.practodemo

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import java.time.Instant
import java.time.OffsetDateTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale
import kotlinx.coroutines.launch

private val Indigo = Color(0xFF28328C)
private val Cyan = Color(0xFF14A5D2)
private val Ink = Color(0xFF252B47)
private val Muted = Color(0xFF7D8297)
private val Background = Color(0xFFF7F8FC)
private val Line = Color(0xFFECECF3)
private val Lavender = Color(0xFFEEEAFA)
private val Green = Color(0xFF188B65)

private fun date(value: String) =
    OffsetDateTime.parse(value)
        .atZoneSameInstant(ZoneId.of("Asia/Kolkata"))
        .format(DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH))

private fun time(value: Long) =
    Instant.ofEpochMilli(value)
        .atZone(ZoneId.of("Asia/Kolkata"))
        .format(DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH))

private fun time(value: String) = time(OffsetDateTime.parse(value).toInstant().toEpochMilli())

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MaterialTheme(
                colorScheme =
                    lightColorScheme(
                        primary = Indigo,
                        secondary = Cyan,
                        background = Background,
                        surface = Color.White,
                        onSurface = Ink,
                    )
            ) {
                PractoDemo()
            }
        }
    }
}

@Composable
fun PractoDemo(vm: AppViewModel = viewModel()) {
    val ui by vm.state.collectAsStateWithLifecycle()
    var route by rememberSaveable { mutableStateOf("home") }
    var history by rememberSaveable { mutableStateOf(arrayListOf<String>()) }
    var showControls by rememberSaveable { mutableStateOf(false) }
    var dialog by rememberSaveable { mutableStateOf("") }
    var editName by rememberSaveable { mutableStateOf(false) }
    var query by rememberSaveable { mutableStateOf("") }
    val snackbar = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val go: (String) -> Unit = { target ->
        if (route != target) {
            history = ArrayList(history + route)
            route = target
        }
    }
    val back: () -> Unit = {
        if (history.isNotEmpty()) {
            route = history.last()
            history = ArrayList(history.dropLast(1))
        } else route = "home"
    }
    val unavailable: () -> Unit = {
        scope.launch { snackbar.showSnackbar("Not available in this demo") }
        Unit
    }
    BackHandler(enabled = route != "home") { back() }
    if (ui.loading) {
        Box(Modifier.fillMaxSize().background(Background), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = Cyan)
        }
        return
    }
    val baseData = ui.data
    val data =
        baseData?.copy(
            consultations = baseData.consultations.filter { it.patientId == baseData.patient.id }
        )
    val seed =
        ui.seed?.let { source ->
            source.copy(doctors = baseData?.doctors?.ifEmpty { source.doctors } ?: source.doctors)
        }
    if (data == null || seed == null) {
        Column(
            Modifier.fillMaxSize().padding(28.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text("We couldn’t load your demo", style = MaterialTheme.typography.titleLarge)
            Text(
                ui.error ?: "Local data unavailable",
                Modifier.padding(vertical = 18.dp),
                color = Muted,
            )
            Button(onClick = { vm.reload() }) { Text("Try again") }
            TextButton(onClick = { dialog = "reset" }) { Text("Restore demo data") }
        }
        if (dialog == "reset")
            AlertDialog(
                onDismissRequest = { dialog = "" },
                title = { Text("Reset local demo?") },
                text = { Text("This removes local messages and restores fictional seed data.") },
                confirmButton = {
                    TextButton(
                        onClick = {
                            vm.reload(true)
                            dialog = ""
                        }
                    ) {
                        Text("Reset")
                    }
                },
                dismissButton = { TextButton(onClick = { dialog = "" }) { Text("Cancel") } },
            )
        return
    }
    if (route == "pro" && baseData != null) {
        DoctorWorkspace(
            baseData,
            seed,
            vm,
            exit = {
                vm.role = "patient"
                go("home")
            },
            patientChat = { id ->
                vm.role = "patient"
                go("chat/$id")
            },
        )
        return
    }
    LaunchedEffect(route) { if (route != "pro") vm.role = "patient" }
    val page = route.substringBefore('/')
    val selectedId = route.substringAfter('/', "")
    val selected = data.consultations.find { it.id == selectedId }
    val totalUnread = data.consultations.sumOf { unreadMessages(data, it.id, vm.role) }
    val titles =
        mapOf(
            "home" to "practo •",
            "consultations" to "My consultations",
            "consultation" to "View consultation",
            "chat" to "Consultation chat",
            "doctors" to "Find doctors",
            "doctor" to "Doctor profile",
            "records" to "Medical records",
            "account" to "My account",
            "medicines" to "Medicines",
            "tests" to "Lab tests",
            "surgeries" to "Surgeries",
            "online" to "Online consultation",
            "specialties" to "Find your speciality",
            "plus" to "Practo Plus",
            "articles" to "Health articles",
            "help" to "Help & support",
            "appointments" to "Appointments",
            "orders" to "Medicine orders",
            "family" to "Family members",
            "payments" to "Payments & HealthCash",
            "insurance" to "My insurance policy",
            "reminders" to "Reminders",
            "abha" to "ABHA",
            "my-doctors" to "My doctors",
            "search" to "Search",
        )
    Scaffold(
        containerColor = Background,
        topBar = {
            if (page != "chat")
                Column(Modifier.background(Color.White)) {
                    TopAppBar(
                        title = {
                            Text(
                                titles[page] ?: "Practo demo",
                                fontSize = if (page == "home") 29.sp else 19.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (page == "home") Indigo else Ink,
                            )
                        },
                        navigationIcon = {
                            if (page != "home")
                                IconButton(onClick = back) {
                                    Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
                                }
                        },
                        actions = {
                            if (page == "home")
                                TextButton(onClick = { dialog = "location" }) {
                                    Icon(Icons.Default.LocationOn, null, Modifier.size(14.dp))
                                    Text(data.patient.city, fontSize = 11.sp)
                                }
                            IconButton(onClick = { showControls = true }) {
                                Icon(
                                    Icons.Default.Settings,
                                    "Demo controls",
                                    tint = Muted,
                                    modifier = Modifier.size(20.dp),
                                )
                            }
                        },
                        colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White),
                    )
                    if (page == "home" || page == "search")
                        OutlinedTextField(
                            value = query,
                            onValueChange = {
                                query = it
                                if (page != "search") go("search")
                            },
                            placeholder = {
                                Text(
                                    "Search doctors, specialities, consultations…",
                                    fontSize = 11.sp,
                                )
                            },
                            leadingIcon = { Icon(Icons.Default.Search, null) },
                            singleLine = true,
                            modifier =
                                Modifier.fillMaxWidth()
                                    .padding(start = 20.dp, end = 20.dp, bottom = 14.dp),
                            shape = RoundedCornerShape(9.dp),
                        )
                    if (vm.offline)
                        Text(
                            "Offline test mode · Messages can be retried",
                            Modifier.fillMaxWidth().background(Color(0xFFFFF3DC)).padding(8.dp),
                            color = Color(0xFFA07839),
                            fontSize = 10.sp,
                            textAlign = TextAlign.Center,
                        )
                }
        },
        bottomBar = {
            if (page != "chat")
                NavigationBar(containerColor = Color.White, tonalElevation = 0.dp) {
                    listOf(
                            Triple("home", "Home", Icons.Default.Home),
                            Triple(
                                "consultations",
                                "Consultations",
                                Icons.Default.ChatBubbleOutline,
                            ),
                            Triple("records", "Records", Icons.Default.Description),
                            Triple("account", "Account", Icons.Default.PersonOutline),
                        )
                        .forEach { (path, label, icon) ->
                            NavigationBarItem(
                                selected = page == path,
                                onClick = { go(path) },
                                icon = {
                                    BadgedBox(
                                        badge = {
                                            if (path == "consultations" && totalUnread > 0)
                                                Badge { Text(totalUnread.toString()) }
                                        }
                                    ) {
                                        Icon(icon, label, Modifier.size(21.dp))
                                    }
                                },
                                label = { Text(label, fontSize = 10.sp) },
                                colors =
                                    NavigationBarItemDefaults.colors(
                                        selectedIconColor = Indigo,
                                        selectedTextColor = Indigo,
                                        indicatorColor = Lavender,
                                    ),
                            )
                        }
                }
        },
        snackbarHost = { SnackbarHost(snackbar) },
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding)) {
            if (ui.error != null)
                Text(
                    ui.error!!,
                    Modifier.fillMaxWidth().background(Color(0xFFFFECE9)).padding(12.dp),
                    fontSize = 11.sp,
                )
            if (page == "chat" && selected != null) {
                ChatScreen(
                    selected,
                    seed.doctors.first { it.id == selected.doctorId },
                    data,
                    vm,
                    back,
                    { showControls = true },
                    unavailable,
                    documentOpen = { dialog = "medical:$it" },
                )
            } else {
                LazyColumn(
                    Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(20.dp),
                    verticalArrangement = Arrangement.spacedBy(18.dp),
                ) {
                    item {
                        when (page) {
                            "home" -> HomeScreen(data, seed, vm.role, go)
                            "consultations" -> ConsultationList(data, seed, vm.role, go)
                            "consultation" ->
                                if (selected != null) ConsultationDetails(selected, data, seed, go)
                                else
                                    EmptyState(
                                        "Consultation unavailable",
                                        "Open one from My consultations.",
                                    )
                            "doctors",
                            "my-doctors" ->
                                DoctorList(seed, data, page == "my-doctors", selectedId, go)
                            "doctor" ->
                                seed.doctors
                                    .find { it.id == selectedId }
                                    ?.let { DoctorProfile(it, unavailable) }
                            "search" -> SearchScreen(query, data, seed, go)
                            "records" -> RecordsScreen(data, seed) { dialog = "medical:$it" }
                            "account" ->
                                AccountScreen(
                                    data,
                                    go,
                                    { editName = true },
                                    { showControls = true },
                                )
                            "specialties",
                            "online" ->
                                Column(verticalArrangement = Arrangement.spacedBy(22.dp)) {
                                    Text(
                                        "Find care for your health concern",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 20.sp,
                                    )
                                    SpecialtyGrid(seed, go)
                                    ActiveCard(data, seed, vm.role, go)
                                    Info(
                                        "New consultations and calls are not connected. Use the existing demo conversation to test chat."
                                    )
                                }
                            "medicines",
                            "tests",
                            "surgeries" -> CatalogScreen(page, unavailable)
                            "plus" -> PlusScreen(unavailable)
                            "articles" -> ArticlesScreen { dialog = "article:$it" }
                            "help" -> HelpScreen { dialog = "faq:$it" }
                            "family" ->
                                SurfaceCard {
                                    DoctorLabel(
                                        data.patient.name,
                                        "Self · ${data.patient.age} years · ${data.patient.gender}",
                                        null,
                                    )
                                    OutlinedButton(
                                        onClick = unavailable,
                                        modifier = Modifier.fillMaxWidth(),
                                    ) {
                                        Text("Add family member")
                                    }
                                }
                            "appointments" ->
                                EmptyState(
                                    "No upcoming appointments",
                                    "Clinic booking is not connected in this demo.",
                                )
                            "orders" ->
                                EmptyState(
                                    "No medicine orders",
                                    "Medicine checkout is not connected in this demo.",
                                )
                            "insurance" ->
                                EmptyState(
                                    "No policy added",
                                    "Insurance integrations are unavailable in this demo.",
                                )
                            "payments" ->
                                EmptyState(
                                    "No transactions",
                                    "Demo consultations have no real charges.",
                                )
                            "reminders" ->
                                EmptyState(
                                    "Your routine starts here",
                                    "Reminder notifications are not available in this demo.",
                                )
                            "abha" ->
                                EmptyState(
                                    "Your health records, connected",
                                    "ABHA creation and verification are unavailable in this demo.",
                                )
                            else ->
                                EmptyState(
                                    "This screen is unavailable",
                                    "Return home to continue exploring.",
                                )
                        }
                    }
                    item {
                        Text(
                            "LOCAL DEMO · Fictional people and records\nIndependent interface study · No affiliation with Practo",
                            Modifier.fillMaxWidth().padding(top = 10.dp),
                            textAlign = TextAlign.Center,
                            fontSize = 9.sp,
                            color = Muted,
                        )
                    }
                }
            }
        }
    }
    if (showControls && BuildConfig.DEBUG)
        DemoControls(
            vm,
            { showControls = false },
            {
                showControls = false
                dialog = "reset"
            },
        )
    if (editName) {
        var name by remember { mutableStateOf(data.patient.name) }
        AlertDialog(
            onDismissRequest = { editName = false },
            title = { Text("Edit fictional patient") },
            text = {
                OutlinedTextField(name, { name = it.take(45) }, label = { Text("Patient name") })
            },
            confirmButton = {
                TextButton(
                    enabled = name.isNotBlank(),
                    onClick = {
                        vm.setProfile(name)
                        editName = false
                    },
                ) {
                    Text("Save")
                }
            },
            dismissButton = { TextButton(onClick = { editName = false }) { Text("Cancel") } },
        )
    }
    if (dialog.startsWith("medical:")) {
        val doc =
            data.documents.find {
                it.id == dialog.removePrefix("medical:") &&
                    it.patientId == data.patient.id &&
                    it.status == "shared"
            }
        if (doc != null)
            MedicalDocumentDialog(
                doc,
                seed.doctors.first { it.id == doc.doctorId },
                data.patient,
                onClose = { dialog = "" },
            )
    }
    if (dialog.isNotEmpty() && !dialog.startsWith("medical:")) {
        val body =
            when {
                dialog == "reset" ->
                    "This will remove local messages and restore the fictional seed records."
                dialog.startsWith("record:") ->
                    "DEMO RECORD — NOT A PRESCRIPTION\n\n${data.patient.name}\n${dialog.substringAfter(':')}\n\nNo diagnosis, medicine, doctor signature or clinical instruction has been issued."
                dialog.startsWith("article:") ->
                    "This is sample editorial content for the interface. Start with a small everyday habit that fits your routine. It is not medical advice."
                dialog.startsWith("faq:") ->
                    listOf(
                            "Open My consultations, select a consultation, then Continue chat.",
                            "No. Every patient and doctor in this app is fictional.",
                            "App-private JSON storage on this device. Clearing app data removes the demo history.",
                            "Bookings, payments and calls are UI placeholders.",
                            "Enable Fail next message, send, then tap Retry. Disable offline mode before retrying.",
                        )
                        .getOrElse(dialog.substringAfter(':').toIntOrNull() ?: 0) {
                            "This is a local demo."
                        }
                else -> "Select your demo location."
            }
        AlertDialog(
            onDismissRequest = { dialog = "" },
            title = {
                Text(
                    if (dialog == "reset") "Reset demo data?"
                    else if (dialog == "location") "Location" else "Demo information"
                )
            },
            text = {
                if (dialog == "location")
                    Column {
                        listOf("Gurugram", "Bengaluru", "New Delhi", "Mumbai", "Pune", "Hyderabad")
                            .forEach { city ->
                                TextButton(
                                    onClick = {
                                        vm.setCity(city)
                                        dialog = ""
                                    }
                                ) {
                                    Text(city)
                                }
                            }
                    }
                else Text(body, fontSize = 13.sp)
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        if (dialog == "reset") {
                            vm.reload(true)
                            route = "home"
                            history.clear()
                        }
                        dialog = ""
                    }
                ) {
                    Text(if (dialog == "reset") "Reset" else "Close")
                }
            },
            dismissButton = {
                if (dialog == "reset") TextButton(onClick = { dialog = "" }) { Text("Cancel") }
            },
        )
    }
}

@Composable
private fun SurfaceCard(
    modifier: Modifier = Modifier,
    color: Color = Color.White,
    content: @Composable ColumnScope.() -> Unit,
) {
    Surface(
        modifier.fillMaxWidth(),
        color = color,
        shape = RoundedCornerShape(12.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Line),
    ) {
        Column(
            Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
            content = content,
        )
    }
}

@Composable
private fun Info(text: String) {
    Text(
        text,
        Modifier.fillMaxWidth()
            .clip(RoundedCornerShape(9.dp))
            .background(Color(0xFFF0F3FB))
            .padding(16.dp),
        color = Muted,
        fontSize = 11.sp,
        lineHeight = 18.sp,
    )
}

@Composable
private fun EmptyState(title: String, subtitle: String) {
    SurfaceCard {
        Icon(
            Icons.Default.Description,
            null,
            Modifier.align(Alignment.CenterHorizontally).size(42.dp),
            tint = Muted,
        )
        Text(
            title,
            Modifier.fillMaxWidth(),
            fontWeight = FontWeight.SemiBold,
            textAlign = TextAlign.Center,
            fontSize = 19.sp,
        )
        Text(
            subtitle,
            Modifier.fillMaxWidth(),
            color = Muted,
            textAlign = TextAlign.Center,
            fontSize = 12.sp,
        )
    }
}

@Composable
private fun Primary(text: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(7.dp),
        colors = ButtonDefaults.buttonColors(containerColor = Cyan),
        contentPadding = PaddingValues(13.dp),
    ) {
        Text(text, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun Heading(text: String, action: (() -> Unit)? = null) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Text(text, Modifier.weight(1f), fontWeight = FontWeight.Bold, fontSize = 17.sp)
        if (action != null) TextButton(onClick = action) { Text("View all", fontSize = 10.sp) }
    }
}

@Composable
private fun Status(status: String) {
    val active = status == "active"
    Text(
        if (active) "• Active" else "Completed",
        Modifier.clip(RoundedCornerShape(5.dp))
            .background(if (active) Color(0xFFEAF7F0) else Color(0xFFF0F1F5))
            .padding(horizontal = 8.dp, vertical = 4.dp),
        color = if (active) Green else Muted,
        fontSize = 10.sp,
    )
}

@Composable
private fun DoctorArt(female: Boolean, modifier: Modifier = Modifier) {
    Canvas(modifier) {
        val sx = size.width / 100
        val sy = size.height / 120
        drawOval(Color(0xFFB3C6DA), Offset(15 * sx, 77 * sy), Size(70 * sx, 70 * sy))
        drawOval(Color.White, Offset(11 * sx, 79 * sy), Size(78 * sx, 70 * sy))
        if (female) drawOval(Color(0xFF3C3543), Offset(25 * sx, 6 * sy), Size(52 * sx, 87 * sy))
        drawRect(Color(0xFFC58D6C), Offset(42 * sx, 61 * sy), Size(18 * sx, 22 * sy))
        drawOval(Color(0xFFD5A383), Offset(29 * sx, 17 * sy), Size(45 * sx, 53 * sy))
        drawArc(
            Color(0xFF3C3543),
            180f,
            180f,
            true,
            Offset(26 * sx, 4 * sy),
            Size(51 * sx, 51 * sy),
        )
        drawCircle(Color(0xFF433E40), 1.2f * sx, Offset(42 * sx, 43 * sy))
        drawCircle(Color(0xFF433E40), 1.2f * sx, Offset(62 * sx, 43 * sy))
        drawArc(
            Color(0xFF965F57),
            0f,
            180f,
            false,
            Offset(46 * sx, 51 * sy),
            Size(12 * sx, 7 * sy),
            style = androidx.compose.ui.graphics.drawscope.Stroke(1.5f * sx),
        )
        drawRect(Color(0xFFB9C9E3), Offset(42 * sx, 82 * sy), Size(18 * sx, 40 * sy))
        drawArc(
            Color(0xFF4A6B84),
            0f,
            180f,
            false,
            Offset(32 * sx, 82 * sy),
            Size(32 * sx, 23 * sy),
            style = androidx.compose.ui.graphics.drawscope.Stroke(2 * sx),
        )
        drawCircle(Color(0xFF4A6B84), 4 * sx, Offset(70 * sx, 108 * sy))
    }
}

@Composable
private fun Avatar(doctor: Doctor?, size: Int = 48) {
    Box(
        Modifier.size(size.dp).clip(CircleShape).background(Lavender),
        contentAlignment = Alignment.Center,
    ) {
        if (doctor != null) DoctorArt(doctor.gender == "female", Modifier.fillMaxSize())
        else Icon(Icons.Default.Person, null, tint = Indigo)
    }
}

@Composable
private fun DoctorLabel(name: String, subtitle: String, doctor: Doctor?) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Avatar(doctor)
        Column {
            Text(name, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
            Text(subtitle, color = Muted, fontSize = 11.sp)
        }
    }
}

@Composable
private fun HomeScreen(data: SavedData, seed: SeedData, role: String, go: (String) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(22.dp)) {
        OutlinedButton(onClick = { go("pro") }, modifier = Modifier.fillMaxWidth()) {
            Text("Doctor workspace · 10 demo profiles", fontSize = 12.sp)
        }

        Column {
            Text(
                "Hello, ${data.patient.name.substringBefore(' ')}",
                color = Muted,
                fontSize = 12.sp,
            )
            Text("Good health starts here.", fontSize = 24.sp, fontWeight = FontWeight.Bold)
        }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            listOf(
                    Triple("Find a doctor\nnear you", "doctors", Lavender),
                    Triple("Instant video\nconsultation", "online", Color(0xFFE4F4F8)),
                )
                .forEachIndexed { i, (title, path, color) ->
                    Box(
                        Modifier.weight(1f)
                            .height(210.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(color)
                            .clickable { go(path) }
                    ) {
                        DoctorArt(i == 0, Modifier.align(Alignment.BottomEnd).size(94.dp, 123.dp))
                        Column(Modifier.padding(16.dp)) {
                            Text(
                                title,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                lineHeight = 23.sp,
                            )
                            Text(
                                if (i == 0) "Expert care in your\nneighbourhood."
                                else "Connect from\nwherever you are.",
                                Modifier.padding(top = 9.dp),
                                color = Muted,
                                fontSize = 10.sp,
                            )
                            Spacer(Modifier.weight(1f))
                            Text(
                                if (i == 0) "Find doctors →" else "Consult now →",
                                color = Indigo,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.SemiBold,
                            )
                        }
                    }
                }
        }
        SurfaceCard {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                listOf(
                        Triple("tests", "Lab tests", Icons.Default.Science),
                        Triple("medicines", "Medicines", Icons.Default.Medication),
                        Triple("surgeries", "Surgeries", Icons.Default.HealthAndSafety),
                        Triple("plus", "Health plans", Icons.Default.Shield),
                    )
                    .forEach { (path, text, icon) ->
                        Column(
                            Modifier.clickable { go(path) },
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(9.dp),
                        ) {
                            Icon(icon, null, tint = Indigo)
                            Text(text, fontSize = 9.sp)
                        }
                    }
            }
        }
        Column {
            Heading("Find care for your health concern") { go("specialties") }
            SpecialtyGrid(seed, go)
        }
        ActiveCard(data, seed, role, go)
        SurfaceCard(color = Indigo) {
            Text("practo PLUS", color = Color(0xFFCFD5F3), fontSize = 12.sp)
            Text(
                "One plan. Care for your whole family.",
                color = Color.White,
                fontSize = 21.sp,
                fontWeight = FontWeight.Bold,
            )
            Text(
                "Explore online consultations and family benefits.",
                color = Color(0xFFCFD5F3),
                fontSize = 11.sp,
            )
            Button(
                onClick = { go("plus") },
                colors =
                    ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = Indigo),
            ) {
                Text("Explore health plans", fontSize = 11.sp)
            }
        }
        Heading("A healthier you, one read at a time") { go("articles") }
        SurfaceCard {
            Text("Make a little space for yourself", fontWeight = FontWeight.SemiBold)
            Text("Ideas for everyday wellbeing", color = Muted, fontSize = 12.sp)
            TextButton(onClick = { go("articles") }) { Text("Explore health articles →") }
        }
    }
}

@Composable
private fun SpecialtyGrid(seed: SeedData, go: (String) -> Unit) {
    val icons =
        listOf(
            Icons.Default.MedicalServices,
            Icons.Default.AutoAwesome,
            Icons.Default.FavoriteBorder,
            Icons.Default.Medication,
            Icons.Default.ChildCare,
            Icons.Default.Hearing,
            Icons.Default.Psychology,
            Icons.Default.AccessibilityNew,
        )
    val colors =
        listOf(
            Lavender,
            Color(0xFFFFEADF),
            Color(0xFFFDE8EF),
            Color(0xFFE0F2FB),
            Color(0xFFFFF3D8),
            Color(0xFFE2F3E8),
        )
    Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
        seed.specialties.chunked(4).forEachIndexed { row, specs ->
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                specs.forEachIndexed { col, spec ->
                    Column(
                        Modifier.weight(1f).clickable { go("doctors/${spec[0]}") },
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        Box(
                            Modifier.size(55.dp)
                                .clip(CircleShape)
                                .background(colors[(row * 4 + col) % colors.size]),
                            contentAlignment = Alignment.Center,
                        ) {
                            Icon(
                                icons[row * 4 + col],
                                null,
                                tint = Indigo.copy(alpha = .55f),
                                modifier = Modifier.size(27.dp),
                            )
                        }
                        Text(
                            spec[0],
                            Modifier.padding(top = 9.dp),
                            fontSize = 9.sp,
                            textAlign = TextAlign.Center,
                            lineHeight = 14.sp,
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ActiveCard(data: SavedData, seed: SeedData, role: String, go: (String) -> Unit) {
    val c = data.consultations.firstOrNull { it.status == "active" } ?: return
    val doctor = seed.doctors.first { it.id == c.doctorId }
    SurfaceCard {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Your consultation", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
            Status(c.status)
        }
        DoctorLabel(doctor.name, doctor.specialty, doctor)
        HorizontalDivider(color = Line)
        Text("${date(c.date)} · ${time(c.date)}", color = Muted, fontSize = 11.sp)
        Text("${unreadMessages(data, c.id, role)} unread messages", fontSize = 11.sp, color = Muted)
        Primary("Continue chat") { go("chat/${c.id}") }
        TextButton(
            onClick = { go("consultation/${c.id}") },
            modifier = Modifier.align(Alignment.CenterHorizontally),
        ) {
            Text("View consultation details", fontSize = 11.sp)
        }
    }
}

@Composable
private fun ConsultationList(data: SavedData, seed: SeedData, role: String, go: (String) -> Unit) {
    var filter by rememberSaveable { mutableStateOf("all") }
    val list = data.consultations.filter { filter == "all" || it.status == filter }
    Column(verticalArrangement = Arrangement.spacedBy(18.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(9.dp)) {
            listOf("all", "active", "completed").forEach { value ->
                FilterChip(
                    selected = filter == value,
                    onClick = { filter = value },
                    label = { Text(value.replaceFirstChar { it.uppercase() }, fontSize = 11.sp) },
                )
            }
        }
        list.forEach { c ->
            val doctor = seed.doctors.first { it.id == c.doctorId }
            SurfaceCard {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.weight(1f)) { DoctorLabel(doctor.name, doctor.specialty, doctor) }
                    Status(c.status)
                }
                HorizontalDivider(color = Line)
                Text(
                    "${date(c.date)} · ${time(c.date)} · ${data.patient.name.substringBefore(' ')}",
                    color = Muted,
                    fontSize = 10.sp,
                )
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedButton(
                        onClick = { go("consultation/${c.id}") },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(7.dp),
                    ) {
                        Text("View consultation", fontSize = 10.sp)
                    }
                    Button(
                        onClick = { go("chat/${c.id}") },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(7.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Cyan),
                    ) {
                        Text(
                            if (c.status == "active")
                                "Continue chat (${unreadMessages(data, c.id, role)})"
                            else "View chat",
                            fontSize = 10.sp,
                        )
                    }
                }
            }
        }
        if (list.isEmpty()) EmptyState("No consultations here", "Try another filter.")
        Info("Local demo only. All people and records are fictional. No real doctor is connected.")
    }
}

@Composable
private fun ConsultationDetails(
    c: Consultation,
    data: SavedData,
    seed: SeedData,
    go: (String) -> Unit,
) {
    val doctor = seed.doctors.first { it.id == c.doctorId }
    Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
        SurfaceCard {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(c.type, color = Muted, fontSize = 11.sp)
                Status(c.status)
            }
            DoctorLabel(doctor.name, doctor.specialty, doctor)
            Text(
                "${doctor.qualification}\n${doctor.experience} years experience",
                color = Muted,
                fontSize = 11.sp,
            )
            HorizontalDivider(color = Line)
            Text("Consultation details", fontWeight = FontWeight.SemiBold)
            listOf(
                    "Patient" to data.patient.name,
                    "Patient details" to "${data.patient.age} years · ${data.patient.gender}",
                    "Date and time" to "${date(c.date)} · ${time(c.date)} IST",
                    "Consultation ID" to c.id,
                    "Health concern" to c.reason,
                )
                .forEach { (label, value) ->
                    Column {
                        Text(label, fontSize = 10.sp, color = Muted)
                        Text(value, fontSize = 12.sp, modifier = Modifier.padding(top = 3.dp))
                    }
                }
            Primary(if (c.status == "active") "Continue consultation" else "View conversation") {
                go("chat/${c.id}")
            }
        }
        SurfaceCard {
            Text("Your consultation journey", fontWeight = FontWeight.SemiBold)
            Text(
                "✓  Consultation created\n\n✓  ${if (c.status == "active") "Conversation is active" else "Consultation completed"}\n\n○  Demo summary · No prescription issued",
                fontSize = 12.sp,
                color = Muted,
            )
        }
    }
}

@Composable
internal fun ChatScreen(
    c: Consultation,
    doctor: Doctor,
    data: SavedData,
    vm: AppViewModel,
    back: () -> Unit,
    controls: () -> Unit,
    unavailable: () -> Unit,
    documentOpen: (String) -> Unit = {},
) {
    val messages =
        orderedMessages(data, c.id).filter { it.sender == vm.role || it.status == "sent" }
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()
    var draft by rememberSaveable(c.id, vm.role) { mutableStateOf("") }
    var newMessages by remember { mutableStateOf(false) }
    var previousCount by remember(c.id) { mutableIntStateOf(0) }
    var sendRequested by remember { mutableStateOf(false) }
    var sending by remember { mutableStateOf(false) }
    val submit = {
        if (!sending && draft.isNotBlank()) {
            sending = true
            vm.send(c.id, draft) {
                draft = ""
                sendRequested = true
                sending = false
            }
            scope.launch {
                kotlinx.coroutines.delay(1800)
                sending = false
            }
        }
    }
    LaunchedEffect(
        c.id,
        vm.role,
        messages.lastOrNull { it.sender != vm.role && it.status == "sent" }?.id,
    ) {
        vm.markRead(c.id)
    }
    LaunchedEffect(c.id, messages.size) {
        val nearBottom =
            previousCount == 0 ||
                (listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0) >=
                    previousCount - 2
        if (messages.isNotEmpty() && (nearBottom || sendRequested)) {
            listState.animateScrollToItem(messages.lastIndex)
            newMessages = false
        } else if (messages.size > previousCount) newMessages = true
        sendRequested = false
        previousCount = messages.size
    }
    Column(Modifier.fillMaxSize().imePadding()) {
        Row(
            Modifier.fillMaxWidth()
                .background(Color.White)
                .padding(horizontal = 8.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            IconButton(onClick = back) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back") }
            Box(Modifier.weight(1f)) {
                DoctorLabel(
                    if (vm.role == "doctor") data.patient.name else doctor.name,
                    if (c.status == "active") "Demo conversation · Active" else "Completed",
                    doctor,
                )
            }
            IconButton(onClick = unavailable, modifier = Modifier.size(32.dp)) {
                Icon(Icons.Default.Videocam, "Video call", tint = Muted)
            }
            IconButton(onClick = controls, modifier = Modifier.size(32.dp)) {
                Icon(
                    Icons.Default.Settings,
                    "Demo controls",
                    tint = Muted,
                    modifier = Modifier.size(20.dp),
                )
            }
        }
        Text(
            "LOCAL DEMO · ${vm.role} role · ${if (vm.autoReplies) "Simulated replies" else "Manual replies"}",
            Modifier.fillMaxWidth().background(Color(0xFFFFFBEC)).padding(9.dp),
            fontSize = 9.sp,
            textAlign = TextAlign.Center,
            color = Color(0xFFA49157),
        )
        Box(Modifier.weight(1f)) {
            LazyColumn(
                state = listState,
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(18.dp),
                verticalArrangement = Arrangement.spacedBy(17.dp),
            ) {
                items(messages, key = { it.id }) { message ->
                    val mine = message.sender == vm.role
                    Column(
                        Modifier.fillMaxWidth(),
                        horizontalAlignment = if (mine) Alignment.End else Alignment.Start,
                    ) {
                        Surface(
                            color = if (mine) Color(0xFFE8EBFB) else Color.White,
                            shape =
                                RoundedCornerShape(
                                    topStart = if (mine) 12.dp else 0.dp,
                                    topEnd = if (mine) 0.dp else 12.dp,
                                    bottomStart = 12.dp,
                                    bottomEnd = 12.dp,
                                ),
                            modifier = Modifier.widthIn(max = 300.dp),
                        ) {
                            Text(
                                message.text,
                                Modifier.padding(13.dp),
                                fontSize = 12.sp,
                                lineHeight = 19.sp,
                                color = if (mine) Indigo else Ink,
                            )
                        }
                        message.documentId?.let { documentId ->
                            TextButton(onClick = { documentOpen(documentId) }) {
                                Text("Open demo medical document", fontSize = 11.sp)
                            }
                        }
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(time(message.timestamp), fontSize = 9.sp, color = Muted)
                            if (mine && message.status == "failed")
                                TextButton(onClick = { vm.retry(message.id) }) {
                                    Text(
                                        "Failed · Retry",
                                        color = Color(0xFFB5685F),
                                        fontSize = 10.sp,
                                    )
                                }
                            else
                                Text(
                                    if (mine)
                                        " · ${if (message.status == "sending") "Sending…" else "Sent locally ✓"}"
                                    else " · Demo message",
                                    fontSize = 9.sp,
                                    color = Muted,
                                )
                        }
                    }
                }
            }
            if (newMessages)
                FilledTonalButton(
                    onClick = {
                        scope.launch {
                            listState.animateScrollToItem(messages.lastIndex)
                            newMessages = false
                        }
                    },
                    modifier = Modifier.align(Alignment.BottomCenter),
                ) {
                    Text("New messages ↓", fontSize = 11.sp)
                }
        }
        if (c.status == "active")
            Row(
                Modifier.fillMaxWidth().background(Color.White).padding(10.dp),
                verticalAlignment = Alignment.Bottom,
            ) {
                IconButton(onClick = unavailable) {
                    Icon(Icons.Default.AttachFile, "Attachment", tint = Muted)
                }
                OutlinedTextField(
                    value = draft,
                    onValueChange = { draft = it.take(2000) },
                    modifier = Modifier.weight(1f),
                    placeholder = {
                        Text(
                            if (vm.role == "doctor") "Reply as test doctor…"
                            else "Type your message…",
                            fontSize = 12.sp,
                        )
                    },
                    maxLines = 4,
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                    keyboardActions = KeyboardActions(onSend = { submit() }),
                    shape = RoundedCornerShape(8.dp),
                )
                IconButton(
                    onClick = { submit() },
                    enabled = draft.isNotBlank() && !sending,
                    modifier =
                        Modifier.padding(start = 6.dp)
                            .size(48.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (draft.isNotBlank()) Cyan else Line),
                ) {
                    Icon(Icons.AutoMirrored.Filled.Send, "Send message", tint = Color.White)
                }
            }
        else Info("This consultation is completed. Message history remains available.")
    }
}

@Composable
private fun DoctorList(
    seed: SeedData,
    data: SavedData,
    myDoctors: Boolean,
    initialFilter: String,
    go: (String) -> Unit,
) {
    var filter by
        rememberSaveable(initialFilter) { mutableStateOf(initialFilter.ifEmpty { "All" }) }
    val aliases =
        mapOf(
            "Skin & Hair" to "Dermatologist",
            "Dental Care" to "Dentist",
            "Bones & Joints" to "Orthopedist",
        )
    val docs =
        seed.doctors.filter {
            (!myDoctors || data.consultations.any { c -> c.doctorId == it.id }) &&
                (filter == "All" || it.specialty == (aliases[filter] ?: filter))
        }
    Column(verticalArrangement = Arrangement.spacedBy(18.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            FilterChip(
                filter == "All",
                { filter = "All" },
                label = { Text("All specialities", fontSize = 11.sp) },
            )
            if (filter != "All")
                FilterChip(true, { filter = "All" }, label = { Text(filter, fontSize = 11.sp) })
        }
        docs.forEach { doctor ->
            SurfaceCard {
                DoctorLabel(doctor.name, doctor.specialty, doctor)
                Text(
                    "${doctor.experience} years of experience\n${doctor.clinic} · ${doctor.area}",
                    fontSize = 11.sp,
                    color = Muted,
                )
                Text(
                    "${doctor.rating}% recommended · ${doctor.stories} demo stories",
                    fontSize = 11.sp,
                    color = Green,
                )
                Text("₹${doctor.fee} · Illustrative consultation fee", fontSize = 12.sp)
                Primary("View profile") { go("doctor/${doctor.id}") }
            }
        }
        if (docs.isEmpty())
            EmptyState(
                "No matching demo doctors",
                "Try All specialities to see the available fictional profiles.",
            )
    }
}

@Composable
private fun DoctorProfile(doctor: Doctor, unavailable: () -> Unit) {
    SurfaceCard {
        DoctorLabel(doctor.name, doctor.specialty, doctor)
        Text(doctor.qualification, fontSize = 12.sp, color = Muted)
        Text("${doctor.experience} years experience", fontSize = 12.sp)
        HorizontalDivider(color = Line)
        Text("About this doctor", fontWeight = FontWeight.SemiBold)
        Text(
            "This fictional profile demonstrates doctor discovery. All qualifications, fees and ratings are illustrative.",
            fontSize = 12.sp,
            color = Muted,
        )
        Text("${doctor.clinic}\n${doctor.area}\n₹${doctor.fee}", fontSize = 12.sp)
        Primary("Book clinic visit", onClick = unavailable)
        OutlinedButton(onClick = unavailable, modifier = Modifier.fillMaxWidth()) {
            Text("Contact clinic")
        }
    }
}

@Composable
private fun SearchScreen(query: String, data: SavedData, seed: SeedData, go: (String) -> Unit) {
    val doctors = seed.doctors.filter { (it.name + it.specialty).contains(query, true) }
    val consultations =
        data.consultations.filter {
            (it.id + it.reason + seed.doctors.first { d -> d.id == it.doctorId }.name).contains(
                query,
                true,
            )
        }
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        if (query.isBlank()) Text("Search the fictional doctors and consultations.", color = Muted)
        else {
            doctors.forEach { doctor ->
                SurfaceCard(Modifier.clickable { go("doctor/${doctor.id}") }) {
                    DoctorLabel(doctor.name, doctor.specialty, doctor)
                }
            }
            consultations.forEach { c ->
                SurfaceCard(Modifier.clickable { go("consultation/${c.id}") }) {
                    Text(
                        seed.doctors.first { it.id == c.doctorId }.name,
                        fontWeight = FontWeight.SemiBold,
                    )
                    Text("${c.id} · ${date(c.date)}", color = Muted, fontSize = 11.sp)
                }
            }
            if (doctors.isEmpty() && consultations.isEmpty())
                EmptyState("No matching results", "Try a doctor’s name or speciality.")
        }
    }
}

@Composable
private fun RecordsScreen(data: SavedData, seed: SeedData, open: (String) -> Unit) {
    val documents =
        data.documents.filter { it.patientId == data.patient.id && it.status == "shared" }
    Column(verticalArrangement = Arrangement.spacedBy(18.dp)) {
        Text("All your records. One place.", fontSize = 21.sp, fontWeight = FontWeight.Bold)
        if (documents.isEmpty())
            Info("No shared documents yet. Create and share one from the doctor workspace.")
        documents.forEach { doc ->
            SurfaceCard(Modifier.clickable { open(doc.id) }) {
                Icon(Icons.Default.Description, null, tint = Indigo)
                Text(doc.title, fontWeight = FontWeight.SemiBold)
                Text(
                    "${seed.doctors.first { it.id==doc.doctorId }.name} · DEMO",
                    fontSize = 11.sp,
                    color = Muted,
                )
            }
        }
        Info("DEMO documents are not valid for medical use.")
    }
}

@Composable
private fun AccountScreen(
    data: SavedData,
    go: (String) -> Unit,
    edit: () -> Unit,
    controls: () -> Unit,
) {
    SurfaceCard {
        DoctorLabel(data.patient.name, "${data.patient.age} years · Fictional patient", null)
        TextButton(onClick = edit) { Text("View and edit profile") }
        listOf(
                "pro" to "Doctor workspace · 10 demo profiles",
                "family" to "Family members",
                "appointments" to "Appointments",
                "tests" to "Test bookings",
                "orders" to "Orders",
                "consultations" to "Consultations",
                "my-doctors" to "My doctors",
                "records" to "Medical records",
                "insurance" to "My insurance policy",
                "reminders" to "Reminders",
                "payments" to "Payments & HealthCash",
                "abha" to "ABHA",
                "plus" to "Practo Plus",
                "articles" to "Read about health",
                "help" to "Help center",
            )
            .forEach { (path, title) ->
                Row(
                    Modifier.fillMaxWidth().clickable { go(path) }.padding(vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(title, Modifier.weight(1f), fontSize = 13.sp)
                    Icon(
                        Icons.Default.ChevronRight,
                        null,
                        tint = Muted,
                        modifier = Modifier.size(16.dp),
                    )
                }
                HorizontalDivider(color = Line)
            }
        if (BuildConfig.DEBUG) TextButton(onClick = controls) { Text("Development demo controls") }
    }
}

@Composable
private fun CatalogScreen(page: String, unavailable: () -> Unit) {
    val items =
        when (page) {
            "medicines" ->
                listOf(
                    "Health essentials",
                    "Vitamins & supplements",
                    "Personal care",
                    "First aid",
                    "Health devices",
                    "Prescription medicines",
                )
            "tests" ->
                listOf("Full body health check", "Blood tests", "Thyroid profile", "Vitamin checks")
            else -> listOf("Orthopaedics", "Ophthalmology", "General surgery", "ENT care")
        }
    Column(verticalArrangement = Arrangement.spacedBy(18.dp)) {
        Text(
            if (page == "medicines") "Your care, delivered."
            else if (page == "tests") "A clearer picture of your health."
            else "Care at every step.",
            fontSize = 23.sp,
            fontWeight = FontWeight.Bold,
        )
        items.forEach { title ->
            SurfaceCard {
                Icon(
                    if (page == "medicines") Icons.Default.Medication
                    else if (page == "tests") Icons.Default.Science
                    else Icons.Default.HealthAndSafety,
                    null,
                    tint = Indigo,
                )
                Text(title, fontWeight = FontWeight.SemiBold)
                Text("Explore this service category", fontSize = 11.sp, color = Muted)
                TextButton(onClick = unavailable) { Text("Explore →") }
            }
        }
        Info(
            "This section is a UI preview. Ordering, payments, clinical care and bookings are not connected."
        )
    }
}

@Composable
private fun PlusScreen(unavailable: () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(18.dp)) {
        SurfaceCard(color = Indigo) {
            Text("practo PLUS", color = Color.White)
            Text(
                "Great care is better together.",
                color = Color.White,
                fontWeight = FontWeight.Bold,
                fontSize = 25.sp,
            )
        }
        listOf("Personal care", "Family care", "Complete care").forEach { title ->
            SurfaceCard {
                Icon(Icons.Default.Shield, null, tint = Indigo)
                Text(title, fontWeight = FontWeight.SemiBold)
                Text(
                    "Explore online consultation benefits, health records and follow-up options.",
                    color = Muted,
                    fontSize = 12.sp,
                )
                Primary("Explore plan", onClick = unavailable)
            }
        }
        Info("Plans and benefits are illustrative. No subscription or payment will be created.")
    }
}

@Composable
private fun ArticlesScreen(open: (Int) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(18.dp)) {
        listOf(
                "Make a little space for yourself",
                "Build a routine that works for you",
                "Preparing for a consultation",
            )
            .forEachIndexed { i, title ->
                SurfaceCard(Modifier.clickable { open(i) }) {
                    Icon(Icons.Default.Spa, null, tint = Green)
                    Text(title, fontWeight = FontWeight.SemiBold, fontSize = 17.sp)
                    Text("Sample editorial · 2 min read", color = Muted, fontSize = 11.sp)
                }
            }
    }
}

@Composable
private fun HelpScreen(open: (Int) -> Unit) {
    SurfaceCard {
        listOf(
                "How do I continue a consultation?",
                "Are these real doctors?",
                "Where are my messages saved?",
                "Can I book or make a payment?",
                "How do I test failed messages?",
            )
            .forEachIndexed { i, text ->
                TextButton(onClick = { open(i) }) { Text(text, fontSize = 13.sp) }
                HorizontalDivider(color = Line)
            }
    }
}

@Composable
private fun DemoControls(vm: AppViewModel, close: () -> Unit, reset: () -> Unit) {
    AlertDialog(
        onDismissRequest = close,
        title = { Text("Development controls") },
        text = {
            Column(
                Modifier.verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Text(
                    "Local demo only. No Firebase or Supabase connection. Role switching tests one device; no real multi-device messaging.",
                    fontSize = 12.sp,
                )
                Row {
                    FilterChip(
                        vm.role == "patient",
                        { vm.role = "patient" },
                        label = { Text("Patient") },
                    )
                    Spacer(Modifier.width(8.dp))
                    FilterChip(
                        vm.role == "doctor",
                        { vm.role = "doctor" },
                        label = { Text("Test doctor") },
                    )
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("Simulated replies", Modifier.weight(1f), fontSize = 12.sp)
                    Switch(vm.autoReplies, { vm.autoReplies = it })
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("Simulate offline", Modifier.weight(1f), fontSize = 12.sp)
                    Switch(vm.offline, { vm.offline = it })
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("Fail next message", Modifier.weight(1f), fontSize = 12.sp)
                    Switch(vm.failNext, { vm.failNext = it })
                }
                TextButton(onClick = reset) {
                    Text("Reset local demo data", color = Color(0xFFB5685F))
                }
            }
        },
        confirmButton = { TextButton(onClick = close) { Text("Done") } },
    )
}
