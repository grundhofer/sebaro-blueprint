package de.sebaro_ventures.musterapp.ui

import androidx.compose.runtime.saveable.listSaver
import androidx.compose.runtime.snapshots.SnapshotStateList
import androidx.compose.runtime.toMutableStateList

/** Where the app is. The three top-level places carry the bottom navigation; the others are sub-screens. */
sealed interface Destination {
    data object Entries : Destination

    data object Data : Destination

    data object Settings : Destination

    data class Detail(val id: Long) : Destination

    /** [id] null: a new entry. */
    data class Form(val id: Long?) : Destination

    companion object {
        val topLevel = listOf(Entries, Data, Settings)

        fun encode(destination: Destination): String = when (destination) {
            Entries -> "entries"
            Data -> "data"
            Settings -> "settings"
            is Detail -> "detail:${destination.id}"
            is Form -> "form:${destination.id ?: ""}"
        }

        fun decode(text: String): Destination = when {
            text == "data" -> Data
            text == "settings" -> Settings
            text.startsWith("detail:") -> Detail(text.removePrefix("detail:").toLong())
            text.startsWith("form:") -> Form(text.removePrefix("form:").toLongOrNull())
            else -> Entries
        }
    }
}

/** Keeps the back stack across a rotation and the end of the process. */
val BackStackSaver = listSaver<SnapshotStateList<Destination>, String>(
    save = { stack -> stack.map(Destination::encode) },
    restore = { saved -> saved.map(Destination::decode).toMutableStateList() },
)
