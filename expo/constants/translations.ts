export type Language = 'fr' | 'en';

export interface Translations {
  home: {
    title: string;
    subtitle: string;
    feature1: string;
    feature2: string;
    feature3: string;
    scanButton: string;
  };
  scan: {
    title: string;
    scanButton: string;
    scanning: string;
    error: string;
    retry: string;
  };
  summary: {
    title: string;
    generating: string;
    error: string;
    retry: string;
    generateFiche: string;
    animatedReading: string;
    flashcards: string;
    flashcardsGenerating: string;
    flashcardsSubtitle: string;
    yourAnswer: string;
    correctAnswer: string;
    nextQuestion: string;
    generateMore: string;
    selectType: string;
    normalSummary: string;
    chapterSummary: string;
    normalDesc: string;
    chapterDesc: string;
    copyrightError: string;
    copyrightErrorMessage: string;
    backToSelection: string;
  };
  fiche: {
    title: string;
    pdfUnavailable: string;
    pdfUnavailableMessage: string;
    pdfSuccess: string;
    pdfError: string;
    pdfErrorMessage: string;
    shareSuccess: string;
    shareError: string;
    shareErrorMessage: string;
  };
  audio: {
    title: string;
    by: string;
    author: string;
  };
  settings: {
    title: string;
    language: string;
    french: string;
    english: string;
    theme: string;
    darkMode: string;
    lightMode: string;
    appColor: string;
    voice: string;
    maleVoice: string;
    femaleVoice: string;
    premiumDebug: string;
    premiumDebugDescription: string;
    premiumDebugEnable: string;
    premiumDebugDisable: string;
    premiumDebugRefresh: string;
    premiumDebugActive: string;
    premiumDebugInactive: string;
    legal: string;
    legalNotices: string;
  };
}

export const translations: Record<Language, Translations> = {
  fr: {
    home: {
      title: 'Cover Scan',
      subtitle: 'Transformez une couverture de livre\nen résumé instantané',
      feature1: 'Scannez la couverture',
      feature2: 'IA identifie le livre',
      feature3: 'Résumé instantané',
      scanButton: 'Scanner un livre',
    },
    scan: {
      title: 'Scanner le livre',
      scanButton: 'Prendre une photo',
      scanning: 'Analyse en cours...',
      error: 'Erreur',
      retry: 'Réessayer',
    },
    summary: {
      title: 'Résumé',
      generating: 'Génération du résumé...',
      error: 'Erreur',
      retry: 'Réessayer',
      generateFiche: 'Générer la fiche de lecture',
      animatedReading: 'Lecture Audio',
      flashcards: 'Flash cards',
      flashcardsGenerating: 'Génération des flash cards...',
      flashcardsSubtitle: 'Teste ta compréhension avec des questions sur le livre.',
      yourAnswer: 'Ta réponse',
      correctAnswer: 'Bonne réponse',
      nextQuestion: 'Question suivante',
      generateMore: 'Nouvelles cartes',
      selectType: 'Choisissez le type de résumé',
      normalSummary: 'Résumé Normal',
      chapterSummary: 'Résumé par Chapitre',
      normalDesc: 'Vue d\'ensemble concise du livre',
      chapterDesc: 'Résumé détaillé chapitre par chapitre',
      copyrightError: 'Résumé non disponible',
      copyrightErrorMessage: 'Impossible de générer le résumé chapitre par chapitre pour ce livre en raison des droits d\'auteur.',
      backToSelection: 'Retour à la sélection',
    },
    fiche: {
      title: 'Fiche de Lecture',
      pdfUnavailable: 'Non disponible',
      pdfUnavailableMessage: "L'export PDF n'est pas disponible sur web.",
      pdfSuccess: 'Succès',
      pdfError: 'Erreur',
      pdfErrorMessage: "Impossible d'exporter le PDF.",
      shareSuccess: 'Contenu partagé avec succès!',
      shareError: 'Impossible de partager le contenu. Veuillez réessayer.',
      shareErrorMessage: 'Impossible de partager le contenu. Veuillez réessayer.',
    },
    audio: {
      title: 'Lecture Audio',
      by: 'Par',
      author: 'Auteur',
    },
    settings: {
      title: 'Paramètres',
      language: 'Langue',
      french: 'Français',
      english: 'English',
      theme: 'Thème',
      darkMode: 'Mode sombre',
      lightMode: 'Mode clair',
      appColor: 'Couleur de l\'application',
      voice: 'Voix de lecture IA',
      maleVoice: 'Voix masculine',
      femaleVoice: 'Voix féminine',
      premiumDebug: 'Débogage premium',
      premiumDebugDescription: 'Débloquez temporairement les fonctionnalités premium pour tester l’app.',
      premiumDebugEnable: 'Activer l’accès premium debug',
      premiumDebugDisable: 'Désactiver l’accès premium debug',
      premiumDebugRefresh: 'Actualiser le statut premium',
      premiumDebugActive: 'Actif',
      premiumDebugInactive: 'Inactif',
      legal: 'Légal',
      legalNotices: 'Mentions Légales',
    },
  },
  en: {
    home: {
      title: 'Cover Scan',
      subtitle: 'Transform a book cover\ninto instant summary',
      feature1: 'Scan the cover',
      feature2: 'AI identifies the book',
      feature3: 'Instant summary',
      scanButton: 'Scan a book',
    },
    scan: {
      title: 'Scan the book',
      scanButton: 'Take a photo',
      scanning: 'Analyzing...',
      error: 'Error',
      retry: 'Retry',
    },
    summary: {
      title: 'Summary',
      generating: 'Generating summary...',
      error: 'Error',
      retry: 'Retry',
      generateFiche: 'Generate reading sheet',
      animatedReading: 'Audio Reading',
      flashcards: 'Flash cards',
      flashcardsGenerating: 'Generating flash cards...',
      flashcardsSubtitle: 'Test your understanding with questions about the book.',
      yourAnswer: 'Your answer',
      correctAnswer: 'Correct answer',
      nextQuestion: 'Next question',
      generateMore: 'New cards',
      selectType: 'Choose summary type',
      normalSummary: 'Normal Summary',
      chapterSummary: 'Chapter Summary',
      normalDesc: 'Concise overview of the book',
      chapterDesc: 'Detailed chapter-by-chapter summary',
      copyrightError: 'Summary unavailable',
      copyrightErrorMessage: 'Unable to generate chapter-by-chapter summary for this book due to copyright restrictions.',
      backToSelection: 'Back to selection',
    },
    fiche: {
      title: 'Reading Sheet',
      pdfUnavailable: 'Unavailable',
      pdfUnavailableMessage: 'PDF export is not available on web.',
      pdfSuccess: 'Success',
      pdfError: 'Error',
      pdfErrorMessage: 'Unable to export PDF.',
      shareSuccess: 'Content shared successfully!',
      shareError: 'Unable to share content. Please try again.',
      shareErrorMessage: 'Unable to share content. Please try again.',
    },
    audio: {
      title: 'Audio Reading',
      by: 'By',
      author: 'Author',
    },
    settings: {
      title: 'Settings',
      language: 'Language',
      french: 'Français',
      english: 'English',
      theme: 'Theme',
      darkMode: 'Dark mode',
      lightMode: 'Light mode',
      appColor: 'App color',
      voice: 'AI Reading Voice',
      maleVoice: 'Male voice',
      femaleVoice: 'Female voice',
      premiumDebug: 'Premium debug',
      premiumDebugDescription: 'Temporarily unlock premium features to test the app.',
      premiumDebugEnable: 'Enable premium debug access',
      premiumDebugDisable: 'Disable premium debug access',
      premiumDebugRefresh: 'Refresh premium status',
      premiumDebugActive: 'Active',
      premiumDebugInactive: 'Inactive',
      legal: 'Legal',
      legalNotices: 'Legal Notices',
    },
  },
};
