package screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.LocalNavigator

class LoginScreen : Screen {
    @Composable
    override fun Content() {
        val navigator = LocalNavigator.current
        
        Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize().padding(16.dp)) {
            Card(
                elevation = 8.dp,
                modifier = Modifier.fillMaxWidth(0.9f)
            ) {
                Column(
                    modifier = Modifier.padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text("Jharkhand Smart Study", style = MaterialTheme.typography.h4, color = MaterialTheme.colors.primary)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Mobile Field Application", style = MaterialTheme.typography.subtitle1, color = MaterialTheme.colors.secondary)
                    Spacer(modifier = Modifier.height(48.dp))
                    Button(
                        onClick = { navigator?.push(CitizenSubmitScreen()) },
                        modifier = Modifier.fillMaxWidth().height(56.dp),
                        colors = ButtonDefaults.buttonColors(backgroundColor = MaterialTheme.colors.primary)
                    ) {
                        Text("Login as Citizen", style = MaterialTheme.typography.h6, color = MaterialTheme.colors.onPrimary)
                    }
                    Spacer(modifier = Modifier.height(24.dp))
                    Button(
                        onClick = { navigator?.push(SarpanchVerifyScreen()) },
                        modifier = Modifier.fillMaxWidth().height(56.dp),
                        colors = ButtonDefaults.buttonColors(backgroundColor = MaterialTheme.colors.secondary)
                    ) {
                        Text("Login as Local Sarpanch", style = MaterialTheme.typography.h6, color = MaterialTheme.colors.onSecondary)
                    }
                }
            }
        }
    }
}
