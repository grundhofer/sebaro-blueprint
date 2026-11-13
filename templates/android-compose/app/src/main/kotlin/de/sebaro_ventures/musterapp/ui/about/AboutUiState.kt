package de.sebaro_ventures.musterapp.ui.about

import androidx.compose.runtime.Immutable

@Immutable
data class AboutUiState(
    /** The version name of the installed app, „1.4.0“. */
    val version: String,
)
