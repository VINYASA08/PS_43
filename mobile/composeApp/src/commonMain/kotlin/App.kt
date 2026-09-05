package com.jharkhand.sih26043

import androidx.compose.material.MaterialTheme
import androidx.compose.runtime.Composable
import screens.CitizenSubmitScreen
import screens.SarpanchVerifyScreen
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember

@Composable
fun App() {
    MaterialTheme {
        // Simple Navigation State for Demo
        val currentScreen = remember { mutableStateOf("login") }

        when (currentScreen.value) {
            "login" -> {
                // Mock Login Selection
                LoginScreen(
                    onCitizenLogin = { currentScreen.value = "citizen" },
                    onSarpanchLogin = { currentScreen.value = "sarpanch" }
                )
            }
            "citizen" -> CitizenSubmitScreen(onBack = { currentScreen.value = "login" })
            "sarpanch" -> SarpanchVerifyScreen(onBack = { currentScreen.value = "login" })
        }
    }
}
