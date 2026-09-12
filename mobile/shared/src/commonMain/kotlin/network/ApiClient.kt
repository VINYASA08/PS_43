package network

import io.ktor.client.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json
import io.ktor.client.request.*
import io.ktor.client.call.body
import io.ktor.http.ContentType
import io.ktor.http.contentType
import getPlatformName

val defaultBaseUrl = if (getPlatformName() == "Android") "http://10.0.2.2:3000" else "http://localhost:3000"

class ApiClient(
    var baseUrl: String = defaultBaseUrl
) {
    val client = HttpClient {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                isLenient = true
            })
        }
    }

    suspend fun submitChallenge(request: MobileChallengeSubmission): MobileSubmissionResponse {
        return client.post("$baseUrl/api/mobile/challenges") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }.body()
    }

    suspend fun getAnalytics(): AnalyticsResponse {
        return client.get("$baseUrl/api/analytics").body()
    }
    
    suspend fun getChallenges(): ChallengesResponse {
        return client.get("$baseUrl/api/challenges").body()
    }
    
    suspend fun getProposals(): ProposalsResponse {
        return client.get("$baseUrl/api/proposals").body()
    }
    
    suspend fun getFunds(): FundsResponse {
        return client.get("$baseUrl/api/funds").body()
    }

    suspend fun getPendingUsers(): PendingUsersResponse {
        return client.get("$baseUrl/api/admin/pending-users").body()
    }

    suspend fun getAuditLogs(): AuditLogsResponse {
        return client.get("$baseUrl/api/audit-logs").body()
    }

    suspend fun verifyChallenge(challengeId: String, officerId: String = "test-nodal-id"): VerifyChallengeResponse {
        return client.post("$baseUrl/api/mobile/verify") {
            contentType(ContentType.Application.Json)
            setBody(VerifyChallengeRequest(challengeId = challengeId, nodalOfficerId = officerId))
        }.body()
    }

    suspend fun getTrackDetails(trackingId: String): TrackDetailResponse {
        return client.get("$baseUrl/api/track/$trackingId").body()
    }
}

