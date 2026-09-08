package screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.LocalNavigator
import localization.LocalLocalization
import network.ApiClient
import org.koin.compose.koinInject
import kotlinx.coroutines.launch

class SarpanchVerifyScreen : Screen {
    @Composable
    override fun Content() {
        val navigator = LocalNavigator.current
        val strings = LocalLocalization.current.strings
        val coroutineScope = rememberCoroutineScope()
        val apiClient = koinInject<ApiClient>()
        
        var isLoading by remember { mutableStateOf(false) }

        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text(strings.sarpanchVerification) },
                    navigationIcon = {
                        Button(onClick = { navigator?.pop() }, modifier = Modifier.padding(8.dp)) { Text(strings.back) }
                    },
                    elevation = 4.dp
                )
            }
        ) { padding ->
            Column(modifier = Modifier.padding(padding).fillMaxSize()) {
                Text(
                    text = strings.pendingIssues,
                    style = MaterialTheme.typography.h6,
                    modifier = Modifier.padding(16.dp)
                )
                
                LazyColumn(modifier = Modifier.fillMaxWidth().weight(1f)) {
                    items(3) { index ->
                        Card(
                            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                            elevation = 4.dp
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text("Issue #$index: Road Damage", style = MaterialTheme.typography.subtitle1)
                                Text("Submitted 2 hours ago by Citizen", style = MaterialTheme.typography.caption)
                                Spacer(modifier = Modifier.height(16.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    OutlinedButton(onClick = { /* Mark duplicate */ }) {
                                        Text(strings.markDuplicate)
                                    }
                                    Button(onClick = {
                                        isLoading = true
                                        coroutineScope.launch {
                                            kotlinx.coroutines.delay(1000)
                                            isLoading = false
                                        }
                                    }) {
                                        Text(if(isLoading) "..." else strings.verifyAndRoute)
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
