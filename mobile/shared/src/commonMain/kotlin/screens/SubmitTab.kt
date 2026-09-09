package screens

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Send
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.graphics.vector.rememberVectorPainter
import cafe.adriel.voyager.navigator.tab.Tab
import cafe.adriel.voyager.navigator.tab.TabOptions

import cafe.adriel.voyager.navigator.Navigator
import cafe.adriel.voyager.transitions.SlideTransition

object SubmitTab : Tab {
    override val options: TabOptions
        @Composable
        get() {
            val title = localization.LocalLocalization.current.strings.submitProblem
            val icon = rememberVectorPainter(Icons.Default.Send)
            return remember(title) {
                TabOptions(
                    index = 1u,
                    title = title,
                    icon = icon
                )
            }
        }

    @Composable
    override fun Content() {
        // Reuse the existing screen content wrapped in a navigator for its own stack if needed
        Navigator(CitizenSubmitScreen()) { navigator ->
            SlideTransition(navigator)
        }
    }
}
