/**
 * Fix JVM target incompatibility for expo-dynamic-app-icon (v0.1.0).
 * Forces all subprojects Kotlin compilation to target JVM 17.
 */
const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = (config) => {
  return withProjectBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    // Évite les doublons
    if (contents.includes('allprojects { tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile)')) {
      return config;
    }

    // Ajoute à la fin du fichier
    contents += `

// Fix: expo-dynamic-app-icon JVM target mismatch
allprojects {
    tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
        kotlinOptions {
            jvmTarget = "17"
        }
    }
}
`;

    config.modResults.contents = contents;
    return config;
  });
};
