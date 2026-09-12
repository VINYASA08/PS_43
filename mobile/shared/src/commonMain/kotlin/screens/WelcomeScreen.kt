package screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.LocalNavigator
import kotlinx.coroutines.delay
import WarmAmber

class WelcomeScreen : Screen {
    @Composable
    override fun Content() {
        val navigator = LocalNavigator.current
        val localization = localization.LocalLocalization.current

        // Staggered animation states
        var showTitle by remember { mutableStateOf(false) }
        var showDescription by remember { mutableStateOf(false) }
        var showButton by remember { mutableStateOf(false) }

        LaunchedEffect(Unit) {
            delay(200)
            showTitle = true
            delay(200)
            showDescription = true
            delay(200)
            showButton = true
        }

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color(0xFF0D9488),
                            Color(0xFF065F46)
                        )
                    )
                )
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                AnimatedVisibility(
                    visible = showTitle,
                    enter = fadeIn(animationSpec = tween(600)) + slideInVertically(
                        animationSpec = tween(600),
                        initialOffsetY = { it / 4 }
                    )
                ) {
                    Text(
                        text = localization.strings.welcomeTitle,
                        style = MaterialTheme.typography.h4,
                        color = Color.White,
                        textAlign = TextAlign.Center
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                AnimatedVisibility(
                    visible = showDescription,
                    enter = fadeIn(animationSpec = tween(600)) + slideInVertically(
                        animationSpec = tween(600),
                        initialOffsetY = { it / 4 }
                    )
                ) {
                    Text(
                        text = localization.strings.welcomeDescription,
                        style = MaterialTheme.typography.body1,
                        textAlign = TextAlign.Center,
                        color = Color.White.copy(alpha = 0.9f)
                    )
                }

                Spacer(modifier = Modifier.height(48.dp))

                AnimatedVisibility(
                    visible = showButton,
                    enter = fadeIn(animationSpec = tween(600)) + slideInVertically(
                        animationSpec = tween(600),
                        initialOffsetY = { it / 2 }
                    )
                ) {
                    Button(
                        onClick = { navigator?.push(LoginScreen()) },
                        modifier = Modifier
                            .fillMaxWidth(0.8f)
                            .height(56.dp)
                            .shadow(8.dp, RoundedCornerShape(24.dp)),
                        shape = RoundedCornerShape(24.dp),
                        colors = ButtonDefaults.buttonColors(
                            backgroundColor = WarmAmber,
                            contentColor = Color(0xFF1E293B)
                        )
                    ) {
                        Text(
                            localization.strings.getStarted,
                            style = MaterialTheme.typography.button
                        )
                    }
                }
            }
        }
    }
}
