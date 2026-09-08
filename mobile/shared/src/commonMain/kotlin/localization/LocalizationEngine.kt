package localization

import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.mutableStateOf

enum class AppLanguage {
    ENGLISH, HINDI, MUNDARI, SANTALI
}

data class Strings(
    val reportLocalIssue: String,
    val back: String,
    val captureEvidence: String,
    val openCameraAudio: String,
    val problemTitle: String,
    val detailedDescription: String,
    val submittingSecurely: String,
    val submitToSarpanch: String,
    val sarpanchVerification: String,
    val pendingIssues: String,
    val markDuplicate: String,
    val verifyAndRoute: String,
    val loginAsCitizen: String,
    val loginAsSarpanch: String,
    val appTitle: String
)

val englishStrings = Strings(
    reportLocalIssue = "Report Local Issue",
    back = "Back",
    captureEvidence = "Capture Evidence",
    openCameraAudio = "📷 Open Camera / Record Audio",
    problemTitle = "Problem Title",
    detailedDescription = "Detailed Description",
    submittingSecurely = "Submitting securely...",
    submitToSarpanch = "Submit to Sarpanch",
    sarpanchVerification = "Sarpanch Verification",
    pendingIssues = "Pending Issues in Your Panchayat",
    markDuplicate = "Mark Duplicate",
    verifyAndRoute = "Verify & Route",
    loginAsCitizen = "Login as Citizen",
    loginAsSarpanch = "Login as Local Sarpanch",
    appTitle = "Jharkhand Smart Study Mobile"
)

val hindiStrings = Strings(
    reportLocalIssue = "स्थानीय समस्या दर्ज करें",
    back = "पीछे",
    captureEvidence = "सबूत कैप्चर करें",
    openCameraAudio = "📷 कैमरा / ऑडियो रिकॉर्ड करें",
    problemTitle = "समस्या का शीर्षक",
    detailedDescription = "विस्तृत विवरण",
    submittingSecurely = "सुरक्षित रूप से सबमिट कर रहा है...",
    submitToSarpanch = "सरपंच को सबमिट करें",
    sarpanchVerification = "सरपंच सत्यापन",
    pendingIssues = "आपकी पंचायत में लंबित समस्याएं",
    markDuplicate = "डुप्लिकेट चिह्नित करें",
    verifyAndRoute = "सत्यापित करें और आगे भेजें",
    loginAsCitizen = "नागरिक के रूप में लॉगिन करें",
    loginAsSarpanch = "स्थानीय सरपंच के रूप में लॉगिन करें",
    appTitle = "झारखंड स्मार्ट स्टडी मोबाइल"
)

class LocalizationEngine {
    val currentLanguage = mutableStateOf(AppLanguage.ENGLISH)
    
    val strings: Strings
        get() = when (currentLanguage.value) {
            AppLanguage.ENGLISH -> englishStrings
            AppLanguage.HINDI -> hindiStrings
            else -> englishStrings // Fallback for MUNDARI, SANTALI for now
        }
    
    fun setLanguage(language: AppLanguage) {
        currentLanguage.value = language
    }
}

val LocalLocalization = compositionLocalOf { LocalizationEngine() }

@Composable
fun ProvideLocalization(engine: LocalizationEngine, content: @Composable () -> Unit) {
    CompositionLocalProvider(LocalLocalization provides engine) {
        content()
    }
}
