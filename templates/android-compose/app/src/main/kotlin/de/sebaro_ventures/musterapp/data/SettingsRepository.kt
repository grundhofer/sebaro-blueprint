package de.sebaro_ventures.musterapp.data

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.stringPreferencesKey
import de.sebaro_ventures.design.SebaroTone
import de.sebaro_ventures.design.designsystem.SbThemeMode
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import java.io.IOException

/** The three appearance settings of every sebaro app, as the root theme takes them. */
data class AppSettings(
    val mode: SbThemeMode = SbThemeMode.System,
    val tone: SebaroTone = SebaroTone.Cool,
    val reduceMotion: Boolean = false,
)

/**
 * The settings in DataStore. Enums are stored by name; a missing or unknown value and a file that cannot be read
 * give the default. A write throws when the storage fails; a ViewModel runs it inside [trySave].
 */
class SettingsRepository(private val store: DataStore<Preferences>) {
    val settings: Flow<AppSettings> = store.data
        .catch { e -> if (e is IOException) emit(emptyPreferences()) else throw e }
        .map { it.toSettings() }
        .distinctUntilChanged()

    /** Changes the stored settings in one step. */
    suspend fun update(change: (AppSettings) -> AppSettings) {
        store.edit { preferences ->
            val settings = change(preferences.toSettings())
            preferences[MODE] = settings.mode.name
            preferences[TONE] = settings.tone.name
            preferences[REDUCE_MOTION] = settings.reduceMotion
        }
    }

    private fun Preferences.toSettings(): AppSettings {
        val default = AppSettings()
        return AppSettings(
            mode = SbThemeMode.entries.firstOrNull { it.name == this[MODE] } ?: default.mode,
            tone = SebaroTone.entries.firstOrNull { it.name == this[TONE] } ?: default.tone,
            reduceMotion = this[REDUCE_MOTION] ?: default.reduceMotion,
        )
    }

    private companion object {
        val MODE = stringPreferencesKey("mode")
        val TONE = stringPreferencesKey("tone")
        val REDUCE_MOTION = booleanPreferencesKey("reduceMotion")
    }
}
