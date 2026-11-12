package com.example.practodemo

import kotlinx.serialization.Serializable

@Serializable
data class Patient(
    val id: String,
    val name: String,
    val age: Int,
    val gender: String,
    val city: String,
    val allergies: String = "Not recorded in demo",
    val history: String = "Fictional chart for interface testing.",
)

@Serializable
data class Doctor(
    val id: String,
    val name: String,
    val specialty: String,
    val qualification: String,
    val experience: Int,
    val fee: Int,
    val rating: Int,
    val stories: Int,
    val color: String,
    val initials: String,
    val clinic: String,
    val area: String,
    val gender: String,
    val bio: String = "Fictional doctor profile",
    val languages: List<String> = listOf("English", "Hindi"),
    val available: Boolean = true,
    val workHours: String = "09:00–18:00",
    val demoCode: String = "DEMO-DOCTOR",
)

@Serializable
data class Consultation(
    val id: String,
    val doctorId: String,
    val patientId: String,
    val status: String,
    val date: String,
    val reason: String,
    val type: String,
)

@Serializable
data class Message(
    val id: String,
    val consultationId: String,
    val sender: String,
    val text: String,
    val timestamp: Long,
    val status: String,
    val replyTo: String? = null,
    val documentId: String? = null,
)

@Serializable
data class SeedData(
    val version: Int,
    val patient: Patient,
    val doctors: List<Doctor>,
    val consultations: List<Consultation>,
    val messages: List<Message>,
    val specialties: List<List<String>>,
    val demoReplies: List<String>,
    val patients: List<Patient> = emptyList(),
    val appointments: List<DemoAppointment> = emptyList(),
    val feedback: List<DemoFeedback> = emptyList(),
)

@Serializable
data class SavedData(
    val version: Int = 1,
    val patient: Patient,
    val consultations: List<Consultation>,
    val messages: List<Message>,
    val seen: Map<String, Long> = emptyMap(),
    val doctorRevision: Int = 0,
    val doctors: List<Doctor> = emptyList(),
    val patients: List<Patient> = emptyList(),
    val appointments: List<DemoAppointment> = emptyList(),
    val documents: List<MedicalDocument> = emptyList(),
    val notes: List<ClinicalNote> = emptyList(),
    val feedback: List<DemoFeedback> = emptyList(),
    val practiceItems: List<PracticeItem> = emptyList(),
)

data class UiState(
    val loading: Boolean = true,
    val error: String? = null,
    val seed: SeedData? = null,
    val data: SavedData? = null,
)

fun unreadMessages(data: SavedData, id: String, role: String): Int =
    data.messages.count {
        it.consultationId == id &&
            it.sender != role &&
            it.status == "sent" &&
            it.timestamp > (data.seen["$id:$role"] ?: 0)
    }

fun orderedMessages(data: SavedData, id: String) =
    data.messages
        .filter { it.consultationId == id }
        .sortedWith(compareBy<Message> { it.timestamp }.thenBy { it.id })

@Serializable
data class DemoAppointment(
    val id: String,
    val doctorId: String,
    val patientId: String,
    val consultationId: String,
    val date: String,
    val time: String,
    val mode: String,
    val status: String,
    val reason: String,
)

@Serializable
data class DemoFeedback(
    val id: String,
    val doctorId: String,
    val patientId: String,
    val rating: Int,
    val text: String,
    val reply: String = "",
    val date: String,
)

@Serializable
data class ClinicalNote(
    val id: String,
    val doctorId: String,
    val patientId: String,
    val consultationId: String,
    val text: String,
    val updatedAt: Long,
)

@Serializable
data class MedicalDocument(
    val id: String,
    val doctorId: String,
    val patientId: String,
    val consultationId: String,
    val type: String = "Consultation summary",
    val title: String = "Consultation summary",
    val complaint: String = "",
    val observations: String = "",
    val assessment: String = "",
    val medicines: String = "",
    val tests: String = "",
    val advice: String = "",
    val followUp: String = "",
    val status: String = "draft",
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val sharedAt: Long? = null,
)

@Serializable
data class PracticeItem(
    val id: String,
    val doctorId: String,
    val kind: String,
    val patientId: String = "",
    val title: String,
    val body: String = "",
    val amount: Double = 0.0,
    val quantity: Int = 0,
    val status: String = "draft",
    val updatedAt: Long = System.currentTimeMillis(),
)

fun MedicalDocument.fields(): List<Pair<String, String>> =
    listOf(
            "Presenting concern" to complaint,
            "Observations / examination" to observations,
            "Assessment" to assessment,
            "Medicine entries (demo only)" to medicines,
            "Investigations" to tests,
            "Advice / plan" to advice,
            "Follow-up" to followUp,
        )
        .filter { it.second.isNotBlank() }
