package screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun SarpanchVerifyScreen(onBack: () -> Unit) {
    var isVerifying by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Sarpanch Verification Node") },
                navigationIcon = {
                    Button(onClick = onBack) { Text("Back") }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp).fillMaxSize()) {
            Text("Pending Issues in Your Panchayat", style = MaterialTheme.typography.h6)
            Spacer(modifier = Modifier.height(16.dp))
            
            // Mock Issue Card
            Card(elevation = 4.dp, modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Contaminated Well Water", style = MaterialTheme.typography.subtitle1)
                    Text("Submitted 2 hours ago by +918XXXXXX", style = MaterialTheme.typography.caption)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Villager attached 1 photo and 1 audio note.")
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                        OutlinedButton(onClick = { /* Mark as Duplicate */ }) {
                            Text("Mark Duplicate")
                        }
                        Button(
                            onClick = { 
                                isVerifying = true
                                // Call /api/mobile/verify POST
                            },
                            enabled = !isVerifying
                        ) {
                            Text("Verify & Route to AI")
                        }
                    }
                }
            }
        }
    }
}
