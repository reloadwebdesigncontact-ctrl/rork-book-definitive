const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const ICON_NAMES = [
  'orange', 'red', 'purple', 'turquoise', 'pink', 'yellow',
  'coral', 'lime', 'sunset', 'dreamy', 'neon', 'flamingo',
  'aurora', 'ocean', 'silver', 'gold',
];

// Copie les icônes dans les dossiers mipmap Android
const withCopyIcons = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const androidResDir = path.join(
        config.modRequest.platformProjectRoot,
        'app', 'src', 'main', 'res'
      );

      const densities = [
        { folder: 'mipmap-mdpi' },
        { folder: 'mipmap-hdpi' },
        { folder: 'mipmap-xhdpi' },
        { folder: 'mipmap-xxhdpi' },
        { folder: 'mipmap-xxxhdpi' },
      ];

      const assetsDir = path.join(config.modRequest.projectRoot, 'assets', 'images');

      for (const iconName of ICON_NAMES) {
        const srcFile = iconName === 'orange'
          ? path.join(assetsDir, 'icon.png')
          : path.join(assetsDir, `${iconName}.png`);

        if (!fs.existsSync(srcFile)) {
          console.warn(`[withAlternateIcons] Missing icon: ${srcFile}`);
          continue;
        }

        for (const density of densities) {
          const destDir = path.join(androidResDir, density.folder);
          if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
          const destFile = path.join(destDir, `ic_launcher_${iconName}.png`);
          fs.copyFileSync(srcFile, destFile);
          console.log(`[withAlternateIcons] Copied ${iconName} -> ${density.folder}`);
        }
      }

      return config;
    },
  ]);
};

// Ajoute les activity-alias dans AndroidManifest.xml
const withAliases = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const app = manifest.manifest.application[0];

    // Trouve la MainActivity (cherche celle avec l'intent MAIN/LAUNCHER)
    const activities = app.activity || [];
    let mainActivity = null;
    for (const act of activities) {
      const intentFilters = act['intent-filter'] || [];
      for (const filter of intentFilters) {
        const actions = filter.action || [];
        const categories = filter.category || [];
        const hasMain = actions.some(
          (a) => a.$?.['android:name'] === 'android.intent.action.MAIN'
        );
        const hasLauncher = categories.some(
          (c) => c.$?.['android:name'] === 'android.intent.category.LAUNCHER'
        );
        if (hasMain && hasLauncher) {
          mainActivity = act;
          break;
        }
      }
      if (mainActivity) break;
    }

    // Fallback sur la première activity
    if (!mainActivity) {
      mainActivity = activities[0];
    }

    if (!mainActivity) {
      console.warn('[withAlternateIcons] No MainActivity found in manifest!');
      return config;
    }

    // Nom complet de la MainActivity (ex: ".MainActivity" ou "app.coverscan.MainActivity")
    const mainActivityName = mainActivity.$['android:name'] || '.MainActivity';
    console.log(`[withAlternateIcons] MainActivity found: ${mainActivityName}`);

    // Supprime les anciens aliases générés par ce plugin
    app['activity-alias'] = (app['activity-alias'] || []).filter(
      (a) => !a.$['android:name']?.startsWith('.MainActivityAlias_')
    );

    // Ajoute un alias par icône
    // L'alias orange est désactivé par défaut car la MainActivity elle-même est le launcher par défaut
    for (const iconName of ICON_NAMES) {
      const alias = {
        $: {
          'android:name': `.MainActivityAlias_${iconName}`,
          // orange = désactivé (MainActivity est le launcher par défaut)
          // autres = désactivés aussi, activés à la demande
          'android:enabled': 'false',
          'android:exported': 'true',
          'android:icon': `@mipmap/ic_launcher_${iconName}`,
          'android:targetActivity': mainActivityName,
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
            category: [{ $: { 'android:name': 'android.intent.category.LAUNCHER' } }],
          },
        ],
      };
      app['activity-alias'] = [...(app['activity-alias'] || []), alias];
    }

    return config;
  });
};

module.exports = (config) => {
  config = withCopyIcons(config);
  config = withAliases(config);
  return config;
};
