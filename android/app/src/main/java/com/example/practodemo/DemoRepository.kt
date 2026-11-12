package com.example.practodemo

import android.content.Context
import java.io.File
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

/** App-private atomic JSON storage. No WebView, no external account, no network. */
class DemoRepository(private val context: Context) {
    private val json = Json {
        ignoreUnknownKeys = true
        prettyPrint = true
    }
    private val mutex = Mutex()
    private val file = android.util.AtomicFile(File(context.filesDir, "demo-state.json"))
    private val mutable = MutableStateFlow(UiState())
    val state = mutable.asStateFlow()

    suspend fun load(reset: Boolean = false) =
        mutex.withLock {
            withContext(Dispatchers.IO) {
                mutable.value = UiState()
                try {
                    val seed =
                        json.decodeFromString<SeedData>(
                            context.assets.open("seed-data.json").bufferedReader().use {
                                it.readText()
                            }
                        )
                    val data =
                        if (!reset && file.baseFile.exists())
                            json.decodeFromString<SavedData>(
                                file.openRead().bufferedReader().use { it.readText() }
                            )
                        else
                            SavedData(
                                patient = seed.patient,
                                consultations = seed.consultations,
                                messages = seed.messages,
                            )
                    require(data.version == 1) { "Unsupported saved data version" }
                    val merged =
                        if (data.doctorRevision < 2)
                            data.copy(
                                doctorRevision = 2,
                                consultations =
                                    data.consultations +
                                        seed.consultations.filter { fresh ->
                                            data.consultations.none { it.id == fresh.id }
                                        },
                                messages =
                                    data.messages +
                                        seed.messages.filter { fresh ->
                                            data.messages.none { it.id == fresh.id }
                                        },
                                doctors = seed.doctors,
                                patients =
                                    seed.patients.map {
                                        if (it.id == data.patient.id)
                                            it.copy(
                                                name = data.patient.name,
                                                city = data.patient.city,
                                            )
                                        else it
                                    },
                                appointments = seed.appointments,
                                feedback = seed.feedback,
                            )
                        else data
                    val recovered =
                        merged.copy(
                            messages =
                                merged.messages.map {
                                    if (it.status == "sending") it.copy(status = "failed") else it
                                }
                        )
                    persist(recovered)
                    mutable.value = UiState(loading = false, seed = seed, data = recovered)
                } catch (e: Exception) {
                    mutable.value =
                        UiState(
                            loading = false,
                            error = "Unable to read local demo data. Retry or restore the demo.",
                        )
                }
            }
        }

    suspend fun update(transform: (SavedData) -> SavedData): Boolean =
        mutex.withLock {
            withContext(Dispatchers.IO) {
                val old = mutable.value
                val data = old.data ?: return@withContext false
                try {
                    val next = transform(data)
                    persist(next)
                    mutable.value = old.copy(data = next, error = null)
                    true
                } catch (e: Exception) {
                    mutable.value =
                        old.copy(
                            error = "Storage failed. Your last change was not saved. Try again."
                        )
                    false
                }
            }
        }

    private fun persist(data: SavedData) {
        val output = file.startWrite()
        try {
            output.write(json.encodeToString(data).toByteArray(Charsets.UTF_8))
            file.finishWrite(output)
        } catch (e: Exception) {
            file.failWrite(output)
            throw e
        }
    }
}
