package de.sebaro_ventures.musterapp.ui.about

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/** „Über“ shows nothing that changes while the app runs, so its state is fixed from the start. */
class AboutViewModel(version: String) : ViewModel() {
    val state: StateFlow<AboutUiState> = MutableStateFlow(AboutUiState(version)).asStateFlow()
}
