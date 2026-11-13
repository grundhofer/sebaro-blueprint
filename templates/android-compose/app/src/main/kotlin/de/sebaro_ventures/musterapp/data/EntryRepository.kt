package de.sebaro_ventures.musterapp.data

import de.sebaro_ventures.musterapp.domain.Entry
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

/** The entries. A write throws when the storage fails; a ViewModel runs it inside [trySave]. */
class EntryRepository(private val dao: EntryDao) {
    /** Every entry, the newest first. */
    val entries: Flow<List<Entry>> = dao.observeAll().map { rows -> rows.map(EntryEntity::toEntry) }

    /** One entry; null when it does not exist (any more). */
    fun entry(id: Long): Flow<Entry?> = dao.observe(id).map { it?.toEntry() }

    /** Stores a new entry and returns its id. */
    suspend fun add(entry: Entry): Long = dao.insert(entry.toEntity())

    suspend fun update(entry: Entry) = dao.update(entry.toEntity())

    suspend fun delete(id: Long) = dao.delete(id)
}
