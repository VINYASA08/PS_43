package network

import io.ktor.client.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json
import io.ktor.client.request.*
import io.ktor.client.call.body

class ApiClient {
    val client = HttpClient {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                isLenient = true
            })
        }
    }

    suspend fun getAnalytics(): AnalyticsResponse {
        return client.get("http://10.0.2.2:3000/api/analytics").body()
    }
    
    suspend fun getChallenges(): ChallengesResponse {
        return client.get("http://10.0.2.2:3000/api/challenges").body()
    }
    
    suspend fun getProposals(): ProposalsResponse {
        return client.get("http://10.0.2.2:3000/api/proposals").body()
    }
    
    suspend fun getFunds(): FundsResponse {
        return client.get("http://10.0.2.2:3000/api/funds").body()
    }

    suspend fun getPendingUsers(): PendingUsersResponse {
        return client.get("http://10.0.2.2:3000/api/admin/pending-users").body()
    }

    suspend fun getAuditLogs(): AuditLogsResponse {
        return client.get("http://10.0.2.2:3000/api/audit-logs").body()
    }
}
