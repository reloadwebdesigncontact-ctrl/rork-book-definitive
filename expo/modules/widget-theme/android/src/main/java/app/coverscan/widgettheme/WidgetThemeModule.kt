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

        // Sauvegarde les couleurs du gradient dans SharedPreferences et force le rafraîchissement du widget
        Function("saveThemeColors") { gradient0: String, gradient1: String, gradient2: String ->
            val context = appContext.reactContext ?: return@Function false
            try {
                val prefs = context.getSharedPreferences("widget_theme", Context.MODE_PRIVATE)
                prefs.edit()
                    .putString("gradient0", gradient0)
                    .putString("gradient1", gradient1)
                    .putString("gradient2", gradient2)
                    .apply()

                // Forcer la mise à jour immédiate du widget
                val intent = Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE)
                val ids = AppWidgetManager.getInstance(context).getAppWidgetIds(
                    ComponentName(context, "app.coverscan.IdeeDuJourWidgetProvider")
                )
                intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
                context.sendBroadcast(intent)

                true
            } catch (e: Exception) {
                false
            }
        }
    }
}
