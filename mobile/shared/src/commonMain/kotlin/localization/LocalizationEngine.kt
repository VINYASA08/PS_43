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
    val loginAsGov: String = "Login as Government Official",
    val appTitle: String,
    val mobileFieldApplication: String,
    val welcomeTitle: String,
    val welcomeDescription: String,
    val getStarted: String,
    val homeTabTitle: String,
    val mySubmittedProblems: String,
    val submitProblem: String,
    val problemFormat: (Int) -> String,
    val statusPending: String,
    val problemDescriptionPlaceholder: String,
    val profileTabTitle: String,
    val profileAndSettings: String,
    val profileDetails: String,
    val nameLabel: String,
    val save: String,
    val nameFormat: (String) -> String,
    val edit: String,
    val settings: String,
    val darkTheme: String,
    val languageLabel: String
)

val englishStrings = Strings(
    reportLocalIssue = "Report Local Issue",
    back = "Back",
    captureEvidence = "Capture Evidence",
    openCameraAudio = "📷 Open Camera / Record Audio",
    problemTitle = "Problem Title",
    detailedDescription = "Detailed Description",
    submittingSecurely = "Submitting securely...",
    submitToSarpanch = "Submit Problem Statement",
    sarpanchVerification = "District Nodal Officer Triage",
    pendingIssues = "Pending Issues in District",
    markDuplicate = "Mark Duplicate",
    verifyAndRoute = "Verify & Route",
    loginAsCitizen = "Login as Citizen",
    loginAsSarpanch = "Login as District Nodal Officer",
    loginAsGov = "Login as Government Official",
    appTitle = "Jharkhand Smart Study Mobile",
    mobileFieldApplication = "Mobile Field Application",
    welcomeTitle = "Welcome to Jharkhand Smart Study",
    welcomeDescription = "Empowering citizens to improve local education infrastructure by reporting issues and tracking their resolution directly with local governance.",
    getStarted = "Get Started",
    homeTabTitle = "Home",
    mySubmittedProblems = "My Submitted Problems",
    submitProblem = "Submit Problem",
    problemFormat = { index -> "Problem #00$index" },
    statusPending = "Status: Pending",
    problemDescriptionPlaceholder = "A brief description of the reported issue goes here...",
    profileTabTitle = "Profile",
    profileAndSettings = "Profile & Settings",
    profileDetails = "Profile Details",
    nameLabel = "Name",
    save = "Save",
    nameFormat = { name -> "Name: $name" },
    edit = "Edit",
    settings = "Settings",
    darkTheme = "Dark Theme",
    languageLabel = "Language"
)

val hindiStrings = Strings(
    reportLocalIssue = "स्थानीय समस्या दर्ज करें",
    back = "पीछे",
    captureEvidence = "सबूत कैप्चर करें",
    openCameraAudio = "📷 कैमरा / ऑडियो रिकॉर्ड करें",
    problemTitle = "समस्या का शीर्षक",
    detailedDescription = "विस्तृत विवरण",
    submittingSecurely = "सुरक्षित रूप से सबमिट कर रहा है...",
    submitToSarpanch = "समस्या विवरण सबमिट करें",
    sarpanchVerification = "जिला नोडल अधिकारी सत्यापन",
    pendingIssues = "जिले में लंबित समस्याएं",
    markDuplicate = "डुप्लिकेट चिह्नित करें",
    verifyAndRoute = "सत्यापित करें और आगे भेजें",
    loginAsCitizen = "नागरिक के रूप में लॉगिन करें",
    loginAsSarpanch = "जिला नोडल अधिकारी के रूप में लॉगिन करें",
    loginAsGov = "सरकारी अधिकारी के रूप में लॉगिन करें",
    appTitle = "झारखंड स्मार्ट स्टडी मोबाइल",
    mobileFieldApplication = "मोबाइल फील्ड एप्लीकेशन",
    welcomeTitle = "झारखंड स्मार्ट स्टडी में आपका स्वागत है",
    welcomeDescription = "नागरिकों को स्थानीय शिक्षा के बुनियादी ढांचे में सुधार करने, समस्याओं की रिपोर्ट करने और स्थानीय प्रशासन के साथ सीधे उनके समाधान को ट्रैक करने के लिए सशक्त बनाना।",
    getStarted = "शुरू करें",
    homeTabTitle = "होम",
    mySubmittedProblems = "मेरी प्रस्तुत समस्याएं",
    submitProblem = "समस्या दर्ज करें",
    problemFormat = { index -> "समस्या #00$index" },
    statusPending = "स्थिति: लंबित",
    problemDescriptionPlaceholder = "रिपोर्ट की गई समस्या का संक्षिप्त विवरण यहाँ है...",
    profileTabTitle = "प्रोफ़ाइल",
    profileAndSettings = "प्रोफ़ाइल और सेटिंग्स",
    profileDetails = "प्रोफ़ाइल विवरण",
    nameLabel = "नाम",
    save = "सहेजें",
    nameFormat = { name -> "नाम: $name" },
    edit = "संपादित करें",
    settings = "सेटिंग्स",
    darkTheme = "डार्क थीम",
    languageLabel = "भाषा"
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
