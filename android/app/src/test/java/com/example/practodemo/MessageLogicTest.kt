package com.example.practodemo

import org.junit.Assert.assertEquals
import org.junit.Test

class MessageLogicTest {
    private val patient = Patient("patient-demo", "Aarav Mehta", 27, "Male", "Gurugram")

    @Test
    fun failedAndOwnMessagesDoNotCountAsUnread() {
        val data =
            SavedData(
                patient = patient,
                consultations = emptyList(),
                messages =
                    listOf(
                        Message("1", "a", "doctor", "First", 10L, "sent"),
                        Message("2", "a", "doctor", "Unsent", 20L, "failed"),
                        Message("3", "a", "patient", "Mine", 30L, "sent"),
                        Message("4", "other", "doctor", "Other chat", 40L, "sent"),
                    ),
            )
        assertEquals(1, unreadMessages(data, "a", "patient"))
        assertEquals(0, unreadMessages(data.copy(seen = mapOf("a:patient" to 10L)), "a", "patient"))
        assertEquals(1, unreadMessages(data, "a", "doctor"))
    }

    @Test
    fun historyIsIsolatedAndChronologicalWithStableTies() {
        val data =
            SavedData(
                patient = patient,
                consultations = emptyList(),
                messages =
                    listOf(
                        Message("z", "a", "patient", "Later", 50L, "sent"),
                        Message("b", "a", "doctor", "Tie B", 20L, "sent"),
                        Message("a", "a", "doctor", "Tie A", 20L, "sent"),
                        Message("other", "b", "doctor", "Elsewhere", 1L, "sent"),
                    ),
            )
        assertEquals(listOf("a", "b", "z"), orderedMessages(data, "a").map { it.id })
    }
}
