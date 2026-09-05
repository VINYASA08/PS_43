package screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun CitizenSubmitScreen(onBack: () -> Unit) {
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var isSubmitting by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Report Local Issue") },
                navigationIcon = {
                    Button(onClick = onBack) { Text("Back") }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp).fillMaxSize()) {
            Text("Capture Evidence (Photo/Audio/Video)", style = MaterialTheme.typography.h6)
            Spacer(modifier = Modifier.height(8.dp))
            Button(onClick = { /* Launch Device Camera/Mic Intents */ }, modifier = Modifier.fillMaxWidth()) {
                Text("📷 Open Camera / Record Audio")
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            OutlinedTextField(
                value = title,
                onValueChange = { title = it },
                label = { Text("Problem Title") },
                modifier = Modifier.fillMaxWidth()
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(
                value = description,
                onValueChange = { description = it },
                label = { Text("Detailed Description") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 4
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            Button(
                onClick = { 
                    isSubmitting = true
                    // Call /api/mobile/challenges POST
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = !isSubmitting
            ) {
                Text(if (isSubmitting) "Submitting securely..." else "Submit to Sarpanch")
            }
        }
    }
}
