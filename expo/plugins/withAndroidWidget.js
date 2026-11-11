/**
 * Config plugin pour le widget Android "L'idée du jour"
 * Injecte les fichiers natifs Kotlin + XML dans le projet Android généré par prebuild
 */

const { withAndroidManifest, withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

// ─── Contenu des fichiers à injecter ───────────────────────────────────────────

const WIDGET_PROVIDER_KOTLIN = `package app.coverscan

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import java.util.Calendar

class IdeeDuJourWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {

        // ~50 citations littéraires / inspirantes (rotation par jour de l'année)
        private val QUOTES = listOf(
            "« Lire, c'est boire et manger. L'esprit qui ne lit pas maigrit comme le corps qui ne mange pas. » — Victor Hugo",
            "« Un livre est un ami qui ne trahit jamais. » — Victor Hugo",
            "« La lecture est à l'esprit ce que l'exercice est au corps. » — Richard Steele",
            "« Toute la sagesse humaine est dans ces deux mots : attendre et espérer. » — Alexandre Dumas",
            "« Les livres sont des miroirs : on n'y voit que ce qu'on y apporte. » — Carlos Ruiz Zafón",
            "« Il n'est pas de meilleur ami qu'un livre. » — Abraham Lincoln",
            "« Je suis fait de tous les livres que j'ai lus. » — Jorge Luis Borges",
            "« Un livre mal aimé est toujours une occasion manquée de grandir. » — Paulo Coelho",
            "« La bibliothèque est le seul endroit où les morts peuvent parler aux vivants. » — Umberto Eco",
            "« Lire, c'est voyager sans bouger de sa chaise. » — Jean-Paul Sartre",
            "« Ouvrir un livre, c'est ouvrir le monde. » — Voltaire",
            "« Les mots sont la plus puissante drogue utilisée par l'humanité. » — Rudyard Kipling",
            "« Un grand livre commence toujours dans l'incertitude. » — Marcel Proust",
            "« L'imagination est plus importante que le savoir. » — Albert Einstein",
            "« La connaissance s'acquiert par l'expérience, tout le reste n'est qu'information. » — Albert Einstein",
            "« Le secret pour aller de l'avant, c'est de commencer. » — Mark Twain",
            "« La vie est trop courte pour lire des mauvais livres. » — Carlos Ruiz Zafón",
            "« Chaque livre est un monde que tu peux visiter à tout moment. » — Lemony Snicket",
            "« On ne lit pas un livre, on le vit. » — Anaïs Nin",
            "« Les livres changent nos vies parce qu'ils changent nos esprits. » — Umberto Eco",
            "« Celui qui lit beaucoup et marche beaucoup voit beaucoup et sait beaucoup. » — Cervantes",
            "« L'éducation est l'arme la plus puissante que vous puissiez utiliser pour changer le monde. » — Nelson Mandela",
            "« Le temps que vous avez passé sur votre rose fait votre rose si importante. » — Antoine de Saint-Exupéry",
            "« On devient ce que l'on contemple. » — William Blake",
            "« Le courage, c'est d'agir sans avoir peur d'avoir peur. » — Jean Jaurès",
            "« Il faut toujours viser la lune, car même en cas d'échec, on atterrit dans les étoiles. » — Oscar Wilde",
            "« La plus grande gloire n'est pas de ne jamais tomber, mais de se relever à chaque chute. » — Confucius",
            "« Votre temps est limité, ne le gâchez pas en vivant la vie de quelqu'un d'autre. » — Steve Jobs",
            "« Les limites de mon langage sont les limites de mon monde. » — Ludwig Wittgenstein",
            "« Je n'ai jamais rencontré un homme si ignorant qu'il n'ait rien à m'apprendre. » — Galilée",
            "« Lis et tu seras ; médite et tu seras sage. » — Bouddhisme",
            "« Les livres sont les gardiens de la mémoire. » — Rebecca Solnit",
            "« La vraie richesse, c'est d'avoir du temps pour lire. » — Baudelaire",
            "« Pour bien écrire, il faut beaucoup lire. » — Gustave Flaubert",
            "« Les livres nous apprennent à vivre plusieurs vies en une. » — Milan Kundera",
            "« Sans la lecture, le monde serait à moitié fermé. » — Jean-Marie Le Clézio",
            "« La culture, c'est ce qui reste quand on a tout oublié. » — Édouard Herriot",
            "« Éduquer un enfant, c'est lui donner une bibliothèque intérieure. » — Éric-Emmanuel Schmitt",
            "« L'art de la lecture, c'est l'art de penser avec un peu d'aide étrangère. » — Mortimer Adler",
            "« Lire, c'est écouter la voix silencieuse d'une autre âme. » — Stephen King",
            "« Chaque page tournée est une porte ouverte sur l'inconnu. » — Jules Verne",
            "« Les livres sont les seuls objets inanimés qui contiennent de la magie. » — J.K. Rowling",
            "« Partager un livre, c'est partager une vision du monde. » — Simone de Beauvoir",
            "« Celui qui lit vit deux fois. » — Umberto Eco",
            "« Les mots que tu n'as pas lus sont ceux qui te manquent le plus. » — Marguerite Yourcenar",
            "« La passion de lire est une addiction dont personne ne guérit. » — Gaston Miron",
            "« Toute lecture est un acte de résistance. » — Daniel Pennac",
            "« Lire est une action solitaire qui lie les hommes entre eux. » — Albert Camus",
            "« Le lecteur idéal souffre d'insomnie perpétuelle. » — James Joyce",
            "« Un livre est un cadeau que tu peux ouvrir encore et encore. » — Garrison Keillor"
        )

        fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val views = RemoteViews(context.packageName, R.layout.widget_idee_du_jour)

            // Rotation quotidienne basée sur le jour de l'année
            val dayOfYear = Calendar.getInstance().get(Calendar.DAY_OF_YEAR)
            val quote = QUOTES[dayOfYear % QUOTES.size]

            views.setTextViewText(R.id.widget_quote, quote)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
`;

const WIDGET_LAYOUT_XML = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:background="@drawable/widget_background"
    android:padding="12dp"
    android:gravity="center_vertical">

    <!-- En-tête : ampoule + titre -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:gravity="center_vertical"
        android:layout_marginBottom="8dp">

        <!-- Ampoule emoji / icône -->
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="💡"
            android:textSize="22sp"
            android:layout_marginEnd="8dp" />

        <!-- Séparateur vertical blanc -->
        <View
            android:layout_width="2dp"
            android:layout_height="28dp"
            android:background="#80FFFFFF"
            android:layout_marginEnd="10dp" />

        <!-- Titre -->
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="L'idée du jour"
            android:textColor="#FFFFFF"
            android:textSize="15sp"
            android:textStyle="bold"
            android:fontFamily="sans-serif-medium"
            android:letterSpacing="0.02" />

    </LinearLayout>

    <!-- Bloc citation semi-transparent -->
    <FrameLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:background="@drawable/widget_quote_bg"
        android:padding="10dp">

        <TextView
            android:id="@+id/widget_quote"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text="« Lire, c'est boire et manger. L'esprit qui ne lit pas maigrit comme le corps qui ne mange pas. »"
            android:textColor="#FFFFFF"
            android:textSize="11sp"
            android:lineSpacingMultiplier="1.3"
            android:maxLines="4"
            android:ellipsize="end"
            android:fontFamily="sans-serif-light" />

    </FrameLayout>

    <!-- Icône soleil en bas, centrée -->
    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="☀"
        android:textColor="#FFFDE7"
        android:textSize="14sp"
        android:gravity="center_horizontal"
        android:layout_marginTop="6dp"
        android:alpha="0.85" />

</LinearLayout>
`;

const WIDGET_BACKGROUND_XML = `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">

    <gradient
        android:startColor="#F4604A"
        android:centerColor="#E8445A"
        android:endColor="#C62A6E"
        android:angle="135"
        android:type="linear" />

    <corners android:radius="16dp" />

</shape>
`;

const WIDGET_QUOTE_BG_XML = `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">

    <solid android:color="#33000000" />

    <corners android:radius="8dp" />

</shape>
`;

const WIDGET_INFO_XML = `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="250dp"
    android:minHeight="110dp"
    android:targetCellWidth="4"
    android:targetCellHeight="2"
    android:updatePeriodMillis="86400000"
    android:initialLayout="@layout/widget_idee_du_jour"
    android:widgetCategory="home_screen"
    android:description="@string/widget_description"
    android:previewImage="@mipmap/ic_launcher"
    android:resizeMode="none" />
`;

// ─── Helper pour écrire des fichiers dans le projet Android ────────────────────

function writeFileInProject(projectRoot, relativePath, content) {
  const fullPath = path.join(projectRoot, "android", relativePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content, "utf8");
  console.log(`[withAndroidWidget] Wrote: ${relativePath}`);
}

// ─── Plugin principal ──────────────────────────────────────────────────────────

const withAndroidWidgetFiles = (config) => {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const pkg = "app/coverscan";

      // 1. Kotlin provider
      writeFileInProject(
        projectRoot,
        `app/src/main/java/${pkg}/IdeeDuJourWidgetProvider.kt`,
        WIDGET_PROVIDER_KOTLIN
      );

      // 2. Layout XML
      writeFileInProject(
        projectRoot,
        "app/src/main/res/layout/widget_idee_du_jour.xml",
        WIDGET_LAYOUT_XML
      );

      // 3. Dégradé arrière-plan
      writeFileInProject(
        projectRoot,
        "app/src/main/res/drawable/widget_background.xml",
        WIDGET_BACKGROUND_XML
      );

      // 4. Fond bloc citation
      writeFileInProject(
        projectRoot,
        "app/src/main/res/drawable/widget_quote_bg.xml",
        WIDGET_QUOTE_BG_XML
      );

      // 5. Widget info (metadata)
      writeFileInProject(
        projectRoot,
        "app/src/main/res/xml/widget_idee_du_jour_info.xml",
        WIDGET_INFO_XML
      );

      // 6. Ajouter la description dans strings.xml si elle existe
      const stringsPath = path.join(
        projectRoot,
        "android/app/src/main/res/values/strings.xml"
      );
      if (fs.existsSync(stringsPath)) {
        let strings = fs.readFileSync(stringsPath, "utf8");
        if (!strings.includes("widget_description")) {
          strings = strings.replace(
            "</resources>",
            `    <string name="widget_description">Citation du jour renouvelée chaque matin</string>\n</resources>`
          );
          fs.writeFileSync(stringsPath, strings, "utf8");
          console.log("[withAndroidWidget] Added widget_description to strings.xml");
        }
      }

      return config;
    },
  ]);
};

const withAndroidWidgetManifest = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const application = manifest.manifest.application?.[0];

    if (!application) {
      return config;
    }

    // Vérifier que le receiver n'est pas déjà déclaré
    const receivers = application.receiver || [];
    const alreadyAdded = receivers.some(
      (r) =>
        r.$?.["android:name"] === "app.coverscan.IdeeDuJourWidgetProvider"
    );

    if (!alreadyAdded) {
      const widgetReceiver = {
        $: {
          "android:name": "app.coverscan.IdeeDuJourWidgetProvider",
          "android:label": "L'idée du jour",
          "android:exported": "true",
        },
        "intent-filter": [
          {
            action: [
              {
                $: {
                  "android:name": "android.appwidget.action.APPWIDGET_UPDATE",
                },
              },
            ],
          },
        ],
        "meta-data": [
          {
            $: {
              "android:name": "android.appwidget.provider",
              "android:resource": "@xml/widget_idee_du_jour_info",
            },
          },
        ],
      };

      application.receiver = [...receivers, widgetReceiver];
      console.log("[withAndroidWidget] Added widget receiver to AndroidManifest.xml");
    }

    return config;
  });
};

// Export du plugin combiné
module.exports = (config) => {
  config = withAndroidWidgetFiles(config);
  config = withAndroidWidgetManifest(config);
  return config;
};
