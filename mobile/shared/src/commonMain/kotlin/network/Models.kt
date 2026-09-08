package network

import kotlinx.serialization.Serializable

@Serializable
data class AnalyticsSummary(
    val totalSubmissions: Int = 0,
    val problemsResolved: Int = 0,
    val activePrototypes: Int = 0
)

@Serializable
data class DomainDistribution(
    val domain: String = "",
    val count: Int = 0,
    val name: String = ""
)

@Serializable
data class AnalyticsResponse(
    val summary: AnalyticsSummary = AnalyticsSummary(),
    val domainDistribution: List<DomainDistribution> = emptyList()
)

@Serializable
data class Challenge(
    val id: String = "",
    val publicTrackingId: String? = null,
    val title: String = "",
    val domain: String = "",
    val district: String = "",
    val urgency: String = "",
    val status: String = "",
    val track: String = "TRACK_A_INNOVATION",
    val trackRouting: String? = null,
    val triageReasoning: String? = null,
    val assignedInstitute: String? = null,
    val slaDeadline: String? = null,
    val escalationLevel: Int = 0,
    val description: String = ""
)

@Serializable
data class ChallengesResponse(
    val challenges: List<Challenge> = emptyList()
)

@Serializable
data class PendingUser(
    val id: String = "",
    val name: String = "",
    val organization: String? = null,
    val email: String = "",
    val designation: String? = null,
    val district: String? = null
)

@Serializable
data class PendingUsersResponse(
    val pendingUsers: List<PendingUser> = emptyList()
)

@Serializable
data class UserSimple(
    val name: String = ""
)

@Serializable
data class AuditLog(
    val id: String = "",
    val action: String = "",
    val createdAt: String = "",
    val resource: String = "",
    val resourceId: String? = null,
    val user: UserSimple? = null
)

@Serializable
data class AuditLogsResponse(
    val logs: List<AuditLog> = emptyList()
)

@Serializable
data class Proposal(
    val id: String = "",
    val proposalRef: String? = null,
    val title: String = "",
    val universityName: String = "",
    val domain: String = "",
    val stage: String = "",
    val fundingRequested: String = "",
    val budget: Double = 0.0,
    val abstract: String = "",
    val status: String = "",
    val timelineMonths: Int = 0
)

@Serializable
data class ProposalsResponse(
    val proposals: List<Proposal> = emptyList()
)

@Serializable
data class ProposalSimple(
    val title: String = ""
)

@Serializable
data class Fund(
    val id: String = "",
    val escrowRef: String? = null,
    val type: String = "",
    val status: String = "",
    val corporateName: String = "",
    val amount: Double = 0.0,
    val mouSigned: Boolean = false,
    val proposal: ProposalSimple? = null
)

@Serializable
data class FundsResponse(
    val commitments: List<Fund>? = null,
    val funds: List<Fund>? = null
)
