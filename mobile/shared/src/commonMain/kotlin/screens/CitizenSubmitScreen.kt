package screens

import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.tab.LocalTabNavigator
import localization.LocalLocalization
import network.ApiClient
import network.MobileChallengeSubmission
import network.MobileSubmissionResponse
import org.koin.compose.koinInject
import kotlinx.coroutines.launch
import DeepTeal
import WarmAmber

class CitizenSubmitScreen : Screen {

    companion object {
        val JHARKHAND_DISTRICTS = listOf(
            "Bokaro",
            "Chatra",
            "Deoghar",
            "Dhanbad",
            "Dumka",
            "East Singhbhum",
            "Garhwa",
            "Giridih",
            "Godda",
            "Gumla",
            "Hazaribagh",
            "Jamtara",
            "Khunti",
            "Koderma",
            "Latehar",
            "Lohardaga",
            "Pakur",
            "Palamu",
            "Ramgarh",
            "Ranchi",
            "Sahebganj",
            "Saraikela Kharsawan",
            "Simdega",
            "West Singhbhum"
        )

        val SOCIETAL_DOMAINS = listOf(
            "Water Management",
            "Agriculture",
            "Healthcare",
            "Urban Infrastructure",
            "Rural Livelihoods",
            "Public Service Delivery",
            "Education",
            "Environment",
            "Energy",
            "Sanitation"
        )

        const val MOCK_GPS_LOCATION = "23.3441° N, 85.3096° E, Ranchi Urban Block"
        const val MOCK_EVIDENCE_URL = "https://storage.jharkhand.gov.in/evidence/photo_2026_gumla_bridge.jpg"
        const val MOCK_EVIDENCE_NAME = "photo_2026_gumla_bridge.jpg"
    }

    @Composable
    override fun Content() {
        val navigator = LocalNavigator.current
        val tabNavigator = LocalTabNavigator.current
        val strings = LocalLocalization.current.strings
        val coroutineScope = rememberCoroutineScope()

        // Ktor API Client injected via Koin
        val apiClient = koinInject<ApiClient>()

        // Form states
        var title by remember { mutableStateOf("") }
        var description by remember { mutableStateOf("") }
        var district by remember { mutableStateOf("") }
        var domain by remember { mutableStateOf("") }
        var location by remember { mutableStateOf("") }
        var evidenceUrl by remember { mutableStateOf("") }
        var evidenceName by remember { mutableStateOf("") }

        // Dropdown expansion states
        var districtExpanded by remember { mutableStateOf(false) }
        var domainExpanded by remember { mutableStateOf(false) }

        // Submission & Feedback dialog states
        var isSubmitting by remember { mutableStateOf(false) }
        var showSuccessDialog by remember { mutableStateOf(false) }
        var showErrorDialog by remember { mutableStateOf(false) }
        var submissionResponse by remember { mutableStateOf<MobileSubmissionResponse?>(null) }
        var errorMessage by remember { mutableStateOf<String?>(null) }

        // Form validation
        val isTitleValid = title.trim().length >= 5
        val isDescValid = description.trim().length >= 10
        val isDistrictValid = district.isNotBlank()
        val isLocationValid = location.isNotBlank()
        val isFormValid = isTitleValid && isDescValid && isDistrictValid && isLocationValid

        val scrollState = rememberScrollState()

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
                        .padding(horizontal = 4.dp, vertical = 4.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        TextButton(
                            onClick = {
                                if (navigator?.canPop == true) {
                                    navigator.pop()
                                } else {
                                    tabNavigator.current = HomeTab
                                }
                            }
                        ) {
                            Text(
                                strings.back,
                                color = Color.White
                            )
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = strings.reportLocalIssue,
                            style = MaterialTheme.typography.h6,
                            color = Color.White
                        )
                    }
                }
            }
        ) { padding ->
            Column(
                modifier = Modifier
                    .padding(padding)
                    .fillMaxSize()
                    .verticalScroll(scrollState)
                    .padding(16.dp)
            ) {
                // Header card explaining citizen portal role — Glassmorphism
                Card(
                    elevation = 0.dp,
                    shape = RoundedCornerShape(16.dp),
                    backgroundColor = DeepTeal.copy(alpha = 0.08f),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp)
                        .border(
                            width = 1.dp,
                            color = Color.White.copy(alpha = 0.2f),
                            shape = RoundedCornerShape(16.dp)
                        )
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            text = "Jharkhand Societal Innovation Portal",
                            style = MaterialTheme.typography.subtitle1.copy(fontWeight = FontWeight.Bold),
                            color = DeepTeal
                        )
                        Text(
                            text = "Submit local civic challenges or innovation problems directly for AI triage and government routing.",
                            style = MaterialTheme.typography.caption,
                            color = MaterialTheme.colors.onSurface.copy(alpha = 0.7f)
                        )
                    }
                }

                // 1. Title Input with Character Counter
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("${strings.problemTitle} *") },
                    placeholder = { Text("e.g., Collapsed culvert disrupting rural access") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    isError = title.isNotBlank() && !isTitleValid,
                    shape = RoundedCornerShape(12.dp)
                )
                Row(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 4.dp, vertical = 2.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    if (title.isNotBlank() && !isTitleValid) {
                        Text("Min 5 characters required", style = MaterialTheme.typography.caption, color = MaterialTheme.colors.error)
                    } else {
                        Spacer(modifier = Modifier.width(1.dp))
                    }
                    Text("${title.length}/100", style = MaterialTheme.typography.caption, color = Color.Gray)
                }

                Spacer(modifier = Modifier.height(8.dp))

                // 2. Description Input (Multi-line, minLines = 3) with Character Counter
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("${strings.detailedDescription} *") },
                    placeholder = { Text("Describe the community issue, impacted population, and background details...") },
                    modifier = Modifier.fillMaxWidth().heightIn(min = 100.dp),
                    minLines = 3,
                    isError = description.isNotBlank() && !isDescValid,
                    shape = RoundedCornerShape(12.dp)
                )
                Row(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 4.dp, vertical = 2.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    if (description.isNotBlank() && !isDescValid) {
                        Text("Min 10 characters required", style = MaterialTheme.typography.caption, color = MaterialTheme.colors.error)
                    } else {
                        Spacer(modifier = Modifier.width(1.dp))
                    }
                    Text("${description.length} characters", style = MaterialTheme.typography.caption, color = Color.Gray)
                }

                Spacer(modifier = Modifier.height(12.dp))

                // 3. District Dropdown Picker (Jharkhand Districts)
                Box(modifier = Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = district,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("District *") },
                        placeholder = { Text("Select Jharkhand District") },
                        trailingIcon = {
                            IconButton(onClick = { districtExpanded = !districtExpanded }) {
                                Text(if (districtExpanded) "▲" else "▼")
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        isError = district.isBlank() && (title.isNotBlank() || description.isNotBlank()),
                        shape = RoundedCornerShape(12.dp)
                    )
                    Box(
                        modifier = Modifier
                            .matchParentSize()
                            .clickable { districtExpanded = true }
                    )
                    DropdownMenu(
                        expanded = districtExpanded,
                        onDismissRequest = { districtExpanded = false },
                        modifier = Modifier.fillMaxWidth(0.9f).heightIn(max = 280.dp)
                    ) {
                        JHARKHAND_DISTRICTS.forEach { d ->
                            DropdownMenuItem(onClick = {
                                district = d
                                districtExpanded = false
                            }) {
                                Text(d)
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // 4. Domain Dropdown Picker (Societal Domains)
                Box(modifier = Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = domain,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Societal Domain") },
                        placeholder = { Text("Select Societal Domain (e.g. Water Management)") },
                        trailingIcon = {
                            IconButton(onClick = { domainExpanded = !domainExpanded }) {
                                Text(if (domainExpanded) "▲" else "▼")
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )
                    Box(
                        modifier = Modifier
                            .matchParentSize()
                            .clickable { domainExpanded = true }
                    )
                    DropdownMenu(
                        expanded = domainExpanded,
                        onDismissRequest = { domainExpanded = false },
                        modifier = Modifier.fillMaxWidth(0.9f).heightIn(max = 280.dp)
                    ) {
                        SOCIETAL_DOMAINS.forEach { dom ->
                            DropdownMenuItem(onClick = {
                                domain = dom
                                domainExpanded = false
                            }) {
                                Text(dom)
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // 5. Simulated Mock Data Injection: Location — Glassmorphism card
                Card(
                    elevation = 0.dp,
                    shape = RoundedCornerShape(16.dp),
                    backgroundColor = MaterialTheme.colors.surface.copy(alpha = 0.7f),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp)
                        .border(
                            width = 1.dp,
                            color = Color.White.copy(alpha = 0.2f),
                            shape = RoundedCornerShape(16.dp)
                        )
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            text = "Geotagging & Location *",
                            style = MaterialTheme.typography.subtitle2.copy(fontWeight = FontWeight.Bold),
                            color = DeepTeal
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(
                            onClick = {
                                location = MOCK_GPS_LOCATION
                            },
                            modifier = Modifier.fillMaxWidth().height(48.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                backgroundColor = if (location.isNotBlank()) WarmAmber.copy(alpha = 0.12f) else WarmAmber,
                                contentColor = if (location.isNotBlank()) WarmAmber else Color(0xFF1E293B)
                            )
                        ) {
                            Text("📍 Get Current Location", fontWeight = FontWeight.SemiBold)
                        }

                        if (location.isNotBlank()) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Card(
                                backgroundColor = Color(0xFFE8F5E9),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(8.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            "✓ Location Captured",
                                            style = MaterialTheme.typography.caption.copy(fontWeight = FontWeight.Bold),
                                            color = Color(0xFF2E7D32)
                                        )
                                        Text(
                                            location,
                                            style = MaterialTheme.typography.body2,
                                            color = Color(0xFF1B5E20)
                                        )
                                    }
                                    IconButton(
                                        onClick = { location = "" },
                                        modifier = Modifier.size(24.dp)
                                    ) {
                                        Text("✕", fontSize = 12.sp, color = Color(0xFF2E7D32))
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // 6. Simulated Mock Data Injection: Evidence Photos/Videos — Glassmorphism card
                Card(
                    elevation = 0.dp,
                    shape = RoundedCornerShape(16.dp),
                    backgroundColor = MaterialTheme.colors.surface.copy(alpha = 0.7f),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp)
                        .border(
                            width = 1.dp,
                            color = Color.White.copy(alpha = 0.2f),
                            shape = RoundedCornerShape(16.dp)
                        )
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            text = "Evidence & Media Attachment",
                            style = MaterialTheme.typography.subtitle2.copy(fontWeight = FontWeight.Bold),
                            color = WarmAmber
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(
                            onClick = {
                                evidenceUrl = MOCK_EVIDENCE_URL
                                evidenceName = MOCK_EVIDENCE_NAME
                            },
                            modifier = Modifier.fillMaxWidth().height(48.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                backgroundColor = if (evidenceUrl.isNotBlank()) WarmAmber.copy(alpha = 0.12f) else WarmAmber,
                                contentColor = if (evidenceUrl.isNotBlank()) WarmAmber else Color(0xFF1E293B)
                            )
                        ) {
                            Text("📷 Attach Photos / Videos", fontWeight = FontWeight.SemiBold)
                        }

                        if (evidenceUrl.isNotBlank()) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Card(
                                backgroundColor = Color(0xFFE3F2FD),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(8.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            "✓ Evidence Attached: $evidenceName",
                                            style = MaterialTheme.typography.caption.copy(fontWeight = FontWeight.Bold),
                                            color = Color(0xFF1565C0)
                                        )
                                        Text(
                                            evidenceUrl,
                                            style = MaterialTheme.typography.caption,
                                            color = Color(0xFF0D47A1)
                                        )
                                    }
                                    IconButton(
                                        onClick = {
                                            evidenceUrl = ""
                                            evidenceName = ""
                                        },
                                        modifier = Modifier.size(24.dp)
                                    ) {
                                        Text("✕", fontSize = 12.sp, color = Color(0xFF1565C0))
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Validation Status Info — with animateContentSize
                if (!isFormValid) {
                    Card(
                        backgroundColor = Color(0xFFFFF8E1),
                        shape = RoundedCornerShape(16.dp),
                        elevation = 0.dp,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 8.dp)
                            .border(
                                width = 1.dp,
                                color = WarmAmber.copy(alpha = 0.3f),
                                shape = RoundedCornerShape(16.dp)
                            )
                            .animateContentSize(animationSpec = tween(300))
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(
                                "Submission Requirements:",
                                style = MaterialTheme.typography.caption.copy(fontWeight = FontWeight.Bold),
                                color = Color(0xFF8D6E63)
                            )
                            if (!isTitleValid) Text("• Problem title must be at least 5 characters", style = MaterialTheme.typography.caption, color = Color(0xFF8D6E63))
                            if (!isDescValid) Text("• Description must be at least 10 characters", style = MaterialTheme.typography.caption, color = Color(0xFF8D6E63))
                            if (!isDistrictValid) Text("• Select a Jharkhand district", style = MaterialTheme.typography.caption, color = Color(0xFF8D6E63))
                            if (!isLocationValid) Text("• Tap 'Get Current Location' to geotag the issue", style = MaterialTheme.typography.caption, color = Color(0xFF8D6E63))
                        }
                    }
                }

                // 7. Submit Button — Gradient teal-to-dark-teal, rounded 16dp
                val submitEnabled = isFormValid && !isSubmitting
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(16.dp),
                    color = Color.Transparent,
                    contentColor = Color.White
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(
                                brush = if (submitEnabled) Brush.horizontalGradient(
                                    colors = listOf(
                                        Color(0xFF0D9488),
                                        Color(0xFF065F46)
                                    )
                                ) else Brush.horizontalGradient(
                                    colors = listOf(
                                        Color(0xFF0D9488).copy(alpha = 0.4f),
                                        Color(0xFF065F46).copy(alpha = 0.4f)
                                    )
                                ),
                                shape = RoundedCornerShape(16.dp)
                            )
                            .clickable(enabled = submitEnabled) {
                                if (!isFormValid || isSubmitting) return@clickable
                                isSubmitting = true
                                coroutineScope.launch {
                                    try {
                                        val submission = MobileChallengeSubmission(
                                            title = title.trim(),
                                            description = description.trim(),
                                            district = district.trim(),
                                            location = location.trim(),
                                            domain = if (domain.isNotBlank()) domain.trim() else null,
                                            evidenceUrl = if (evidenceUrl.isNotBlank()) evidenceUrl.trim() else null
                                        )
                                        val response = apiClient.submitChallenge(submission)
                                        if (response.success) {
                                            submissionResponse = response
                                            showSuccessDialog = true
                                        } else {
                                            errorMessage = response.error ?: "Submission was rejected by the server."
                                            showErrorDialog = true
                                        }
                                    } catch (e: Exception) {
                                        errorMessage = e.message ?: "Failed to connect to backend server. Please verify network connectivity."
                                        showErrorDialog = true
                                    } finally {
                                        isSubmitting = false
                                    }
                                }
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        if (isSubmitting) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(24.dp),
                                    color = Color.White,
                                    strokeWidth = 2.5.dp
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(strings.submittingSecurely, style = MaterialTheme.typography.button, color = if (submitEnabled) Color.White else Color.White.copy(alpha = 0.6f))
                            }
                        } else {
                            Text(
                                text = strings.submitToSarpanch,
                                style = MaterialTheme.typography.button.copy(fontSize = 16.sp),
                                color = if (submitEnabled) Color.White else Color.White.copy(alpha = 0.6f)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))
            }
        }

        // 8. Success AlertDialog — Rounded shape, teal accents
        if (showSuccessDialog) {
            AlertDialog(
                onDismissRequest = {
                    showSuccessDialog = false
                    title = ""
                    description = ""
                    district = ""
                    domain = ""
                    location = ""
                    evidenceUrl = ""
                    evidenceName = ""
                    if (navigator?.canPop == true) navigator.pop() else tabNavigator.current = HomeTab
                },
                shape = RoundedCornerShape(24.dp),
                title = {
                    Text(
                        text = "Submission Successful",
                        style = MaterialTheme.typography.h6.copy(fontWeight = FontWeight.Bold),
                        color = DeepTeal
                    )
                },
                text = {
                    Column {
                        Text(
                            text = "Your problem has been registered and triaged by the system.",
                            style = MaterialTheme.typography.body2
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Card(
                            backgroundColor = MaterialTheme.colors.surface,
                            elevation = 0.dp,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Text(
                                    text = "Tracking ID: ${submissionResponse?.trackingId ?: "N/A"}",
                                    style = MaterialTheme.typography.subtitle2.copy(fontWeight = FontWeight.Bold),
                                    color = DeepTeal
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Track: ${submissionResponse?.track ?: "N/A"}",
                                    style = MaterialTheme.typography.body2
                                )
                                if (!submissionResponse?.trackRouting.isNullOrBlank()) {
                                    Text(
                                        text = "Routing: ${submissionResponse?.trackRouting}",
                                        style = MaterialTheme.typography.caption,
                                        color = Color.DarkGray
                                    )
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Status: ${submissionResponse?.status ?: "REPORTED"}",
                                    style = MaterialTheme.typography.body2.copy(fontWeight = FontWeight.Medium),
                                    color = Color(0xFF2E7D32)
                                )
                            }
                        }
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            showSuccessDialog = false
                            title = ""
                            description = ""
                            district = ""
                            domain = ""
                            location = ""
                            evidenceUrl = ""
                            evidenceName = ""
                            if (navigator?.canPop == true) navigator.pop() else tabNavigator.current = HomeTab
                        },
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            backgroundColor = DeepTeal,
                            contentColor = Color.White
                        )
                    ) {
                        Text("OK")
                    }
                }
            )
        }

        // 9. Error AlertDialog — Rounded shape, amber accents
        if (showErrorDialog) {
            AlertDialog(
                onDismissRequest = { showErrorDialog = false },
                shape = RoundedCornerShape(24.dp),
                title = {
                    Text(
                        text = "Submission Failed",
                        style = MaterialTheme.typography.h6.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colors.error
                    )
                },
                text = {
                    Text(
                        text = errorMessage ?: "An unexpected error occurred while communicating with the server.",
                        style = MaterialTheme.typography.body2
                    )
                },
                confirmButton = {
                    Button(
                        onClick = { showErrorDialog = false },
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            backgroundColor = WarmAmber,
                            contentColor = Color(0xFF1E293B)
                        )
                    ) {
                        Text("Dismiss")
                    }
                }
            )
        }
    }
}
