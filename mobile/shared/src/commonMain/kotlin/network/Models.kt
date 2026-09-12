package network

import kotlinx.serialization.Serializable

@Serializable
data class MobileChallengeSubmission(
    val title: String,
    val description: String,
    val district: String,
    val location: String,
    val domain: String? = null,
    val evidenceUrl: String? = null,
    val reporterId: String? = null,
    val urgency: String? = "MEDIUM",
    val track: String? = null
)

@Serializable
data class MobileSubmissionResponse(
    val success: Boolean = false,
    val trackingId: String? = null,
    val challengeId: String? = null,
    val track: String? = null,
    val trackRouting: String? = null,
    val status: String? = null,
    val error: String? = null
)

typealias MobileSubmitRequest = MobileChallengeSubmission
typealias MobileSubmitResponse = MobileSubmissionResponse

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
    val location: String? = null,
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

@Serializable
data class VerifyChallengeRequest(
    val challengeId: String,
    val nodalOfficerId: String? = null,
    val sarpanchId: String? = null
)

@Serializable
data class VerifyChallengeResponse(
    val success: Boolean = false,
    val verified: Boolean? = null,
    val challengeId: String? = null,
    val trackingId: String? = null,
    val track: String? = null,
    val trackRouting: String? = null,
    val status: String? = null,
    val verifiedAt: String? = null,
    val message: String? = null,
    val duplicateOfTrackingId: String? = null,
    val error: String? = null
)

@Serializable
data class TelemetryItem(
    val label: String = "",
    val value: String = "",
    val status: String = ""
)

@Serializable
data class TimelineStep(
    val step: Int = 1,
    val title: String = "",
    val subtitle: String = "",
    val status: String = "pending",
    val date: String = "",
    val details: String = "",
    val badge: String? = null,
    val badgeColor: String? = null
)

@Serializable
data class TrackAuditLog(
    val timestamp: String = "",
    val entity: String = "",
    val action: String = "",
    val note: String = ""
)

@Serializable
data class TrackIssueDetail(
    val id: String = "",
    val challengeId: String = "",
    val title: String = "",
    val domain: String = "",
    val track: String = "TRACK_A_INNOVATION",
    val trackRouting: String? = null,
    val triageReasoning: String? = null,
    val triageConfidence: Double? = null,
    val targetEntityLevel: String? = null,
    val location: String = "",
    val submittedAt: String = "",
    val urgency: String = "",
    val assignedInstitute: String? = null,
    val industryPartner: String? = null,
    val fundingEscrow: String? = null,
    val statusText: String = "",
    val slaStatus: String = "",
    val telemetry: List<TelemetryItem> = emptyList(),
    val timeline: List<TimelineStep> = emptyList(),
    val logs: List<TrackAuditLog> = emptyList()
)

@Serializable
data class TrackDetailResponse(
    val success: Boolean = false,
    val issue: TrackIssueDetail? = null,
    val error: String? = null
)

