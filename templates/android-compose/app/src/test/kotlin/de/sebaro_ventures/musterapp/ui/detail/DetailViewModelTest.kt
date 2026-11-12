package de.sebaro_ventures.musterapp.ui.detail

import de.sebaro_ventures.musterapp.AppContainer
import de.sebaro_ventures.musterapp.FullDiskDao
import de.sebaro_ventures.musterapp.MainDispatcherRule
import de.sebaro_ventures.musterapp.TEST_TODAY
import de.sebaro_ventures.musterapp.await
import de.sebaro_ventures.musterapp.data.EntryRepository
import de.sebaro_ventures.musterapp.domain.Entry
import de.sebaro_ventures.musterapp.domain.EntryState
import de.sebaro_ventures.musterapp.testContainer
import de.sebaro_ventures.musterapp.watch
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class DetailViewModelTest {
    @get:Rule
    val folder = TemporaryFolder()

    @get:Rule
    val main = MainDispatcherRule()

    private lateinit var container: AppContainer
    private lateinit var entry: Entry

    @Before
    fun open() = runTest {
        container = testContainer(folder.root)
        val written = Entry(title = "Mütze abholen", note = "Bis Freitag.", created = TEST_TODAY)
        entry = written.copy(id = container.entries.add(written))
    }

    @After
    fun close() = container.database.close()

    @Test
    fun theEntryIsShown() = runTest {
        assertEquals(DetailUiState(entry), DetailViewModel(entry.id, container.entries).state.await())
    }

    @Test
    fun anEntryThatDoesNotExistIsShownAsGone() = runTest {
        assertNull(DetailViewModel(entry.id + 1, container.entries).state.await().entry)
    }

    @Test
    fun finishingAsksFirstAndThenTheEntryIsDone() = runTest {
        val viewModel = DetailViewModel(entry.id, container.entries)
        watch(viewModel.state)
        viewModel.state.await()

        viewModel.onAsk(DetailDialog.Finish)
        assertEquals(EntryState.Open, viewModel.state.await { it.dialog == DetailDialog.Finish }.entry?.state)

        viewModel.onFinish()
        val done = viewModel.state.await { it.entry?.state == EntryState.Done }
        assertNull("the question is closed", done.dialog)
    }

    @Test
    fun aQuestionCanBeDismissed() = runTest {
        val viewModel = DetailViewModel(entry.id, container.entries)
        watch(viewModel.state)
        viewModel.onAsk(DetailDialog.Delete)
        viewModel.state.await { it.dialog == DetailDialog.Delete }
        viewModel.onDialogDismiss()
        assertEquals(entry, viewModel.state.await { it.dialog == null }.entry)
    }

    @Test
    fun deletingLeavesNoEntry() = runTest {
        val viewModel = DetailViewModel(entry.id, container.entries)
        watch(viewModel.state)
        viewModel.state.await()

        viewModel.onDelete()
        viewModel.state.await { it.entry == null }
    }

    @Test
    fun aWriteThatFailsShowsInTheState() = runTest {
        val viewModel = DetailViewModel(entry.id, EntryRepository(FullDiskDao(container.database.entryDao())))
        watch(viewModel.state)
        viewModel.state.await()

        viewModel.onDelete()
        assertEquals(entry, viewModel.state.await { it.saveFailed }.entry)

        viewModel.onFailureSeen()
        viewModel.state.await { !it.saveFailed }
    }
}
