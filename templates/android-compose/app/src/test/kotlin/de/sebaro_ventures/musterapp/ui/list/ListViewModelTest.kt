package de.sebaro_ventures.musterapp.ui.list

import androidx.lifecycle.SavedStateHandle
import de.sebaro_ventures.musterapp.AppContainer
import de.sebaro_ventures.musterapp.FullDiskDao
import de.sebaro_ventures.musterapp.MainDispatcherRule
import de.sebaro_ventures.musterapp.TEST_TODAY
import de.sebaro_ventures.musterapp.await
import de.sebaro_ventures.musterapp.data.EntryRepository
import de.sebaro_ventures.musterapp.domain.Entry
import de.sebaro_ventures.musterapp.testContainer
import de.sebaro_ventures.musterapp.watch
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
class ListViewModelTest {
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

    private suspend fun add(title: String, note: String = "", hidden: Boolean = false, daysAgo: Long = 0): Entry {
        val entry = Entry(title = title, note = note, created = TEST_TODAY.minusDays(daysAgo), hidden = hidden)
        return entry.copy(id = container.entries.add(entry))
    }

    @Test
    fun withoutAnyEntryTheListIsEmpty() = runTest {
        val viewModel = ListViewModel(SavedStateHandle(), container.entries)
        assertEquals(ListUiState(emptyList(), none = true), viewModel.state.await())
    }

    @Test
    fun entriesComeNewestFirstAndHiddenOnesAreLeftOut() = runTest {
        val old = add("Regal im Flur aufbauen", daysAgo = 4)
        add("Wasserzähler ablesen", hidden = true)
        val new = add("Mütze abholen")
        val viewModel = ListViewModel(SavedStateHandle(), container.entries)
        assertEquals(ListUiState(listOf(new, old)), viewModel.state.await())
    }

    @Test
    fun theSearchLooksIntoTitleAndNote() = runTest {
        val shelf = add("Regal im Flur aufbauen", daysAgo = 1)
        val cap = add("Mütze abholen", note = "Liegt im Regal.")
        val viewModel = ListViewModel(SavedStateHandle(), container.entries)
        watch(viewModel.state)

        viewModel.onQuery(" regal ")
        assertEquals(listOf(cap, shelf), viewModel.state.await { it.query == " regal " }.entries)
        viewModel.onQuery("Zebra")
        val miss = viewModel.state.await { it.query == "Zebra" }
        assertTrue(miss.entries.isEmpty())
        assertFalse("a search without a hit is not an empty list", miss.none)
    }

    @Test
    fun theSearchTextIsADraftThatANewViewModelStillHas() = runTest {
        add("Mütze abholen")
        val savedState = SavedStateHandle()
        ListViewModel(savedState, container.entries).onQuery("Mütze")
        assertEquals("Mütze", ListViewModel(savedState, container.entries).state.await().query)
    }

    @Test
    fun hidingAnEntryCanBeUndone() = runTest {
        val cap = add("Mütze abholen")
        val viewModel = ListViewModel(SavedStateHandle(), container.entries)
        watch(viewModel.state)

        viewModel.onHide(cap)
        val hidden = viewModel.state.await { it.hidden != null }
        assertEquals(cap, hidden.hidden)
        assertTrue(hidden.none)

        viewModel.onUndoHide()
        viewModel.state.await { it.hidden == null && it.entries == listOf(cap) }
    }

    @Test
    fun aWriteThatFailsShowsInTheState() = runTest {
        val cap = add("Mütze abholen")
        val viewModel = ListViewModel(SavedStateHandle(), EntryRepository(FullDiskDao(container.database.entryDao())))
        watch(viewModel.state)

        viewModel.onHide(cap)
        val failed = viewModel.state.await { it.saveFailed }
        assertEquals(listOf(cap), failed.entries)
        assertNull("nothing was hidden, so nothing can be undone", failed.hidden)

        viewModel.onFailureSeen()
        viewModel.state.await { !it.saveFailed }
    }
}
