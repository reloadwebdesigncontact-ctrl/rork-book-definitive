package app.coverscan.widgettheme

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class WidgetThemeModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("WidgetThemeModule")

        // Sauvegarde uniquement le NOM du thème (ex: "purple", "ocean")
        // Les couleurs sont résolues côté Kotlin depuis une table en dur — plus fiable
        Function("saveThemeColors") { gradient0: String, gradient1: String, gradient2: String ->
            val context = appContext.reactContext ?: return@Function false
            true // no-op : les couleurs ne sont plus transmises depuis JS
        }

        // Nouvelle fonction simple : juste le nom du thème
        Function("saveThemeName") { themeName: String ->
            val context = appContext.reactContext ?: return@Function false
            try {
                val prefs = context.getSharedPreferences("widget_theme", Context.MODE_PRIVATE)
                prefs.edit().putString("theme_name", themeName).commit() // commit() synchrone

                // Forcer la mise à jour immédiate du widget
                val manager = AppWidgetManager.getInstance(context)
                val ids = manager.getAppWidgetIds(
                    ComponentName(context, "app.coverscan.IdeeDuJourWidgetProvider")
                )
                if (ids.isNotEmpty()) {
                    val intent = Intent(context, Class.forName("app.coverscan.IdeeDuJourWidgetProvider"))
                    intent.action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                    intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
                    context.sendBroadcast(intent)
                }
                true
            } catch (e: Exception) {
                false
            }
        }
    }
}
