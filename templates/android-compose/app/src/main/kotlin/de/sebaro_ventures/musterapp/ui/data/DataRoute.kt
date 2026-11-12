package de.sebaro_ventures.musterapp.ui.data

import androidx.compose.runtime.Composable

/**
 * The top-level place „Daten“. It has no ViewModel, because it reads nothing: the screen is a catalogue of the
 * kinds of data and shows invented values, marked „Beispieldaten“. A screen that reads something gets its state
 * from a ViewModel, as the list does.
 */
@Composable
fun DataRoute(navigation: @Composable () -> Unit) {
    DataScreen(state = DataSamples.normal, navigation = navigation)
}
