package screens

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.BottomNavigation
import androidx.compose.material.BottomNavigationItem
import androidx.compose.material.Icon
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Scaffold
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.tab.CurrentTab
import cafe.adriel.voyager.navigator.tab.LocalTabNavigator
import cafe.adriel.voyager.navigator.tab.Tab
import cafe.adriel.voyager.navigator.tab.TabNavigator
import DeepTeal

class MainScreen : Screen {
    @Composable
    override fun Content() {
        TabNavigator(HomeTab) {
            Scaffold(
                bottomBar = {
                    BottomNavigation(
                        modifier = Modifier.clip(
                            RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)
                        ),
                        backgroundColor = MaterialTheme.colors.surface.copy(alpha = 0.85f),
                        elevation = 8.dp
                    ) {
                        TabNavigationItem(HomeTab)
                        TabNavigationItem(SubmitTab)
                        TabNavigationItem(ProfileTab)
                    }
                }
            ) { paddingValues ->
                Box(modifier = Modifier.padding(paddingValues)) {
                    CurrentTab()
                }
            }
        }
    }
}

@Composable
private fun RowScope.TabNavigationItem(tab: Tab) {
    val tabNavigator = LocalTabNavigator.current
    val isSelected = tabNavigator.current == tab

    val iconColor by animateColorAsState(
        targetValue = if (isSelected) DeepTeal else Color(0xFF94A3B8),
        animationSpec = tween(300)
    )
    val labelColor by animateColorAsState(
        targetValue = if (isSelected) DeepTeal else Color(0xFF94A3B8),
        animationSpec = tween(300)
    )

    BottomNavigationItem(
        selected = isSelected,
        onClick = { tabNavigator.current = tab },
        icon = {
            tab.options.icon?.let { icon ->
                Icon(
                    painter = icon,
                    contentDescription = tab.options.title,
                    tint = iconColor
                )
            }
        },
        label = {
            Text(
                tab.options.title,
                color = labelColor
            )
        },
        selectedContentColor = DeepTeal,
        unselectedContentColor = Color(0xFF94A3B8)
    )
}
