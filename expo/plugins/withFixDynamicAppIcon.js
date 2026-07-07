/**
 * Fix expo-dynamic-app-icon: désactive immédiatement l'ancienne icône
 * au lieu d'attendre onPause().
 * 
 * Remplace le fichier Kotlin natif du module après que EAS l'a installé.
 */
const { withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

module.exports = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      
      // Chemin vers le fichier Kotlin dans node_modules (copié dans le projet Android par EAS)
      const targetDir = path.join(
        config.modRequest.platformProjectRoot,
        'expo-dynamic-app-icon',
        'src', 'main', 'java', 'expo', 'modules', 'dynamicappicon'
      );

      // Si le dossier n'existe pas encore (le build génère les fichiers plus tard)
      // On modifie directement dans node_modules
      const nodeModulesPath = path.join(
        projectRoot,
        'node_modules', 'expo-dynamic-app-icon', 'android', 'src', 'main',
        'java', 'expo', 'modules', 'dynamicappicon', 'ExpoDynamicAppIconModule.kt'
      );

      const fixedKotlin = `package expo.modules.dynamicappicon

import android.content.Context
import android.content.pm.PackageManager
import android.content.ComponentName

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoDynamicAppIconModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoDynamicAppIcon")

    Function("setAppIcon") { name: String ->
      try {
        val packageName = context.packageName
        val newIcon = "\$packageName.MainActivity\$name"

        SharedObject.packageName = packageName
        SharedObject.pm = pm
        SharedObject.icon = newIcon

        // Liste complète des aliases configurés dans app.json
        val allAliases = listOf(
          "orange", "red", "purple", "turquoise", "pink", "yellow",
          "coral", "lime", "sunset", "dreamy", "neon", "flamingo",
          "aurora", "ocean", "silver", "gold", "tropical"
        )

        val mainActivity = ComponentName(packageName, "\$packageName.MainActivity")

        // Gestion de la MainActivity
        if (name.isEmpty()) {
          // Retour à l'icône par défaut
          pm.setComponentEnabledSetting(
            mainActivity,
            PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
            PackageManager.DONT_KILL_APP
          )
        } else {
          // Désactive la MainActivity (un alias prend le relais)
          try {
            pm.setComponentEnabledSetting(
              mainActivity,
              PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
              PackageManager.DONT_KILL_APP
            )
          } catch (ignored: Exception) {}
        }

        // Désactive TOUS les aliases sauf le nouveau
        allAliases.forEach { alias ->
          val aliasComp = ComponentName(packageName, "\$packageName.MainActivity\$alias")
          val isTarget = (alias == name)
          try {
            pm.setComponentEnabledSetting(
              aliasComp,
              if (isTarget) PackageManager.COMPONENT_ENABLED_STATE_ENABLED
              else PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
              PackageManager.DONT_KILL_APP
            )
          } catch (ignored: Exception) {}
        }

        return@Function name
      } catch (e: Exception) {
        return@Function false
      }
    }

    Function("getAppIcon") {
      val componentClass = currentActivity.componentName.className
      val currentIcon = if (SharedObject.icon.isNotEmpty()) SharedObject.icon else componentClass
      val currentIconName = currentIcon.split("MainActivity").getOrElse(1) { "" }
      return@Function if (currentIconName.isEmpty()) "DEFAULT" else currentIconName
    }
  }

  private val context: Context
    get() = requireNotNull(appContext.reactContext) { "React Application Context is null" }

  private val currentActivity
    get() = requireNotNull(appContext.activityProvider?.currentActivity)

  private val pm
    get() = requireNotNull(currentActivity.packageManager)
}
`;

      if (fs.existsSync(nodeModulesPath)) {
        fs.writeFileSync(nodeModulesPath, fixedKotlin, 'utf8');
        console.log('[withFixDynamicAppIcon] Patched ExpoDynamicAppIconModule.kt');
      } else {
        console.warn('[withFixDynamicAppIcon] File not found:', nodeModulesPath);
      }

      return config;
    },
  ]);
};
