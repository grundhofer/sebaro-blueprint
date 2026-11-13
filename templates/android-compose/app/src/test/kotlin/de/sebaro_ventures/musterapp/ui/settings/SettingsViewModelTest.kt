package de.sebaro_ventures.musterapp.ui.settings

import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import de.sebaro_ventures.design.SebaroTone
import de.sebaro_ventures.design.designsystem.SbThemeMode
import de.sebaro_ventures.musterapp.AppContainer
import de.sebaro_ventures.musterapp.FullDiskStore
import de.sebaro_ventures.musterapp.MainDispatcherRule
import de.sebaro_ventures.musterapp.await
import de.sebaro_ventures.musterapp.data.AppSettings
import de.sebaro_ventures.musterapp.data.SettingsRepository
import de.sebaro_ventures.musterapp.testContainer
import de.sebaro_ventures.musterapp.watch
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import java.io.File

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class SettingsViewModelTest {
    @get:Rule
    val folder = TemporaryFolder()

    @get:Rule
    val main = MainDispatcherRule()

    private lateinit var container: AppContainer

    @Before
    fun open() {
        container = testContainer(folder.root)
    }

    @Test
    fun beforeAnyChoiceTheDefaultsAreShown() = runTest {
        assertEquals(SettingsUiState(), SettingsViewModel(container.settings).state.await())
    }

    @Test
    fun everyChoiceIsStoredAndShown() = runTest {
        val viewModel = SettingsViewModel(container.settings)
        watch(viewModel.state)

        viewModel.onMode(SbThemeMode.Dark)
        viewModel.onTone(SebaroTone.Warm)
        viewModel.onReduceMotion(true)
        val chosen = SettingsUiState(SbThemeMode.Dark, SebaroTone.Warm, reduceMotion = true)
        assertEquals(chosen, viewModel.state.await { it == chosen })
        assertEquals(AppSettings(SbThemeMode.Dark, SebaroTone.Warm, true), container.settings.settings.first())
    }

    @Test
    fun aWriteThatFailsShowsInTheStateAndTheRowsStayAsStored() = runTest {
        val store = PreferenceDataStoreFactory.create { File(folder.root, "full.preferences_pb") }
        val viewModel = SettingsViewModel(SettingsRepository(FullDiskStore(store)))
        watch(viewModel.state)

        viewModel.onMode(SbThemeMode.Dark)
        assertEquals(SettingsUiState(saveFailed = true), viewModel.state.await { it.saveFailed })

        viewModel.onFailureSeen()
        assertEquals(SettingsUiState(), viewModel.state.await { !it.saveFailed })
    }
}
