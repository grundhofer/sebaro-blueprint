package de.sebaro_ventures.musterapp.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import de.sebaro_ventures.design.SebaroTone
import de.sebaro_ventures.design.designsystem.SbThemeMode
import de.sebaro_ventures.musterapp.data.AppSettings
import de.sebaro_ventures.musterapp.data.SettingsRepository
import de.sebaro_ventures.musterapp.data.trySave
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/**
 * The stored settings. The root reads them for the theme, the settings screen shows and changes them; every choice
 * applies at once.
 */
class SettingsViewModel(private val settings: SettingsRepository) : ViewModel() {
    private val saveFailed = MutableStateFlow(false)

    /** null until DataStore has answered for the first time. */
    val state: StateFlow<SettingsUiState?> = combine(settings.settings, saveFailed) { stored, failed ->
        SettingsUiState(stored.mode, stored.tone, stored.reduceMotion, failed)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)

    fun onMode(mode: SbThemeMode) = change { it.copy(mode = mode) }

    fun onTone(tone: SebaroTone) = change { it.copy(tone = tone) }

    fun onReduceMotion(reduce: Boolean) = change { it.copy(reduceMotion = reduce) }

    fun onFailureSeen() {
        saveFailed.value = false
    }

    private fun change(change: (AppSettings) -> AppSettings) {
        viewModelScope.launch { saveFailed.value = !trySave { settings.update(change) } }
    }
}
