package screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
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
                TopAppBar(
                    title = { Text("Government Oversight Dashboard") },
                    navigationIcon = {
                        Button(onClick = { navigator?.pop() }) { Text("Back") }
                    },
                    backgroundColor = MaterialTheme.colors.surface
                )
            }
        ) { paddingValues ->
            if (isLoading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            } else if (errorMsg != null) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(errorMsg!!, color = Color.Red)
                }
            } else {
                LazyColumn(modifier = Modifier.fillMaxSize().padding(paddingValues).padding(16.dp)) {
                    item {
                        Text("State Administrative Console", style = MaterialTheme.typography.h6)
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
                        Text("Pending Corporate Approvals", style = MaterialTheme.typography.subtitle1)
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                    items(pendingUsers) { user ->
                        Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp), elevation = 4.dp) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(user.name, style = MaterialTheme.typography.subtitle2)
                                Text("${user.organization ?: "Unknown"} • ${user.email}", style = MaterialTheme.typography.body2)
                            }
                        }
                    }
                    item { Spacer(modifier = Modifier.height(16.dp)) }

                    item {
                        Text("Recent Audit Trail", style = MaterialTheme.typography.subtitle1)
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                    items(auditLogs.take(5)) { log ->
                        Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp), elevation = 4.dp) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(log.action, style = MaterialTheme.typography.subtitle2)
                                Text("${log.resource} by ${log.user?.name ?: "System"} at ${log.createdAt}", style = MaterialTheme.typography.caption)
                            }
                        }
                    }
                    item { Spacer(modifier = Modifier.height(16.dp)) }

                    item {
                        Text("State Challenge Ledger", style = MaterialTheme.typography.subtitle1)
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                    items(challenges) { challenge ->
                        Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp), elevation = 4.dp) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                                    Text(challenge.title, style = MaterialTheme.typography.subtitle2, modifier = Modifier.weight(1f))
                                    Text(challenge.status, style = MaterialTheme.typography.caption, color = Color.Blue)
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
    fun StatCard(label: String, value: String, modifier: Modifier = Modifier) {
        Card(modifier = modifier, elevation = 4.dp) {
            Column(modifier = Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text(label, style = MaterialTheme.typography.caption)
                Text(value, style = MaterialTheme.typography.h6)
            }
        }
    }
}
