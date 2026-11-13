package de.sebaro_ventures.musterapp.data

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.Update
import androidx.sqlite.db.SupportSQLiteDatabase
import de.sebaro_ventures.musterapp.domain.Entry
import de.sebaro_ventures.musterapp.domain.EntryState
import de.sebaro_ventures.musterapp.domain.Priority
import kotlinx.coroutines.flow.Flow
import java.time.LocalDate

/** One row of the table „entry“. Room stores the enums by name and [created] as an ISO date. */
@Entity(tableName = "entry")
data class EntryEntity(
    @PrimaryKey(autoGenerate = true) val id: Long,
    val title: String,
    val note: String,
    val priority: Priority,
    val created: String,
    val state: EntryState,
    val hidden: Boolean,
    val sample: Boolean,
)

fun EntryEntity.toEntry() = Entry(id, title, note, priority, LocalDate.parse(created), state, hidden, sample)

fun Entry.toEntity() = EntryEntity(id, title, note, priority, created.toString(), state, hidden, sample)

/** The row for an insert without Room, with the column names of [EntryEntity]. */
private fun EntryEntity.values() = ContentValues().apply {
    put("title", title)
    put("note", note)
    put("priority", priority.name)
    put("created", created)
    put("state", state.name)
    put("hidden", hidden)
    put("sample", sample)
}

@Dao
interface EntryDao {
    @Query("SELECT * FROM entry ORDER BY created DESC, id DESC")
    fun observeAll(): Flow<List<EntryEntity>>

    @Query("SELECT * FROM entry WHERE id = :id")
    fun observe(id: Long): Flow<EntryEntity?>

    @Insert
    suspend fun insert(entry: EntryEntity): Long

    @Update
    suspend fun update(entry: EntryEntity)

    @Query("DELETE FROM entry WHERE id = :id")
    suspend fun delete(id: Long)
}

/**
 * The app's one database. The schema of every version is exported to app/schemas; a new version needs a migration
 * that keeps the data.
 */
@Database(entities = [EntryEntity::class], version = 1, exportSchema = true)
abstract class AppDatabase : RoomDatabase() {
    abstract fun entryDao(): EntryDao

    companion object {
        /**
         * The database on the device. [samples] are written when the file is created and never again, so a deleted
         * sample stays deleted.
         */
        fun create(context: Context, samples: () -> List<Entry>): AppDatabase =
            Room.databaseBuilder(context, AppDatabase::class.java, "musterapp.db")
                .addCallback(
                    object : Callback() {
                        override fun onCreate(db: SupportSQLiteDatabase) {
                            samples().forEach {
                                db.insert("entry", SQLiteDatabase.CONFLICT_ABORT, it.toEntity().values())
                            }
                        }
                    },
                )
                .build()

        /** An empty database in memory, for tests. */
        fun inMemory(context: Context): AppDatabase =
            Room.inMemoryDatabaseBuilder(context, AppDatabase::class.java).build()
    }
}
