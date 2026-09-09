package screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.LocalNavigator
import DeepTeal
import WarmAmber

class LoginScreen : Screen {
    @Composable
    override fun Content() {
        val navigator = LocalNavigator.current

        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color(0xFFF0FDFA),
                            Color(0xFFCCFBF1)
                        )
                    )
                )
                .padding(16.dp)
        ) {
            Card(
                elevation = 0.dp,
                shape = RoundedCornerShape(24.dp),
                backgroundColor = Color.White.copy(alpha = 0.85f),
                modifier = Modifier
                    .fillMaxWidth(0.9f)
                    .border(
                        width = 1.dp,
                        color = Color.White.copy(alpha = 0.4f),
                        shape = RoundedCornerShape(24.dp)
                    )
            ) {
                Column(
                    modifier = Modifier.padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(
                        localization.LocalLocalization.current.strings.appTitle,
                        style = MaterialTheme.typography.h4,
                        color = DeepTeal
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        localization.LocalLocalization.current.strings.mobileFieldApplication,
                        style = MaterialTheme.typography.subtitle1,
                        color = WarmAmber
                    )
                    Spacer(modifier = Modifier.height(48.dp))
                    Button(
                        onClick = { navigator?.push(MainScreen()) },
                        modifier = Modifier.fillMaxWidth().height(56.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(
                            backgroundColor = DeepTeal,
                            contentColor = Color.White
                        )
                    ) {
                        Text(
                            localization.LocalLocalization.current.strings.loginAsCitizen,
                            style = MaterialTheme.typography.h6,
                            color = Color.White
                        )
                    }
                    Spacer(modifier = Modifier.height(24.dp))
                    Button(
                        onClick = { navigator?.push(SarpanchVerifyScreen()) },
                        modifier = Modifier.fillMaxWidth().height(56.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(
                            backgroundColor = WarmAmber,
                            contentColor = Color(0xFF1E293B)
                        )
                    ) {
                        Text(
                            localization.LocalLocalization.current.strings.loginAsSarpanch,
                            style = MaterialTheme.typography.h6,
                            color = Color(0xFF1E293B)
                        )
                    }
                    Spacer(modifier = Modifier.height(24.dp))
                    Button(
                        onClick = { navigator?.push(GovDashboardScreen()) },
                        modifier = Modifier.fillMaxWidth().height(56.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(
                            backgroundColor = Color(0xFF1E293B),
                            contentColor = Color.White
                        )
                    ) {
                        Text(
                            localization.LocalLocalization.current.strings.loginAsGov,
                            style = MaterialTheme.typography.h6,
                            color = Color.White
                        )
                    }
                }
            }
        }
    }
}
