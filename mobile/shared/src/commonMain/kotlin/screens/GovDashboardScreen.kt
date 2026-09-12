package screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.Alignment
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.LocalNavigator
import network.ApiClient
import network.Challenge
import network.PendingUser
import network.AuditLog
import network.AnalyticsSummary
import org.koin.compose.koinInject
import kotlinx.coroutines.launch

class GovDashboardScreen : Screen {
    @Composable
    override fun Content() {
        val navigator = LocalNavigator.current
        val apiClient = koinInject<ApiClient>()
        val scope = rememberCoroutineScope()
        
        var summary by remember { mutableStateOf(AnalyticsSummary()) }
        var challenges by remember { mutableStateOf<List<Challenge>>(emptyList()) }
        var pendingUsers by remember { mutableStateOf<List<PendingUser>>(emptyList()) }
        var auditLogs by remember { mutableStateOf<List<AuditLog>>(emptyList()) }
        var isLoading by remember { mutableStateOf(true) }
        var errorMsg by remember { mutableStateOf<String?>(null) }

        LaunchedEffect(Unit) {
            scope.launch {
                try {
                    val analytics = apiClient.getAnalytics()
                    val challengesRes = apiClient.getChallenges()
                    val pendingUsersRes = apiClient.getPendingUsers()
                    val auditLogsRes = apiClient.getAuditLogs()

                    summary = analytics.summary
                    challenges = challengesRes.challenges
                    pendingUsers = pendingUsersRes.pendingUsers
                    auditLogs = auditLogsRes.logs
                } catch (e: Exception) {
                    errorMsg = "Failed to load data: ${e.message}"
                } finally {
                    isLoading = false
                }
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
                        title = { Text("Government Oversight Dashboard", color = Color.White) },
                        navigationIcon = {
                            TextButton(onClick = { navigator?.pop() }) { Text("Back", color = Color.White) }
                        },
                        backgroundColor = Color.Transparent,
                        elevation = 0.dp
                    )
                }
            }
        ) { paddingValues ->
            if (isLoading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = MaterialTheme.colors.primary)
                }
            } else if (errorMsg != null) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(errorMsg!!, color = MaterialTheme.colors.error)
                }
            } else {
                LazyColumn(modifier = Modifier.fillMaxSize().padding(paddingValues).padding(16.dp)) {
                    item {
                        Text("State Administrative Console", style = MaterialTheme.typography.h6, color = MaterialTheme.colors.primary)
                        Spacer(modifier = Modifier.height(16.dp))
                    }
                    
                    item {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            StatCard("Total Reported", summary.totalSubmissions.toString(), Modifier.weight(1f))
                            Spacer(Modifier.width(8.dp))
                            StatCard("Resolved", summary.problemsResolved.toString(), Modifier.weight(1f))
                            Spacer(Modifier.width(8.dp))
                            StatCard("Active Prototypes", summary.activePrototypes.toString(), Modifier.weight(1f))
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                    }

                    item {
                        Text("Pending Corporate Approvals", style = MaterialTheme.typography.subtitle1, color = MaterialTheme.colors.secondary)
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                    items(pendingUsers) { user ->
                        GlassCard {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(user.name, style = MaterialTheme.typography.subtitle2)
                                Text("${user.organization ?: "Unknown"} • ${user.email}", style = MaterialTheme.typography.body2)
                            }
                        }
                    }
                    item { Spacer(modifier = Modifier.height(16.dp)) }

                    item {
                        Text("Recent Audit Trail", style = MaterialTheme.typography.subtitle1, color = MaterialTheme.colors.secondary)
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                    items(auditLogs.take(5)) { log ->
                        GlassCard {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(log.action, style = MaterialTheme.typography.subtitle2)
                                Text("${log.resource} by ${log.user?.name ?: "System"} at ${log.createdAt}", style = MaterialTheme.typography.caption)
                            }
                        }
                    }
                    item { Spacer(modifier = Modifier.height(16.dp)) }

                    item {
                        Text("State Challenge Ledger", style = MaterialTheme.typography.subtitle1, color = MaterialTheme.colors.secondary)
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                    items(challenges) { challenge ->
                        GlassCard {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                                    Text(challenge.title, style = MaterialTheme.typography.subtitle2, modifier = Modifier.weight(1f))
                                    Text(challenge.status, style = MaterialTheme.typography.caption, color = MaterialTheme.colors.primary)
                                }
                                Text("${challenge.domain} • ${challenge.urgency} • ${challenge.district}", style = MaterialTheme.typography.body2)
                            }
                        }
                    }
                }
            }
        }
    }

    @Composable
    fun GlassCard(modifier: Modifier = Modifier, content: @Composable () -> Unit) {
        Card(
            modifier = modifier
                .fillMaxWidth()
                .padding(vertical = 4.dp)
                .border(1.dp, Color.White.copy(alpha = 0.2f), RoundedCornerShape(16.dp)),
            shape = RoundedCornerShape(16.dp),
            backgroundColor = MaterialTheme.colors.surface.copy(alpha = 0.7f),
            elevation = 0.dp
        ) {
            content()
        }
    }

    @Composable
    fun StatCard(label: String, value: String, modifier: Modifier = Modifier) {
        Card(
            modifier = modifier
                .border(1.dp, Color.White.copy(alpha = 0.2f), RoundedCornerShape(12.dp)),
            shape = RoundedCornerShape(12.dp),
            backgroundColor = MaterialTheme.colors.surface.copy(alpha = 0.7f),
            elevation = 0.dp
        ) {
            Column(modifier = Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text(label, style = MaterialTheme.typography.caption)
                Text(value, style = MaterialTheme.typography.h6, color = MaterialTheme.colors.primary)
            }
        }
    }
}
