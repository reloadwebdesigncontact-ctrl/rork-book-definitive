// Ce fichier documente que le changement d'icône nécessite
// un module natif Android personnalisé.
// 
// Avec Expo Managed Workflow, la seule façon fiable est:
// 1. expo-alternate-app-icons (iOS uniquement pour l'instant)
// 2. Un module natif personnalisé avec expo-modules-core
//
// Le plugin withAlternateIcons prépare les aliases dans le manifeste,
// mais l'activation native requiert du code Java/Kotlin.
export {};
