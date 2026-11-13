package de.sebaro_ventures.musterapp.ui.form

import androidx.lifecycle.SavedStateHandle
import de.sebaro_ventures.musterapp.AppContainer
import de.sebaro_ventures.musterapp.FullDiskDao
import de.sebaro_ventures.musterapp.MainDispatcherRule
import de.sebaro_ventures.musterapp.TEST_CLOCK
import de.sebaro_ventures.musterapp.TEST_TODAY
import de.sebaro_ventures.musterapp.await
import de.sebaro_ventures.musterapp.data.EntryRepository
import de.sebaro_ventures.musterapp.domain.Entry
import de.sebaro_ventures.musterapp.domain.NOTE_MAX
import de.sebaro_ventures.musterapp.domain.Priority
import de.sebaro_ventures.musterapp.testContainer
import de.sebaro_ventures.musterapp.watch
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.TestScope
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class FormViewModelTest {
    @get:Rule
    val folder = TemporaryFolder()

    @get:Rule
    val main = MainDispatcherRule()

    private lateinit var container: AppContainer

    @Before
    fun open() {
        container = testContainer(folder.root)
    }

    @After
    fun close() = container.database.close()

    /** A form that is watched as a screen watches it and has shown its first state. */
    private suspend fun TestScope.form(
        id: Long?,
        draft: SavedStateHandle = SavedStateHandle(),
        entries: EntryRepository = container.entries,
    ): FormViewModel = FormViewModel(id, draft, entries, TEST_CLOCK).also {
        watch(it.state)
        it.state.await()
    }

    private suspend fun stored(sample: Boolean = false): Entry {
        val entry = Entry(title = "Balkon bepflanzen", note = "Erde.", created = TEST_TODAY, sample = sample)
        return entry.copy(id = container.entries.add(entry))
    }

    @Test
    fun aNewEntryIsStoredTrimmedAndDatedByTheClock() = runTest {
        val viewModel = form(id = null)
        assertEquals(FormUiState(isNew = true), viewModel.state.value)

        viewModel.onTitle("  Keller aufräumen ")
        viewModel.onNote("Alte Farbe zum Wertstoffhof.\n")
        viewModel.onPriority(Priority.High)
        assertTrue(viewModel.state.await { it.priority == Priority.High }.changed)

        viewModel.onSave()
        val id = viewModel.state.await { it.savedId != null }.savedId!!
        assertEquals(
            Entry(id, "Keller aufräumen", "Alte Farbe zum Wertstoffhof.", Priority.High, TEST_TODAY),
            container.entries.entry(id).first(),
        )
    }

    @Test
    fun anEmptyTitleRefusesTheSave() = runTest {
        val viewModel = form(id = null)
        viewModel.onTitle("   ")
        viewModel.state.await { it.title == "   " }
        viewModel.onSave()
        val refused = viewModel.state.await { it.refused == 1 }
        assertTrue(refused.titleMissing)
        assertNull(refused.savedId)
        assertTrue(container.entries.entries.first().isEmpty())

        viewModel.onTitle("K")
        assertFalse("typing takes the sentence away", viewModel.state.await { it.title == "K" }.titleMissing)
    }

    @Test
    fun aNoteAboveTheLimitRefusesTheSave() = runTest {
        val viewModel = form(id = null)
        viewModel.onTitle("Keller aufräumen")
        viewModel.onNote("x".repeat(NOTE_MAX + 1))
        viewModel.state.await { it.note.length > NOTE_MAX }
        viewModel.onSave()
        val refused = viewModel.state.await { it.refused == 1 }
        assertFalse(refused.titleMissing)
        assertTrue(container.entries.entries.first().isEmpty())
    }

    @Test
    fun anEditShowsWhatIsStoredAndIsChangedOnlyWhenSomethingDiffers() = runTest {
        val entry = stored()
        val viewModel = form(entry.id)
        val shown = viewModel.state.value!!
        assertEquals(listOf(entry.title, entry.note, entry.title), listOf(shown.title, shown.note, shown.storedTitle))
        assertFalse(shown.isNew || shown.changed)

        viewModel.onTitle("Balkon bepflanzen, mit Tomaten")
        assertTrue(viewModel.state.await { it.title != entry.title }.changed)
        viewModel.onTitle(entry.title)
        assertFalse(viewModel.state.await { it.title == entry.title }.changed)
    }

    @Test
    fun aSampleStaysOneUntilItsWordsChange() = runTest {
        val sample = stored(sample = true)
        val priorityOnly = form(sample.id)
        assertTrue(priorityOnly.state.value!!.sample)
        priorityOnly.onPriority(Priority.Low)
        assertTrue("still a sample", priorityOnly.state.await { it.priority == Priority.Low }.sample)
        priorityOnly.onSave()
        priorityOnly.state.await { it.savedId != null }
        assertEquals(sample.copy(priority = Priority.Low), container.entries.entry(sample.id).first())

        val words = form(sample.id)
        words.onNote("Erde reicht.")
        assertFalse("the marker goes with the first changed word", words.state.await { it.changed }.sample)
        words.onSave()
        words.state.await { it.savedId != null }
        assertFalse(container.entries.entry(sample.id).first()!!.sample)
    }

    @Test
    fun theDraftIsStillThereInANewViewModel() = runTest {
        val entry = stored()
        val draft = SavedStateHandle()
        form(entry.id, draft).apply {
            onTitle("Balkon bepflanzen, mit Tomaten")
            onPriority(Priority.High)
        }
        val restored = form(entry.id, draft).state.value!!
        assertEquals("Balkon bepflanzen, mit Tomaten", restored.title)
        assertEquals(Priority.High, restored.priority)
        assertEquals("a field nobody touched shows what is stored", entry.note, restored.note)
        assertTrue(restored.changed)
    }

    @Test
    fun closingWithChangesAsksAndTheQuestionCanBeDismissed() = runTest {
        val viewModel = form(id = null)
        viewModel.onCloseAsked()
        viewModel.state.await { it.askUnsaved }
        viewModel.onDialogDismiss()
        viewModel.state.await { !it.askUnsaved }
    }

    @Test
    fun aSaveThatFailsShowsInTheStateAndKeepsTheDraft() = runTest {
        val viewModel = form(id = null, entries = EntryRepository(FullDiskDao(container.database.entryDao())))
        viewModel.onTitle("Keller aufräumen")
        viewModel.state.await { it.title == "Keller aufräumen" }
        viewModel.onSave()
        val failed = viewModel.state.await { it.saveFailed }
        assertEquals("Keller aufräumen", failed.title)
        assertNull(failed.savedId)
    }
}
