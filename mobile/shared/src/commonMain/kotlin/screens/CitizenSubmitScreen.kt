package screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
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

class CitizenSubmitScreen : Screen {
    @Composable
    override fun Content() {
        val navigator = LocalNavigator.current
        val strings = LocalLocalization.current.strings
        val coroutineScope = rememberCoroutineScope()
        
        // Use the Ktor client via Koin
        val apiClient = koinInject<ApiClient>()
        
        var title by remember { mutableStateOf("") }
        var description by remember { mutableStateOf("") }
        var isSubmitting by remember { mutableStateOf(false) }

        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text(strings.reportLocalIssue) },
                    navigationIcon = {
                        Button(onClick = { navigator?.pop() }, modifier = Modifier.padding(8.dp)) { Text(strings.back) }
                    },
                    elevation = 4.dp
                )
            }
        ) { padding ->
            Column(modifier = Modifier.padding(padding).padding(16.dp).fillMaxSize()) {
                Card(
                    elevation = 8.dp,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(strings.captureEvidence, style = MaterialTheme.typography.h6, color = MaterialTheme.colors.primary)
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(
                            onClick = { /* Launch Device Camera/Mic Intents */ }, 
                            modifier = Modifier.fillMaxWidth().height(48.dp),
                            colors = ButtonDefaults.buttonColors(backgroundColor = MaterialTheme.colors.secondary)
                        ) {
                            Text(strings.openCameraAudio, color = MaterialTheme.colors.onSecondary)
                        }
                    }
                }
                
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text(strings.problemTitle) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text(strings.detailedDescription) },
                    modifier = Modifier.fillMaxWidth().weight(1f),
                    minLines = 4
                )
                
                Spacer(modifier = Modifier.height(24.dp))
                Button(
                    onClick = { 
                        isSubmitting = true
                        coroutineScope.launch {
                            try {
                                // Simulate API call to Next.js using Ktor
                                // apiClient.submitIssue(...)
                                kotlinx.coroutines.delay(1000)
                            } finally {
                                isSubmitting = false
                                navigator?.pop()
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(56.dp),
                    enabled = !isSubmitting && title.isNotBlank(),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        if (isSubmitting) strings.submittingSecurely else strings.submitToSarpanch,
                        style = MaterialTheme.typography.h6
                    )
                }
            }
        }
    }
}
