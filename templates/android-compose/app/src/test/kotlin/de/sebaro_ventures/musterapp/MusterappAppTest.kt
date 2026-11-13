package de.sebaro_ventures.musterapp

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.hasSetTextAction
import androidx.compose.ui.test.hasText
import androidx.compose.ui.test.junit4.v2.createAndroidComposeRule
import androidx.compose.ui.test.onAllNodesWithText
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performTextInput
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

/**
 * The whole app on the JVM, from the activity to Room and DataStore in the test's own folder: the first start,
 * the way through the screens, and what a sub-screen's ViewModel keeps and forgets.
 */
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36], qualifiers = "de-rDE-w360dp-h800dp")
class MusterappAppTest {
    @get:Rule
    val rule = createAndroidComposeRule<MainActivity>()

    private val titleField = hasSetTextAction() and hasText("Titel", substring = true)

    /** Room and DataStore answer from their own threads. */
    private fun awaitText(text: String) {
        rule.waitUntil(5_000) { rule.onAllNodesWithText(text).fetchSemanticsNodes().isNotEmpty() }
    }

    @Test
    fun theFirstStartShowsTheSamplesMarkedAsSuch() {
        awaitText("Balkon bepflanzen")
        rule.onNodeWithText("Fahrrad zur Inspektion bringen").assertIsDisplayed()
        val markers = rule.onAllNodesWithText("Beispieldaten", useUnmergedTree = true).fetchSemanticsNodes()
        assertEquals(5, markers.size)
    }

    @Test
    fun aNewEntryIsStoredAndOpensInItsDetail() {
        awaitText("Eintrag anlegen")
        rule.onNodeWithText("Eintrag anlegen").performClick()
        awaitText("Neuer Eintrag")
        rule.onNode(titleField).performTextInput("Keller aufräumen")
        rule.onNodeWithText("Eintrag anlegen").performClick()

        // the detail of the new entry: its title in the top bar, the way to edit it, no sample marker
        awaitText("Eintrag bearbeiten")
        rule.onNodeWithText("Keller aufräumen").assertIsDisplayed()
        rule.onNodeWithText("Beispieldaten").assertDoesNotExist()

        rule.onNodeWithContentDescription("Zurück").performClick()
        awaitText("Balkon bepflanzen")
        rule.onNodeWithText("Keller aufräumen").assertIsDisplayed()
    }

    @Test
    fun theSettingsLeadToAboutWithTheVersionOfThePackage() {
        awaitText("Einstellungen")
        rule.onNodeWithText("Einstellungen").performClick()
        awaitText("Über Musterapp")
        rule.onNodeWithText("Über Musterapp").performClick()

        val context = rule.activity
        val version = context.packageManager.getPackageInfo(context.packageName, 0).versionName
        awaitText("Version $version")
        rule.onNodeWithText("Eine App von").assertIsDisplayed()

        rule.onNodeWithContentDescription("Zurück").performClick()
        awaitText("Hell oder Dunkel")
    }

    @Test
    fun aDraftSurvivesANewActivityAndIsGoneOnceTheFormWasLeft() {
        awaitText("Eintrag anlegen")
        rule.onNodeWithText("Eintrag anlegen").performClick()
        awaitText("Neuer Eintrag")
        rule.onNode(titleField).performTextInput("Entwurf")

        // a rotation: the back stack and the draft are still there
        rule.activityRule.scenario.recreate()
        awaitText("Neuer Eintrag")
        rule.onNode(titleField and hasText("Entwurf", substring = true)).assertIsDisplayed()

        // closing with changes asks; „Verwerfen“ leaves the form
        rule.onNodeWithContentDescription("Schließen").performClick()
        awaitText("Neuen Eintrag sichern?")
        rule.onNodeWithText("Verwerfen").performClick()
        awaitText("Balkon bepflanzen")

        // the next form starts empty: the sub-screen's ViewModel went with it
        rule.onNodeWithText("Eintrag anlegen").performClick()
        awaitText("Neuer Eintrag")
        rule.onNode(titleField and hasText("Entwurf", substring = true)).assertDoesNotExist()
    }
}
