package de.sebaro_ventures.musterapp.data

import de.sebaro_ventures.musterapp.AppContainer
import de.sebaro_ventures.musterapp.R
import de.sebaro_ventures.musterapp.TEST_TODAY
import de.sebaro_ventures.musterapp.domain.Entry
import de.sebaro_ventures.musterapp.domain.EntryState
import de.sebaro_ventures.musterapp.domain.Priority
import de.sebaro_ventures.musterapp.testContainer
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class EntryRepositoryTest {
    @get:Rule
    val folder = TemporaryFolder()

    private lateinit var container: AppContainer
    private val entries get() = container.entries

    @Before
    fun open() {
        container = testContainer(folder.root)
    }

    @After
    fun close() = container.database.close()

    @Test
    fun aNewEntryIsReadBackAsItWasWritten() = runTest {
        val written = Entry(0, "Keller aufräumen", "Farbe weg.", Priority.High, TEST_TODAY)
        val id = entries.add(written)
        assertEquals(written.copy(id = id), entries.entry(id).first())
    }

    @Test
    fun entriesComeNewestFirst() = runTest {
        val old = entries.add(Entry(title = "alt", created = TEST_TODAY.minusDays(3)))
        val first = entries.add(Entry(title = "heute, zuerst", created = TEST_TODAY))
        val second = entries.add(Entry(title = "heute, danach", created = TEST_TODAY))
        assertEquals(listOf(second, first, old), entries.entries.first().map { it.id })
    }

    @Test
    fun aChangeAndADeletionReachTheReader() = runTest {
        val id = entries.add(Entry(title = "Keller aufräumen", created = TEST_TODAY))
        val stored = entries.entry(id).first()!!
        entries.update(stored.copy(state = EntryState.Done, hidden = true))
        assertEquals(stored.copy(state = EntryState.Done, hidden = true), entries.entries.first().single())
        entries.delete(id)
        assertTrue(entries.entries.first().isEmpty())
        assertNull(entries.entry(id).first())
    }

    @Test
    fun theSamplesAreWrittenOnceWhenTheDatabaseIsCreated() = runTest {
        val context = RuntimeEnvironment.getApplication()
        val samples = { sampleEntries(context.resources, TEST_TODAY) }
        val first = AppDatabase.create(context, samples)
        val written = EntryRepository(first.entryDao()).entries.first()
        assertEquals(context.resources.getStringArray(R.array.sample_titles).toList(), written.map { it.title })
        assertTrue(written.all { it.sample && it.created < TEST_TODAY })
        assertEquals(listOf(3, 2), EntryState.entries.map { state -> written.count { it.state == state } })
        EntryRepository(first.entryDao()).delete(written.first().id)
        first.close()

        // a new process: the same file, and the deleted sample stays deleted
        val second = AppDatabase.create(context, samples)
        assertEquals(written.drop(1), EntryRepository(second.entryDao()).entries.first())
        second.close()
    }
}
