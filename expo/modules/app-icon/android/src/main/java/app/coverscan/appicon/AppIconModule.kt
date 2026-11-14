package app.coverscan.appicon

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AppIconModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AppIconModule")

    // Changer l'icône de l'app
    Function("setActiveAlias") { aliasName: String ->
      val context = appContext.reactContext
        ?: return@Function false
      val packageName = context.packageName
      val pm = context.packageManager

      val allAliases = listOf(
        "orange", "red", "purple", "turquoise", "pink", "yellow",
        "coral", "lime", "sunset", "dreamy", "neon", "flamingo",
        "aurora", "ocean", "silver", "gold", "tropical", "peach",
        "velvet", "glacier", "galaxy", "tartan", "holo", "arctic",
        "lagoon", "teddy_purple", "teddy_blue", "teddy_peach",
        "dev_logo", "og_orange"
      )

      for (alias in allAliases) {
        try {
          pm.setComponentEnabledSetting(
            ComponentName(packageName, "$packageName.MainActivityAlias_$alias"),
            PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
            PackageManager.DONT_KILL_APP
          )
        } catch (ignored: Exception) {}
      }

      val mainActivity = ComponentName(packageName, "$packageName.MainActivity")

      try {
        if (aliasName == "orange") {
          pm.setComponentEnabledSetting(
            mainActivity,
            PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
            PackageManager.DONT_KILL_APP
          )
        } else {
          pm.setComponentEnabledSetting(
            mainActivity,
            PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
            PackageManager.DONT_KILL_APP
          )
          pm.setComponentEnabledSetting(
            ComponentName(packageName, "$packageName.MainActivityAlias_$aliasName"),
            PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
            PackageManager.DONT_KILL_APP
          )
        }
        true
      } catch (e: Exception) {
        false
      }
    }

    // Sauvegarder le nom du thème pour le widget Android
    Function("saveThemeName") { themeName: String ->
      val context = appContext.reactContext ?: return@Function false
      try {
        val prefs = context.getSharedPreferences("widget_theme", Context.MODE_PRIVATE)
        prefs.edit().putString("theme_name", themeName).commit()

        // Forcer la mise à jour immédiate du widget
        val manager = AppWidgetManager.getInstance(context)
        val compName = ComponentName(context, "app.coverscan.IdeeDuJourWidgetProvider")
        val ids = manager.getAppWidgetIds(compName)
        if (ids.isNotEmpty()) {
          val intent = Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE)
          intent.component = compName
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
