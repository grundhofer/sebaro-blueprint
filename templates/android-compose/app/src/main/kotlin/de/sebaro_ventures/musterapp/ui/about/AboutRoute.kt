package de.sebaro_ventures.musterapp.ui.about

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import de.sebaro_ventures.musterapp.ui.appViewModel

/** The sub-screen „Über“, reached from the settings. */
@Composable
fun AboutRoute(onBack: () -> Unit) {
    val viewModel = appViewModel { c -> AboutViewModel(c.version) }
    val state by viewModel.state.collectAsStateWithLifecycle()
    AboutScreen(state = state, onBack = onBack)
}
