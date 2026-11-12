package de.sebaro_ventures.musterapp.data

import android.database.sqlite.SQLiteFullException
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import java.io.IOException

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class SavingTest {
    @Test
    fun aWriteThatGoesThroughIsSaved() = runTest {
        assertEquals(true, trySave {})
    }

    @Test
    fun aFailureOfTheStorageIsNotSaved() = runTest {
        assertEquals(false, trySave { throw SQLiteFullException("disk full") })
        assertEquals(false, trySave { throw IOException("disk full") })
    }

    @Test
    fun aProgrammingErrorStaysLoud() {
        assertThrows(IllegalStateException::class.java) { runTest { trySave { error("a bug") } } }
    }
}
