package de.sebaro_ventures.musterapp

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.preferencesDataStoreFile
import de.sebaro_ventures.musterapp.data.AppDatabase
import de.sebaro_ventures.musterapp.data.EntryRepository
import de.sebaro_ventures.musterapp.data.SettingsRepository
import de.sebaro_ventures.musterapp.data.sampleEntries
import java.time.Clock
import java.time.LocalDate

/**
 * Everything that lives as long as the process, wired by hand: one instance, created in [MusterappApplication].
 * Every member is lazy, so a start opens nothing it does not need. A test passes its own [clock] and factories
 * (a database in memory, a DataStore file in a temporary folder).
 */
class AppContainer(
    context: Context,
    /** The app's only source of time. */
    val clock: Clock = Clock.systemDefaultZone(),
    databaseFactory: () -> AppDatabase = {
        AppDatabase.create(context) { sampleEntries(context.resources, LocalDate.now(clock)) }
    },
    settingsStoreFactory: () -> DataStore<Preferences> = {
        PreferenceDataStoreFactory.create { context.preferencesDataStoreFile("settings") }
    },
) {
    val database: AppDatabase by lazy(databaseFactory)

    val entries: EntryRepository by lazy { EntryRepository(database.entryDao()) }

    val settings: SettingsRepository by lazy { SettingsRepository(settingsStoreFactory()) }
}
