package de.sebaro_ventures.musterapp.data

import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import de.sebaro_ventures.design.SebaroTone
import de.sebaro_ventures.design.designsystem.SbThemeMode
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.cancelAndJoin
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.job
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.File

/** DataStore needs no Android: these tests run on the plain JVM. */
class SettingsRepositoryTest {
    @get:Rule
    val folder = TemporaryFolder()

    private val file by lazy { File(folder.root, "settings.preferences_pb") }

    /** One process: the store lives as long as its scope. */
    private suspend fun <T> process(block: suspend (SettingsRepository) -> T): T {
        val scope = CoroutineScope(Dispatchers.IO + Job())
        try {
            return block(SettingsRepository(PreferenceDataStoreFactory.create(scope = scope) { file }))
        } finally {
            scope.coroutineContext.job.cancelAndJoin()
        }
    }

    @Test
    fun withoutAFileTheDefaultsHold() = runTest {
        assertEquals(AppSettings(), process { it.settings.first() })
    }

    @Test
    fun aChangeSurvivesANewProcess() = runTest {
        val changed = AppSettings(SbThemeMode.Dark, SebaroTone.Warm, reduceMotion = true)
        process { it.update { changed } }
        assertEquals(changed, process { it.settings.first() })
        process { it.update { stored -> stored.copy(reduceMotion = false) } }
        assertEquals(changed.copy(reduceMotion = false), process { it.settings.first() })
    }

    @Test
    fun anUnknownNameGivesTheDefault() = runTest {
        val scope = CoroutineScope(Dispatchers.IO + Job())
        val store = PreferenceDataStoreFactory.create(scope = scope) { file }
        store.edit {
            it[stringPreferencesKey("mode")] = "Purple"
            it[stringPreferencesKey("tone")] = "Warm"
        }
        assertEquals(AppSettings(tone = SebaroTone.Warm), SettingsRepository(store).settings.first())
        scope.coroutineContext.job.cancelAndJoin()
    }
}
