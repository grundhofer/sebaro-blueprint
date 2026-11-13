package de.sebaro_ventures.musterapp.ui.about

import org.junit.Assert.assertEquals
import org.junit.Test

class AboutViewModelTest {
    @Test
    fun theVersionItWasGivenIsShown() {
        assertEquals(AboutUiState(version = "1.4.0"), AboutViewModel("1.4.0").state.value)
    }
}
