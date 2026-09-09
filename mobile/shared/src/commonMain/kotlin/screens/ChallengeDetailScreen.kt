package screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.LocalNavigator
import localization.LocalLocalization
import network.*
import org.koin.compose.koinInject
import DeepTeal
import WarmAmber

class ChallengeDetailScreen(val challenge: Challenge) : Screen {

    @Composable
    override fun Content() {
        val navigator = LocalNavigator.current
        val strings = LocalLocalization.current.strings
        val apiClient = koinInject<ApiClient>()

        var trackDetail by remember { mutableStateOf<TrackIssueDetail?>(null) }
        var isLoading by remember { mutableStateOf(true) }

        LaunchedEffect(challenge.id) {
            try {
                val qId = challenge.publicTrackingId ?: challenge.id
                if (qId.isNotBlank()) {
                    val res = apiClient.getTrackDetails(qId)
                    trackDetail = res.issue
                }
            } catch (_: Exception) {
                // Fallback to local data if network unavailable
            } finally {
                isLoading = false
            }
        }

        val effectiveTrack = trackDetail?.track ?: challenge.track
        val effectiveTitle = if (!trackDetail?.title.isNullOrBlank()) trackDetail!!.title else challenge.title
        val effectiveDesc = challenge.description.ifBlank { "Societal problem reported by citizen for field triage and resolution." }
        val effectiveDomain = trackDetail?.domain ?: challenge.domain
        val effectiveLocation = trackDetail?.location ?: "${challenge.district}${if (challenge.location != null) " • ${challenge.location}" else ""}"
        val effectiveUrgency = trackDetail?.urgency ?: challenge.urgency
        val effectiveRouting = trackDetail?.trackRouting ?: challenge.trackRouting ?: challenge.assignedInstitute ?: "District Nodal Division"
        val effectiveTrackingId = trackDetail?.id ?: challenge.publicTrackingId ?: "IN-GR-${challenge.id.take(8).uppercase()}"
        val effectiveSlaStatus = trackDetail?.slaStatus ?: if (challenge.slaDeadline != null) "SLA: ${challenge.slaDeadline}" else "SLA: Active & Monitored"
        val effectiveStatusText = trackDetail?.statusText ?: "Phase 2: ${challenge.status.ifBlank { "UNDER REVIEW" }}"

        val timelineSteps: List<TimelineStep> = if (!trackDetail?.timeline.isNullOrEmpty()) {
            trackDetail!!.timeline
        } else {
            when (effectiveTrack) {
                "TRACK_C_CIVIC" -> listOf(
                    TimelineStep(1, "Submitted by Citizen", "Civic Grievance Logged", "completed", "Logged", "Cryptographic GPS hash recorded with field evidence under DPDP Act."),
                    TimelineStep(2, "AI Rapid Civic Triage", "Track C Civic Hazard SLA", "completed", "Triaged", "Statutory 24-72h rapid resolution SLA assigned."),
                    TimelineStep(3, "Assigned to Local Body", effectiveRouting, "current", "Active", "Dispatched to local municipal or panchayat maintenance crew."),
                    TimelineStep(4, "Quick Response Team Dispatched", "On-Site Crew Mobilized", "pending", "Queued", "Field crew scheduled for on-site clearing and hazard containment."),
                    TimelineStep(5, "Citizen Verification & Closure", "Citizen Sign-off", "pending", "Pending", "Citizen photo verification workflow triggered upon completion.")
                )
                "TRACK_B_STANDARD" -> listOf(
                    TimelineStep(1, "Submitted by Citizen", "Infrastructure Defect Logged", "completed", "Logged", "Field evidence and technical failure parameters recorded."),
                    TimelineStep(2, "AI Standard Triage", "Track B Public Works SLA", "completed", "Triaged", "14-30 day statutory procurement and repair SLA assigned."),
                    TimelineStep(3, "Assigned to Line Department", effectiveRouting, "current", "Active", "State line department nodal division mobilized for technical audit."),
                    TimelineStep(4, "Tender / Work Order Sanctioned", "Departmental Work Order", "pending", "Queued", "Statutory e-procurement tender issued under Departmental Schedule of Rates."),
                    TimelineStep(5, "Field Execution & Sign-off", "Divisional Engineer Audit", "pending", "Pending", "Physical inspection and divisional engineer completion certification.")
                )
                else -> listOf(
                    TimelineStep(1, "Submitted by Citizen", "Applied R&D Docket Logged", "completed", "Logged", "Cryptographic GPS hash recorded. Anonymity preserved under DPDP Act."),
                    TimelineStep(2, "AI Clustered & Triaged", "Track A Innovation / R&D", "completed", "Triaged", "Automated risk matrix assigned urgency level: $effectiveUrgency."),
                    TimelineStep(3, "Assigned to Research Lab", effectiveRouting, "current", "Active", "Multidisciplinary academic research team mobilized."),
                    TimelineStep(4, "Industry Funded via Escrow", "CSR Convergence Matching", "pending", "Pending", "Tripartite MoU execution and Corporate CSR Escrow commitment."),
                    TimelineStep(5, "Field Deployment & Validation", "Pilot Installation & Testing", "pending", "Pending", "Independent physical audit and citizen reporter OTP sign-off.")
                )
            }
        }

        Scaffold(
            topBar = {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Brush.horizontalGradient(listOf(Color(0xFF0D9488), Color(0xFF065F46))))
                ) {
                    TopAppBar(
                        title = {
                            Column {
                                Text(effectiveTrackingId, color = Color.White, style = MaterialTheme.typography.subtitle1.copy(fontWeight = FontWeight.Bold))
                                Text(effectiveStatusText, color = Color.White.copy(alpha = 0.8f), style = MaterialTheme.typography.caption)
                            }
                        },
                        navigationIcon = {
                            IconButton(onClick = { navigator?.pop() }) {
                                Icon(Icons.Default.ArrowBack, contentDescription = strings.back, tint = Color.White)
                            }
                        },
                        backgroundColor = Color.Transparent,
                        elevation = 0.dp
                    )
                }
            }
        ) { padding ->
            if (isLoading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = DeepTeal)
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Header Overview Card
                    item {
                        Card(
                            elevation = 0.dp,
                            shape = RoundedCornerShape(20.dp),
                            backgroundColor = MaterialTheme.colors.surface.copy(alpha = 0.85f),
                            modifier = Modifier
                                .fillMaxWidth()
                                .border(1.dp, Color.White.copy(alpha = 0.3f), RoundedCornerShape(20.dp))
                        ) {
                            Column(modifier = Modifier.padding(20.dp)) {
                                // Track Badge & SLA Badge
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    TrackBadge(effectiveTrack)
                                    SlaBadge(effectiveSlaStatus)
                                }

                                Spacer(modifier = Modifier.height(14.dp))
                                Text(
                                    text = effectiveTitle,
                                    style = MaterialTheme.typography.h6.copy(fontWeight = FontWeight.Bold),
                                    color = Color(0xFF0F172A)
                                )

                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = effectiveDesc,
                                    style = MaterialTheme.typography.body2,
                                    color = Color(0xFF334155),
                                    lineHeight = 20.sp
                                )

                                Spacer(modifier = Modifier.height(14.dp))
                                Divider(color = Color(0xFFE2E8F0))
                                Spacer(modifier = Modifier.height(12.dp))

                                // Metadata row
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        Icons.Default.LocationOn,
                                        contentDescription = "Location",
                                        tint = DeepTeal,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = effectiveLocation,
                                        style = MaterialTheme.typography.caption.copy(fontWeight = FontWeight.Medium),
                                        color = Color(0xFF475569)
                                    )
                                }

                                Spacer(modifier = Modifier.height(6.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        Icons.Default.Info,
                                        contentDescription = "Routing",
                                        tint = WarmAmber,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = "Assigned: $effectiveRouting",
                                        style = MaterialTheme.typography.caption.copy(fontWeight = FontWeight.Medium),
                                        color = Color(0xFF475569)
                                    )
                                }

                                if (effectiveDomain.isNotBlank()) {
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Surface(
                                            color = Color(0xFFF1F5F9),
                                            shape = RoundedCornerShape(6.dp)
                                        ) {
                                            Text(
                                                text = "Domain: $effectiveDomain",
                                                style = MaterialTheme.typography.caption.copy(fontWeight = FontWeight.SemiBold),
                                                color = Color(0xFF334155),
                                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Telemetry Section (if available)
                    val telemetryItems = trackDetail?.telemetry ?: emptyList()
                    if (telemetryItems.isNotEmpty()) {
                        item {
                            Text(
                                "Live Ground Telemetry",
                                style = MaterialTheme.typography.subtitle1.copy(fontWeight = FontWeight.Bold),
                                color = DeepTeal
                            )
                        }
                        item {
                            Card(
                                elevation = 0.dp,
                                shape = RoundedCornerShape(16.dp),
                                backgroundColor = MaterialTheme.colors.surface.copy(alpha = 0.7f),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .border(1.dp, Color.White.copy(alpha = 0.2f), RoundedCornerShape(16.dp))
                            ) {
                                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                    telemetryItems.forEach { item ->
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Text(item.label, style = MaterialTheme.typography.body2, color = Color(0xFF475569))
                                            Text(
                                                item.value,
                                                style = MaterialTheme.typography.body2.copy(fontWeight = FontWeight.Bold),
                                                color = when (item.status) {
                                                    "Critical", "Severe", "Alert" -> Color(0xFFDC2626)
                                                    "Warning" -> Color(0xFFD97706)
                                                    else -> Color(0xFF059669)
                                                }
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // 5-Stage Timeline Section Header
                    item {
                        Text(
                            "5-Stage Resolution Timeline",
                            style = MaterialTheme.typography.subtitle1.copy(fontWeight = FontWeight.Bold),
                            color = DeepTeal
                        )
                    }

                    // Timeline Items
                    itemsIndexed(timelineSteps) { index, step ->
                        TimelineStepRow(
                            step = step,
                            isLast = index == timelineSteps.size - 1
                        )
                    }
                }
            }
        }
    }

    @Composable
    private fun TrackBadge(track: String) {
        val (bg, fg, label) = when (track) {
            "TRACK_C_CIVIC" -> Triple(Color(0xFFFEF3C7), Color(0xFFB45309), "Track C: Civic Hazard")
            "TRACK_B_STANDARD" -> Triple(Color(0xFFDBEAFE), Color(0xFF1D4ED8), "Track B: Public Works")
            else -> Triple(Color(0xFFEDE9FE), Color(0xFF6D28D9), "Track A: Applied R&D")
        }

        Surface(
            color = bg,
            shape = RoundedCornerShape(8.dp)
        ) {
            Text(
                text = label,
                color = fg,
                style = MaterialTheme.typography.caption.copy(fontWeight = FontWeight.Bold),
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
            )
        }
    }

    @Composable
    private fun SlaBadge(slaStatus: String) {
        val isBreached = slaStatus.contains("Breached", ignoreCase = true)
        val bg = if (isBreached) Color(0xFFFEE2E2) else Color(0xFFDCFCE7)
        val fg = if (isBreached) Color(0xFFDC2626) else Color(0xFF15803D)

        Surface(
            color = bg,
            shape = RoundedCornerShape(8.dp)
        ) {
            Text(
                text = slaStatus,
                color = fg,
                style = MaterialTheme.typography.caption.copy(fontWeight = FontWeight.SemiBold),
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
            )
        }
    }

    @Composable
    private fun TimelineStepRow(step: TimelineStep, isLast: Boolean) {
        val isCompleted = step.status == "completed"
        val isCurrent = step.status == "current"

        val nodeColor = when {
            isCompleted -> DeepTeal
            isCurrent -> WarmAmber
            else -> Color(0xFFCBD5E1)
        }

        Row(modifier = Modifier.fillMaxWidth()) {
            // Indicator Column (Circle + Connector Line)
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.width(36.dp)
            ) {
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                        .size(28.dp)
                        .background(nodeColor, CircleShape)
                ) {
                    if (isCompleted) {
                        Icon(
                            Icons.Default.Check,
                            contentDescription = "Completed",
                            tint = Color.White,
                            modifier = Modifier.size(16.dp)
                        )
                    } else {
                        Text(
                            text = "${step.step}",
                            color = if (isCurrent) Color(0xFF1E293B) else Color.White,
                            style = MaterialTheme.typography.caption.copy(fontWeight = FontWeight.Bold)
                        )
                    }
                }

                if (!isLast) {
                    Box(
                        modifier = Modifier
                            .width(2.dp)
                            .height(60.dp)
                            .background(if (isCompleted) DeepTeal else Color(0xFFE2E8F0))
                    )
                }
            }

            Spacer(modifier = Modifier.width(12.dp))

            // Step Content Card
            Card(
                elevation = 0.dp,
                shape = RoundedCornerShape(12.dp),
                backgroundColor = if (isCurrent) Color(0xFFFFFBEB) else MaterialTheme.colors.surface.copy(alpha = 0.7f),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = if (isLast) 0.dp else 12.dp)
                    .border(
                        width = 1.dp,
                        color = if (isCurrent) WarmAmber.copy(alpha = 0.5f) else Color.White.copy(alpha = 0.2f),
                        shape = RoundedCornerShape(12.dp)
                    )
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            step.title,
                            style = MaterialTheme.typography.subtitle2.copy(fontWeight = FontWeight.Bold),
                            color = if (isCurrent) Color(0xFF92400E) else Color(0xFF0F172A)
                        )
                        if (step.date.isNotBlank()) {
                            Text(
                                step.date,
                                style = MaterialTheme.typography.caption,
                                color = Color(0xFF64748B)
                            )
                        }
                    }

                    if (step.subtitle.isNotBlank()) {
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            step.subtitle,
                            style = MaterialTheme.typography.caption.copy(fontWeight = FontWeight.SemiBold),
                            color = if (isCurrent) WarmAmber else DeepTeal
                        )
                    }

                    if (step.details.isNotBlank()) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            step.details,
                            style = MaterialTheme.typography.body2,
                            color = Color(0xFF475569)
                        )
                    }
                }
            }
        }
    }
}
