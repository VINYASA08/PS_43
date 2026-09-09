package screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Home
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.rememberVectorPainter
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.clickable
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.ui.text.font.FontWeight
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.tab.Tab
import cafe.adriel.voyager.navigator.tab.TabOptions
import cafe.adriel.voyager.navigator.tab.LocalTabNavigator
import kotlinx.coroutines.delay
import localization.LocalLocalization
import network.ApiClient
import network.Challenge
import org.koin.compose.koinInject
import DeepTeal
import WarmAmber

object HomeTab : Tab {
    override val options: TabOptions
        @Composable
        get() {
            val title = LocalLocalization.current.strings.homeTabTitle
            val icon = rememberVectorPainter(Icons.Default.Home)
            return remember(title) {
                TabOptions(
                    index = 0u,
                    title = title,
                    icon = icon
                )
            }
        }

    @Composable
    override fun Content() {
        val tabNavigator = LocalTabNavigator.current
        val localization = LocalLocalization.current
        val navigator = LocalNavigator.current
        val apiClient = koinInject<ApiClient>()

        var challenges by remember { mutableStateOf<List<Challenge>>(emptyList()) }
        var isLoading by remember { mutableStateOf(true) }

        LaunchedEffect(Unit) {
            try {
                val res = apiClient.getChallenges()
                if (res.challenges.isNotEmpty()) {
                    challenges = res.challenges
                }
            } catch (_: Exception) {
                // Fallback to local sample challenges
            }
            if (challenges.isEmpty()) {
                challenges = listOf(
                    Challenge(
                        id = "chal-001",
                        publicTrackingId = "IN-GR-2026-1042",
                        title = "Acid Mine Drainage in Damodar River Basin",
                        domain = "Water & Sanitation",
                        district = "Dhanbad",
                        location = "Jharia Block, 23.74° N, 86.41° E",
                        urgency = "CRITICAL",
                        status = "UNDER_REVIEW",
                        track = "TRACK_A_INNOVATION",
                        trackRouting = "IIT ISM Dhanbad Water Lab",
                        slaDeadline = "72h Rapid SLA",
                        description = "Runoff from abandoned opencast coal pits causing severe water acidification and heavy metal runoff."
                    ),
                    Challenge(
                        id = "chal-002",
                        publicTrackingId = "IN-GR-2026-1088",
                        title = "Damaged Bridge Abutment on NH-33 Feeder",
                        domain = "Road Infrastructure",
                        district = "Ranchi",
                        location = "Namkum Feeder Road, 23.36° N, 85.38° E",
                        urgency = "HIGH",
                        status = "IN_PROGRESS",
                        track = "TRACK_B_STANDARD",
                        trackRouting = "PWD Road Division Ranchi",
                        slaDeadline = "14 Days",
                        description = "Monsoon scour has eroded south pier abutment creating transit safety hazard."
                    ),
                    Challenge(
                        id = "chal-003",
                        publicTrackingId = "IN-GR-2026-1145",
                        title = "Primary Storm Drain Choked at Bistupur",
                        domain = "Civic Sanitation",
                        district = "Jamshedpur",
                        location = "Bistupur Market Ward 4",
                        urgency = "MEDIUM",
                        status = "REPORTED",
                        track = "TRACK_C_CIVIC",
                        trackRouting = "Jamshedpur Notified Area Committee",
                        slaDeadline = "24h Rapid SLA",
                        description = "Severe blockage of main storm drain causing localized road inundation."
                    )
                )
            }
            delay(300)
            isLoading = false
        }

        // FAB bounce animation
        var fabVisible by remember { mutableStateOf(false) }
        LaunchedEffect(Unit) {
            delay(300)
            fabVisible = true
        }
        val fabScale by animateFloatAsState(
            targetValue = if (fabVisible) 1f else 0f,
            animationSpec = spring(dampingRatio = 0.5f, stiffness = 300f)
        )

        Scaffold(
            topBar = {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.horizontalGradient(
                                colors = listOf(
                                    Color(0xFF0D9488),
                                    Color(0xFF065F46)
                                )
                            )
                        )
                        .statusBarsPadding()
                        .padding(horizontal = 16.dp, vertical = 12.dp)
                ) {
                    Text(
                        text = localization.strings.mySubmittedProblems,
                        style = MaterialTheme.typography.h6,
                        color = Color.White
                    )
                }
            },
            floatingActionButton = {
                FloatingActionButton(
                    onClick = { tabNavigator.current = SubmitTab },
                    modifier = Modifier.scale(fabScale),
                    backgroundColor = WarmAmber,
                    contentColor = Color(0xFF1E293B),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = localization.strings.submitProblem)
                }
            }
        ) { paddingValues ->
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                if (isLoading) {
                    // Shimmer placeholders
                    items(3) {
                        ShimmerCard()
                    }
                } else {
                    itemsIndexed(challenges) { index, challenge ->
                        var visible by remember { mutableStateOf(false) }
                        LaunchedEffect(index) {
                            delay(index * 100L)
                            visible = true
                        }
                        AnimatedVisibility(
                            visible = visible,
                            enter = fadeIn(animationSpec = tween(400))
                        ) {
                            GlassCard(
                                modifier = Modifier.clickable {
                                    navigator?.push(ChallengeDetailScreen(challenge))
                                }
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            challenge.title,
                                            style = MaterialTheme.typography.subtitle1.copy(fontWeight = FontWeight.Bold),
                                            modifier = Modifier.weight(1f)
                                        )
                                        challenge.publicTrackingId?.let { trackingId ->
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Surface(
                                                color = DeepTeal.copy(alpha = 0.12f),
                                                shape = RoundedCornerShape(6.dp)
                                            ) {
                                                Text(
                                                    trackingId,
                                                    style = MaterialTheme.typography.caption.copy(fontWeight = FontWeight.Bold),
                                                    color = DeepTeal,
                                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                                )
                                            }
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            "${challenge.district} • ${challenge.domain}",
                                            style = MaterialTheme.typography.caption,
                                            color = Color(0xFF64748B)
                                        )
                                        Text(
                                            challenge.status.ifBlank { "UNDER REVIEW" },
                                            style = MaterialTheme.typography.caption.copy(fontWeight = FontWeight.SemiBold),
                                            color = WarmAmber
                                        )
                                    }
                                    if (challenge.description.isNotBlank()) {
                                        Spacer(modifier = Modifier.height(8.dp))
                                        Text(
                                            challenge.description,
                                            style = MaterialTheme.typography.body2,
                                            maxLines = 2
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(10.dp))
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.End,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            "Track SLA & Timeline →",
                                            style = MaterialTheme.typography.caption.copy(fontWeight = FontWeight.Bold),
                                            color = DeepTeal
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    Card(
        elevation = 0.dp,
        shape = RoundedCornerShape(16.dp),
        backgroundColor = MaterialTheme.colors.surface.copy(alpha = 0.7f),
        modifier = modifier
            .fillMaxWidth()
            .border(
                width = 1.dp,
                color = Color.White.copy(alpha = 0.2f),
                shape = RoundedCornerShape(16.dp)
            )
    ) {
        content()
    }
}

@Composable
private fun ShimmerCard() {
    val shimmerTransition = rememberInfiniteTransition()
    val shimmerTranslate by shimmerTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1000f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1200, easing = androidx.compose.animation.core.LinearEasing),
            repeatMode = RepeatMode.Restart
        )
    )
    val shimmerBrush = Brush.linearGradient(
        colors = listOf(
            Color.Gray.copy(alpha = 0.15f),
            Color.Gray.copy(alpha = 0.35f),
            Color.Gray.copy(alpha = 0.15f)
        ),
        start = Offset(shimmerTranslate - 200f, 0f),
        end = Offset(shimmerTranslate, 0f)
    )

    Card(
        elevation = 0.dp,
        shape = RoundedCornerShape(16.dp),
        backgroundColor = MaterialTheme.colors.surface.copy(alpha = 0.5f),
        modifier = Modifier
            .fillMaxWidth()
            .border(
                width = 1.dp,
                color = Color.White.copy(alpha = 0.1f),
                shape = RoundedCornerShape(16.dp)
            )
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.6f)
                    .height(16.dp)
                    .background(shimmerBrush, RoundedCornerShape(4.dp))
            )
            Spacer(modifier = Modifier.height(8.dp))
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.3f)
                    .height(12.dp)
                    .background(shimmerBrush, RoundedCornerShape(4.dp))
            )
            Spacer(modifier = Modifier.height(8.dp))
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.9f)
                    .height(12.dp)
                    .background(shimmerBrush, RoundedCornerShape(4.dp))
            )
        }
    }
}
