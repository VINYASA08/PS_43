import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import cafe.adriel.voyager.navigator.Navigator
import cafe.adriel.voyager.transitions.SlideTransition
import org.koin.compose.KoinApplication
import di.appModule
import screens.LoginScreen
import localization.ProvideLocalization
import localization.LocalizationEngine

expect fun getPlatformName(): String

val VibrantPrimary = Color(0xFFFF5722)
val VibrantPrimaryVariant = Color(0xFFE64A19)
val VibrantSecondary = Color(0xFFFFC107)

private val AppColors = lightColors(
    primary = VibrantPrimary,
    primaryVariant = VibrantPrimaryVariant,
    secondary = VibrantSecondary,
    background = Color(0xFFF5F5F5),
    surface = Color.White
)

@Composable
fun App() {
    val localizationEngine = remember { LocalizationEngine() }

    KoinApplication(application = {
        modules(appModule)
    }) {
        ProvideLocalization(localizationEngine) {
            MaterialTheme(colors = AppColors) {
                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colors.background) {
                    Navigator(LoginScreen()) { navigator ->
                        SlideTransition(navigator)
                    }
                }
            }
        }
    }
}