package de.sebaro_ventures.musterapp

import android.database.sqlite.SQLiteFullException
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import androidx.datastore.preferences.core.Preferences
import de.sebaro_ventures.musterapp.data.AppDatabase
import de.sebaro_ventures.musterapp.data.EntryDao
import de.sebaro_ventures.musterapp.data.EntryEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.TestScope
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.setMain
import org.junit.rules.TestWatcher
import org.junit.runner.Description
import org.robolectric.RuntimeEnvironment
import java.io.File
import java.io.IOException
import java.time.Clock
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

/** The moment every test runs at: 27 October 2026, 09:00 in Berlin. */
val TEST_CLOCK: Clock = Clock.fixed(Instant.parse("2026-10-27T08:00:00Z"), ZoneId.of("Europe/Berlin"))
val TEST_TODAY: LocalDate = LocalDate.now(TEST_CLOCK)

/**
 * The container as a test takes it: the factories replaced by a database in memory (without samples) and a
 * DataStore file in [folder], the clock fixed. Close its database after the test.
 */
fun testContainer(folder: File, clock: Clock = TEST_CLOCK): AppContainer {
    val context = RuntimeEnvironment.getApplication()
    return AppContainer(
        context = context,
        clock = clock,
        databaseFactory = { AppDatabase.inMemory(context) },
        settingsStoreFactory = { PreferenceDataStoreFactory.create { File(folder, "settings.preferences_pb") } },
    )
}

/** A DAO whose writes fail as a full disk does; reads go to [real]. */
class FullDiskDao(private val real: EntryDao) : EntryDao by real {
    override suspend fun insert(entry: EntryEntity): Long = throw SQLiteFullException("disk full")

    override suspend fun update(entry: EntryEntity) = throw SQLiteFullException("disk full")

    override suspend fun delete(id: Long) = throw SQLiteFullException("disk full")
}

/** A DataStore whose writes fail; reads go to [real]. */
class FullDiskStore(private val real: DataStore<Preferences>) : DataStore<Preferences> by real {
    override suspend fun updateData(transform: suspend (t: Preferences) -> Preferences): Preferences =
        throw IOException("disk full")
}

/** Runs `viewModelScope` on the test's thread, each step at once. */
@OptIn(ExperimentalCoroutinesApi::class)
class MainDispatcherRule : TestWatcher() {
    override fun starting(description: Description) = Dispatchers.setMain(UnconfinedTestDispatcher())

    override fun finished(description: Description) = Dispatchers.resetMain()
}

/**
 * Stands in for the screen: a ViewModel's state works only while somebody collects it
 * (`SharingStarted.WhileSubscribed`).
 */
fun TestScope.watch(state: StateFlow<*>) {
    backgroundScope.launch(Dispatchers.Unconfined) { state.collect {} }
}

/** The first state that is there and fulfils [condition]. */
suspend fun <T : Any> StateFlow<T?>.await(condition: (T) -> Boolean = { true }): T = filterNotNull().first(condition)
