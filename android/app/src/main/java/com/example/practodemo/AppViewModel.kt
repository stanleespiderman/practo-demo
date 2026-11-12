package com.example.practodemo

import android.app.Application
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import java.util.UUID
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class AppViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = DemoRepository(application)
    val state = repository.state
    var role by mutableStateOf("patient")
    var offline by mutableStateOf(false)
    var failNext by mutableStateOf(false)
    var autoReplies by mutableStateOf(false)
    var selectedDoctorId by mutableStateOf("doc-ananya")
    private val pending = mutableSetOf<String>()
    private var lastSubmission = ""
    private var lastSubmissionAt = 0L

    init {
        reload()
    }

    fun reload(reset: Boolean = false) {
        viewModelScope.launch { repository.load(reset) }
    }

    fun setProfile(name: String) {
        if (name.isNotBlank())
            viewModelScope.launch {
                repository.update {
                    it.copy(
                        patient = it.patient.copy(name = name.trim().take(45)),
                        patients =
                            it.patients.map { p ->
                                if (p.id == it.patient.id) p.copy(name = name.trim().take(45))
                                else p
                            },
                    )
                }
            }
    }

    fun setCity(city: String) {
        viewModelScope.launch {
            repository.update {
                it.copy(
                    patient = it.patient.copy(city = city),
                    patients =
                        it.patients.map { p ->
                            if (p.id == it.patient.id) p.copy(city = city) else p
                        },
                )
            }
        }
    }

    fun markRead(id: String, selectedRole: String = role) {
        viewModelScope.launch {
            repository.update { data ->
                val latest =
                    data.messages
                        .filter {
                            it.consultationId == id &&
                                it.sender != selectedRole &&
                                it.status == "sent"
                        }
                        .maxOfOrNull { it.timestamp } ?: 0
                data.copy(seen = data.seen + ("$id:$selectedRole" to latest))
            }
        }
    }

    fun send(id: String, text: String, onSaved: () -> Unit) {
        val trimmed = text.trim().take(2000)
        val data = state.value.data ?: return
        if (
            trimmed.isEmpty() ||
                data.consultations.none {
                    it.id == id &&
                        it.status == "active" &&
                        (if (role == "doctor") it.doctorId == selectedDoctorId
                        else it.patientId == data.patient.id)
                }
        )
            return
        val duplicateKey = "$id:$role:$trimmed"
        if (duplicateKey == lastSubmission && System.currentTimeMillis() - lastSubmissionAt < 1500)
            return
        lastSubmission = duplicateKey
        lastSubmissionAt = System.currentTimeMillis()
        val sender = role
        val failure = offline || failNext
        failNext = false
        viewModelScope.launch {
            val messageId = UUID.randomUUID().toString()
            val saved =
                repository.update { existing ->
                    val stamp =
                        maxOf(
                            System.currentTimeMillis(),
                            (existing.messages.maxOfOrNull { it.timestamp } ?: 0) + 1,
                        )
                    existing.copy(
                        messages =
                            existing.messages +
                                Message(messageId, id, sender, trimmed, stamp, "sending")
                    )
                }
            if (saved) {
                onSaved()
                deliver(messageId, failure)
            }
        }
    }

    fun retry(id: String) {
        val snapshot = state.value.data ?: return
        val message =
            snapshot.messages.find { it.id == id && it.sender == role && it.status == "failed" }
                ?: return
        if (
            snapshot.consultations.none {
                it.id == message.consultationId &&
                    (if (role == "doctor") it.doctorId == selectedDoctorId
                    else it.patientId == snapshot.patient.id)
            }
        )
            return
        if (id in pending) return
        val failure = offline || failNext
        failNext = false
        viewModelScope.launch {
            val saved =
                repository.update { data ->
                    data.copy(
                        messages =
                            data.messages.map {
                                if (it.id == id && it.status == "failed")
                                    it.copy(status = "sending")
                                else it
                            }
                    )
                }
            if (saved) deliver(id, failure)
        }
    }

    private suspend fun deliver(id: String, failure: Boolean) {
        if (!pending.add(id)) return
        try {
            delay(650)
            val saved =
                repository.update { data ->
                    data.copy(
                        messages =
                            data.messages.map {
                                if (it.id == id) it.copy(status = if (failure) "failed" else "sent")
                                else it
                            }
                    )
                }
            val message = state.value.data?.messages?.find { it.id == id } ?: return
            if (saved && !failure && autoReplies && message.sender == "patient") {
                delay(1500)
                val seed = state.value.seed ?: return
                repository.update { data ->
                    if (
                        data.messages.none { it.id == id } || data.messages.any { it.replyTo == id }
                    )
                        data
                    else {
                        val count = data.messages.count { it.replyTo != null }
                        val stamp =
                            maxOf(
                                System.currentTimeMillis(),
                                (data.messages.maxOfOrNull { it.timestamp } ?: 0) + 1,
                            )
                        data.copy(
                            messages =
                                data.messages +
                                    Message(
                                        UUID.randomUUID().toString(),
                                        message.consultationId,
                                        "doctor",
                                        seed.demoReplies[count % seed.demoReplies.size],
                                        stamp,
                                        "sent",
                                        id,
                                    )
                        )
                    }
                }
            }
        } finally {
            pending.remove(id)
        }
    }

    fun changePractice(transform: (SavedData) -> SavedData, onSaved: () -> Unit = {}) {
        viewModelScope.launch { if (repository.update(transform)) onSaved() }
    }

    fun selectPatient(id: String, done: () -> Unit) {
        changePractice({ data -> data.copy(patient = data.patients.first { it.id == id }) }) {
            role = "patient"
            autoReplies = false
            done()
        }
    }

    fun saveDoctor(doctor: Doctor, done: () -> Unit) {
        if (doctor.id != selectedDoctorId) return
        changePractice(
            { data ->
                data.copy(doctors = data.doctors.map { if (it.id == doctor.id) doctor else it })
            },
            done,
        )
    }

    fun saveNote(cid: String, text: String, done: () -> Unit) {
        val dr = selectedDoctorId
        changePractice(
            { data ->
                val c = data.consultations.first { it.id == cid && it.doctorId == dr }
                val note =
                    ClinicalNote(
                        "NOTE-$cid",
                        dr,
                        c.patientId,
                        cid,
                        text.take(4000),
                        System.currentTimeMillis(),
                    )
                data.copy(notes = data.notes.filterNot { it.id == note.id } + note)
            },
            done,
        )
    }

    fun saveDocument(doc: MedicalDocument, done: () -> Unit) {
        val dr = selectedDoctorId
        changePractice(
            { data ->
                require(
                    doc.doctorId == dr &&
                        data.consultations.any {
                            it.id == doc.consultationId &&
                                it.doctorId == dr &&
                                it.patientId == doc.patientId
                        }
                )
                require(data.documents.none { it.id == doc.id && it.status == "shared" })
                data.copy(
                    documents =
                        data.documents.filterNot { it.id == doc.id } +
                            doc.copy(status = "draft", updatedAt = System.currentTimeMillis())
                )
            },
            done,
        )
    }

    fun shareDocument(id: String, done: () -> Unit) {
        val dr = selectedDoctorId
        changePractice(
            { data ->
                val doc = data.documents.first { it.id == id && it.doctorId == dr }
                if (doc.status == "shared") data
                else {
                    val stamp =
                        maxOf(
                            System.currentTimeMillis(),
                            (data.messages.maxOfOrNull { it.timestamp } ?: 0) + 1,
                        )
                    data.copy(
                        documents =
                            data.documents.map {
                                if (it.id == id)
                                    it.copy(status = "shared", sharedAt = stamp, updatedAt = stamp)
                                else it
                            },
                        messages =
                            data.messages +
                                Message(
                                    "DOC-$id",
                                    doc.consultationId,
                                    "doctor",
                                    "Shared demo document: ${doc.title}. No clinical validity.",
                                    stamp,
                                    "sent",
                                    documentId = id,
                                ),
                    )
                }
            },
            done,
        )
    }

    fun completeConsultation(id: String) {
        val dr = selectedDoctorId
        changePractice({ data ->
            data.copy(
                consultations =
                    data.consultations.map {
                        if (it.id == id && it.doctorId == dr) it.copy(status = "completed") else it
                    }
            )
        })
    }

    fun saveAppointment(a: DemoAppointment, done: () -> Unit) {
        val dr = selectedDoctorId
        changePractice(
            { data ->
                require(a.doctorId == dr)
                require(
                    data.appointments.none {
                        it.doctorId == dr &&
                            it.id != a.id &&
                            it.date == a.date &&
                            it.time == a.time &&
                            it.status != "cancelled" &&
                            a.status != "cancelled"
                    }
                )
                val existing = data.appointments.find { it.id == a.id }
                require(existing == null || existing.patientId == a.patientId)
                val cs =
                    if (data.consultations.any { it.id == a.consultationId })
                        data.consultations.map { c ->
                            if (c.id == a.consultationId)
                                c.copy(
                                    date = a.date + "T" + a.time + ":00+05:30",
                                    reason = a.reason,
                                    type =
                                        if (a.mode == "Video") "Online consultation"
                                        else "In-clinic consultation",
                                )
                            else c
                        }
                    else
                        data.consultations +
                            Consultation(
                                a.consultationId,
                                dr,
                                a.patientId,
                                "active",
                                a.date + "T" + a.time + ":00+05:30",
                                a.reason,
                                if (a.mode == "Video") "Online consultation"
                                else "In-clinic consultation",
                            )
                data.copy(
                    appointments = data.appointments.filterNot { it.id == a.id } + a,
                    consultations = cs,
                )
            },
            done,
        )
    }

    fun savePracticeItem(item: PracticeItem, done: () -> Unit) {
        if (item.doctorId != selectedDoctorId) return
        changePractice(
            { data ->
                data.copy(practiceItems = data.practiceItems.filterNot { it.id == item.id } + item)
            },
            done,
        )
    }

    fun replyFeedback(id: String, reply: String, done: () -> Unit) {
        val dr = selectedDoctorId
        changePractice(
            { data ->
                data.copy(
                    feedback =
                        data.feedback.map {
                            if (it.id == id && it.doctorId == dr) it.copy(reply = reply) else it
                        }
                )
            },
            done,
        )
    }
}
