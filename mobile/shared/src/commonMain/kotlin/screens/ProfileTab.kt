package screens

import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.runtime.*
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.rememberVectorPainter
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.tab.Tab
import cafe.adriel.voyager.navigator.tab.TabOptions
import localization.AppLanguage
import localization.LocalLocalization
import LocalThemeIsDark
import DeepTeal

object ProfileTab : Tab {
    override val options: TabOptions
        @Composable
        get() {
            val title = LocalLocalization.current.strings.profileTabTitle
            val icon = rememberVectorPainter(Icons.Default.Person)
            return remember(title) {
                TabOptions(
                    index = 2u,
                    title = title,
                    icon = icon
                )
            }
        }

    @Composable
    override fun Content() {
        val localization = LocalLocalization.current
        val navigator = LocalNavigator.current
        var isDarkTheme by LocalThemeIsDark.current
        var username by remember { mutableStateOf("John Doe") }
        var isEditing by remember { mutableStateOf(false) }

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
                        text = localization.strings.profileAndSettings,
                        style = MaterialTheme.typography.h6,
                        color = Color.White
                    )
                }
            }
        ) { paddingValues ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Profile Details Section — Glassmorphism Card
                Card(
                    elevation = 0.dp,
                    shape = RoundedCornerShape(16.dp),
                    backgroundColor = MaterialTheme.colors.surface.copy(alpha = 0.7f),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(
                            width = 1.dp,
                            color = Color.White.copy(alpha = 0.2f),
                            shape = RoundedCornerShape(16.dp)
                        )
                        .animateContentSize(animationSpec = tween(300))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(localization.strings.profileDetails, style = MaterialTheme.typography.h6)
                        Spacer(modifier = Modifier.height(12.dp))

                        if (isEditing) {
                            OutlinedTextField(
                                value = username,
                                onValueChange = { username = it },
                                label = { Text(localization.strings.nameLabel) },
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Button(
                                onClick = { isEditing = false },
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(
                                    backgroundColor = DeepTeal,
                                    contentColor = Color.White
                                )
                            ) {
                                Text(localization.strings.save)
                            }
                        } else {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    localization.strings.nameFormat(username),
                                    style = MaterialTheme.typography.body1
                                )
                                TextButton(onClick = { isEditing = true }) {
                                    Text(
                                        localization.strings.edit,
                                        color = DeepTeal
                                    )
                                }
                            }
                        }
                    }
                }

                // Settings Section — Glassmorphism Card
                Card(
                    elevation = 0.dp,
                    shape = RoundedCornerShape(16.dp),
                    backgroundColor = MaterialTheme.colors.surface.copy(alpha = 0.7f),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(
                            width = 1.dp,
                            color = Color.White.copy(alpha = 0.2f),
                            shape = RoundedCornerShape(16.dp)
                        )
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(localization.strings.settings, style = MaterialTheme.typography.h6)
                        Spacer(modifier = Modifier.height(12.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(localization.strings.darkTheme, style = MaterialTheme.typography.body1)
                            Switch(
                                checked = isDarkTheme,
                                onCheckedChange = { isDarkTheme = it },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = DeepTeal,
                                    checkedTrackColor = DeepTeal.copy(alpha = 0.5f)
                                )
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(localization.strings.languageLabel, style = MaterialTheme.typography.body1)

                            var expanded by remember { mutableStateOf(false) }
                            Box {
                                TextButton(onClick = { expanded = true }) {
                                    Text(
                                        localization.currentLanguage.value.name,
                                        color = DeepTeal
                                    )
                                }
                                DropdownMenu(
                                    expanded = expanded,
                                    onDismissRequest = { expanded = false }
                                ) {
                                    AppLanguage.values().forEach { lang ->
                                        DropdownMenuItem(onClick = {
                                            localization.setLanguage(lang)
                                            expanded = false
                                        }) {
                                            Text(lang.name)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // Account & Session Section — Glassmorphism Card
                Card(
                    elevation = 0.dp,
                    shape = RoundedCornerShape(16.dp),
                    backgroundColor = MaterialTheme.colors.surface.copy(alpha = 0.7f),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(
                            width = 1.dp,
                            color = Color.White.copy(alpha = 0.2f),
                            shape = RoundedCornerShape(16.dp)
                        )
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Account & Session", style = MaterialTheme.typography.h6)
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(
                            onClick = {
                                navigator?.replaceAll(LoginScreen())
                            },
                            modifier = Modifier.fillMaxWidth().height(48.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                backgroundColor = Color(0xFFDC2626),
                                contentColor = Color.White
                            )
                        ) {
                            Text("Logout / Switch Account", color = Color.White)
                        }
                    }
                }
            }
        }
    }
}

