package db

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow

data class IssueEntity(
    val id: String,
    val title: String,
    val description: String,
    val isSynced: Boolean = false
)

// In a real KMP app using Room, this would be an @Dao with @Query
interface IssueDao {
    fun getAllIssues(): Flow<List<IssueEntity>>
    fun getPendingSyncIssues(): Flow<List<IssueEntity>>
    suspend fun insertIssue(issue: IssueEntity)
    suspend fun markAsSynced(id: String)
}

// In-memory mock representing the SQLite/Room caching layer
class RoomMockDatabase : IssueDao {
    private val issues = MutableStateFlow<List<IssueEntity>>(emptyList())
    
    override fun getAllIssues(): Flow<List<IssueEntity>> = issues
    
    override fun getPendingSyncIssues(): Flow<List<IssueEntity>> {
        // Return unsynced issues for background sync
        return MutableStateFlow(issues.value.filter { !it.isSynced })
    }
    
    override suspend fun insertIssue(issue: IssueEntity) {
        val current = issues.value.toMutableList()
        current.add(issue)
        issues.value = current
    }
    
    override suspend fun markAsSynced(id: String) {
        val current = issues.value.toMutableList()
        val index = current.indexOfFirst { it.id == id }
        if (index != -1) {
            current[index] = current[index].copy(isSynced = true)
            issues.value = current
        }
    }
}

class IssueRepository(private val dao: IssueDao) {
    fun getLocalIssues() = dao.getAllIssues()
    
    suspend fun submitIssue(title: String, description: String) {
        val issue = IssueEntity(
            id = (0..1000000).random().toString(),
            title = title,
            description = description,
            isSynced = false
        )
        // 1. Cache to local SQLite/Room
        dao.insertIssue(issue)
        
        // 2. Trigger background sync
        syncPendingIssues()
    }
    
    private suspend fun syncPendingIssues() {
        // Mock sync logic to upstream Next.js API
        // After successful sync:
        // dao.markAsSynced(issue.id)
    }
}
