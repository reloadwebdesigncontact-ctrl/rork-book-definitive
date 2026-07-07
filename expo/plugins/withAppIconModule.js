const { withDangerousMod, withMainApplication } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

// ── Étape 1 : écrire AppIconModule.kt et AppIconPackage.kt ───────────────────
const withKotlinFiles = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.platformProjectRoot;
      const destDir = path.join(
        projectRoot,
        'app', 'src', 'main', 'java', 'app', 'coverscan', 'appicon'
      );
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

      // AppIconModule.kt — utilise Promise explicite (compatible New Architecture + Old)
      const moduleKt = `package app.coverscan.appicon

import android.content.ComponentName
import android.content.pm.PackageManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class AppIconModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "AppIconModule"

  private val aliases = listOf(
    "orange", "red", "purple", "turquoise", "pink", "yellow",
    "coral", "lime", "sunset", "dreamy", "neon", "flamingo",
    "aurora", "ocean", "silver", "gold"
  )

  @ReactMethod
  fun setActiveAlias(aliasName: String, promise: Promise) {
    try {
      val pkg = reactApplicationContext.packageName
      val pm = reactApplicationContext.packageManager
      for (alias in aliases) {
        try {
          pm.setComponentEnabledSetting(
            ComponentName(pkg, "${"$"}pkg.MainActivityAlias_${"$"}alias"),
            PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
            PackageManager.DONT_KILL_APP
          )
        } catch (ignored: Exception) {}
      }
      val main = ComponentName(pkg, "${"$"}pkg.MainActivity")
      if (aliasName == "orange") {
        pm.setComponentEnabledSetting(
          main,
          PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
          PackageManager.DONT_KILL_APP
        )
      } else {
        pm.setComponentEnabledSetting(
          main,
          PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
          PackageManager.DONT_KILL_APP
        )
        pm.setComponentEnabledSetting(
          ComponentName(pkg, "${"$"}pkg.MainActivityAlias_${"$"}aliasName"),
          PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
          PackageManager.DONT_KILL_APP
        )
      }
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("ICON_ERROR", e.message ?: "Unknown error")
    }
  }
}
`;
      fs.writeFileSync(path.join(destDir, 'AppIconModule.kt'), moduleKt);

      // AppIconPackage.kt
      const packageKt = `package app.coverscan.appicon

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class AppIconPackage : ReactPackage {
  override fun createNativeModules(ctx: ReactApplicationContext): List<NativeModule> =
    listOf(AppIconModule(ctx))
  override fun createViewManagers(ctx: ReactApplicationContext): List<ViewManager<*, *>> =
    emptyList()
}
`;
      fs.writeFileSync(path.join(destDir, 'AppIconPackage.kt'), packageKt);
      console.log('[withAppIconModule] Kotlin files written');
      return config;
    },
  ]);
};

// ── Étape 2 : enregistrer le package dans MainApplication.kt ─────────────────
const withPackageRegistration = (config) => {
  return withMainApplication(config, (config) => {
    let src = config.modResults.contents;

    if (src.includes('AppIconPackage')) {
      console.log('[withAppIconModule] Already registered');
      return config;
    }

    // Ajoute l'import après la déclaration de package
    src = src.replace(
      /^(package\s+\S+)/m,
      '$1\n\nimport app.coverscan.appicon.AppIconPackage'
    );

    // Pattern A — PackageList(this).packages (Expo SDK 49-52)
    if (src.includes('PackageList(this).packages')) {
      src = src.replace(
        'PackageList(this).packages',
        'PackageList(this).packages.also { it.add(AppIconPackage()) }'
      );
      console.log('[withAppIconModule] Patched via pattern A');
    }
    // Pattern B — mutableListOf<ReactPackage> (Expo SDK 53+)
    else if (src.includes('mutableListOf<ReactPackage>')) {
      src = src.replace(
        'mutableListOf<ReactPackage>(',
        'mutableListOf<ReactPackage>(AppIconPackage(), '
      );
      console.log('[withAppIconModule] Patched via pattern B');
    }
    // Pattern C — Expo SDK 54 / New Architecture avec getPackages
    else if (/override\s+fun\s+getPackages/.test(src)) {
      src = src.replace(
        /override\s+fun\s+getPackages\s*\(\s*\)[^{]*\{/,
        (match) => `${match}\n      val __iconPkgs = mutableListOf<com.facebook.react.ReactPackage>(AppIconPackage())`
      );
      // Cherche le return et ajoute le package
      src = src.replace(
        /(__iconPkgs[\s\S]*?)(return\s+(?:PackageList|listOf|mutableListOf)\(this\)\.packages)/,
        (m, before, ret) => `${before}val __base = ${ret.replace('return ', '')}\n      __iconPkgs.addAll(__base)\n      return __iconPkgs`
      );
      if (src.includes('AppIconPackage()')) {
        console.log('[withAppIconModule] Patched via pattern C');
      } else {
        console.error('[withAppIconModule] Pattern C failed. Content:\n' + src.substring(0, 2000));
      }
    }
    else {
      console.error('[withAppIconModule] No pattern matched. Content:\n' + src.substring(0, 2000));
    }

    config.modResults.contents = src;
    return config;
  });
};

module.exports = (config) => {
  config = withKotlinFiles(config);
  config = withPackageRegistration(config);
  return config;
};
