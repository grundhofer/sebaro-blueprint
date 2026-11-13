package de.sebaro_ventures.musterapp.ui.settings

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import de.sebaro_ventures.musterapp.ui.appViewModel

/**
 * The top-level place „Einstellungen“. It shares its ViewModel with the root, which reads the theme from it.
 * [onAbout] leads to „Über“.
 */
@Composable
fun SettingsRoute(onAbout: () -> Unit, navigation: @Composable () -> Unit) {
    val viewModel = appViewModel { c -> SettingsViewModel(c.settings) }
    val state by viewModel.state.collectAsStateWithLifecycle()
    SettingsScreen(
        state = state ?: return,
        onMode = viewModel::onMode,
        onTone = viewModel::onTone,
        onReduceMotion = viewModel::onReduceMotion,
        onFailureSeen = viewModel::onFailureSeen,
        onAbout = onAbout,
        navigation = navigation,
    )
}
