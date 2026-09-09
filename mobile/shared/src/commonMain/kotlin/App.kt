import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import cafe.adriel.voyager.navigator.Navigator
import cafe.adriel.voyager.transitions.SlideTransition
import org.koin.compose.KoinApplication
import di.appModule
import screens.LoginScreen
import screens.WelcomeScreen
import localization.ProvideLocalization
import localization.LocalizationEngine

expect fun getPlatformName(): String

// --- Split-Complementary Color Palette ---
val DeepTeal = Color(0xFF0D9488)
val DeepTealDark = Color(0xFF065F46)
val DeepTealVariant = Color(0xFF0B7A70)
val WarmAmber = Color(0xFFF59E0B)
val WarmAmberDark = Color(0xFFD97706)

val LocalThemeIsDark = staticCompositionLocalOf<MutableState<Boolean>> { error("No theme provided") }

private val LightAppColors = lightColors(
    primary = DeepTeal,
    primaryVariant = DeepTealVariant,
    secondary = WarmAmber,
    secondaryVariant = WarmAmberDark,
    background = Color(0xFFF0FDFA),
    surface = Color(0xFFFFFFFF),
    onPrimary = Color.White,
    onSecondary = Color(0xFF1E293B),
    onBackground = Color(0xFF1E293B),
    onSurface = Color(0xFF1E293B)
)

private val DarkAppColors = darkColors(
    primary = DeepTeal,
    primaryVariant = DeepTealVariant,
    secondary = WarmAmber,
    secondaryVariant = WarmAmberDark,
    background = Color(0xFF0F172A),
    surface = Color(0xFF1E293B),
    onPrimary = Color.White,
    onSecondary = Color(0xFF1E293B),
    onBackground = Color(0xFFE2E8F0),
    onSurface = Color(0xFFE2E8F0)
)

private val AppTypography = Typography(
    h4 = TextStyle(
        fontWeight = FontWeight.Bold,
        fontSize = 28.sp,
        letterSpacing = 0.sp
    ),
    h6 = TextStyle(
        fontWeight = FontWeight.SemiBold,
        fontSize = 20.sp,
        letterSpacing = 0.15.sp
    ),
    body1 = TextStyle(
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        letterSpacing = 0.5.sp
    ),
    caption = TextStyle(
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp,
        letterSpacing = 0.4.sp
    )
)

private val AppShapes = Shapes(
    small = RoundedCornerShape(12.dp),
    medium = RoundedCornerShape(16.dp),
    large = RoundedCornerShape(24.dp)
)

@Composable
fun App() {
    val localizationEngine = remember { LocalizationEngine() }
    val isDarkTheme = remember { mutableStateOf(false) }
    val colors = if (isDarkTheme.value) DarkAppColors else LightAppColors

    KoinApplication(application = {
        modules(appModule)
    }) {
        ProvideLocalization(localizationEngine) {
            CompositionLocalProvider(LocalThemeIsDark provides isDarkTheme) {
                MaterialTheme(
                    colors = colors,
                    typography = AppTypography,
                    shapes = AppShapes
                ) {
                    Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colors.background) {
                        Navigator(WelcomeScreen()) { navigator ->
                            SlideTransition(navigator)
                        }
                    }
                }
            }
        }
    }
}