/**
 * Config plugin pour le widget Android "L'idée du jour"
 * Injecte les fichiers natifs Kotlin + XML dans le projet Android généré par prebuild EAS.
 *
 * CORRECTIONS v2 :
 * - Suppression des attributs non supportés par RemoteViews (fontFamily, letterSpacing,
 *   lineSpacingMultiplier, alpha, View séparateur)
 * - Layout entièrement en RelativeLayout (plus stable que LinearLayout imbriqués pour les widgets)
 * - Pas de dépendance à @string/widget_description (attribut optionnel supprimé)
 * - Le Kotlin est simplifié pour éviter tout crash silencieux
 */

const { withAndroidManifest, withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

// ─── Kotlin AppWidgetProvider ──────────────────────────────────────────────────

const WIDGET_PROVIDER_KOTLIN = `package app.coverscan

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
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
        scheduleMidnightAlarm(context)
    }

    override fun onEnabled(context: Context) {
        super.onEnabled(context)
        scheduleMidnightAlarm(context)
    }

    override fun onDisabled(context: Context) {
        super.onDisabled(context)
        cancelMidnightAlarm(context)
    }

    // ACTION_MIDNIGHT recu via le BroadcastReceiver : on force la maj de tous les widgets
    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_MIDNIGHT) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val ids = appWidgetManager.getAppWidgetIds(
                ComponentName(context, IdeeDuJourWidgetProvider::class.java)
            )
            for (id in ids) {
                updateWidget(context, appWidgetManager, id)
            }
            // Replanifier pour le lendemain
            scheduleMidnightAlarm(context)
        }
    }

    companion object {
        private const val ACTION_MIDNIGHT = "app.coverscan.WIDGET_MIDNIGHT_UPDATE"

        private val QUOTES = arrayOf(
            "Lire, c'est boire et manger. L'esprit qui ne lit pas maigrit. — Victor Hugo",
            "Un livre est un ami qui ne trahit jamais. — Victor Hugo",
            "La lecture est a l'esprit ce que l'exercice est au corps. — Richard Steele",
            "Toute la sagesse humaine est dans ces deux mots : attendre et esperer. — Alexandre Dumas",
            "Les livres sont des miroirs : on n'y voit que ce qu'on y apporte. — Carlos Ruiz Zafon",
            "Il n'est pas de meilleur ami qu'un livre. — Abraham Lincoln",
            "Je suis fait de tous les livres que j'ai lus. — Jorge Luis Borges",
            "La bibliotheque est le seul endroit ou les morts parlent aux vivants. — Umberto Eco",
            "Lire, c'est voyager sans bouger de sa chaise. — Jean-Paul Sartre",
            "Ouvrir un livre, c'est ouvrir le monde. — Voltaire",
            "Les mots sont la plus puissante drogue utilisee par l'humanite. — Rudyard Kipling",
            "L'imagination est plus importante que le savoir. — Albert Einstein",
            "La connaissance s'acquiert par l'experience, tout le reste est information. — Einstein",
            "Le secret pour aller de l'avant, c'est de commencer. — Mark Twain",
            "La vie est trop courte pour lire des mauvais livres. — Carlos Ruiz Zafon",
            "Chaque livre est un monde que tu peux visiter a tout moment. — Lemony Snicket",
            "On ne lit pas un livre, on le vit. — Anais Nin",
            "Les livres changent nos vies parce qu'ils changent nos esprits. — Umberto Eco",
            "Celui qui lit beaucoup et marche beaucoup voit beaucoup et sait beaucoup. — Cervantes",
            "L'education est l'arme la plus puissante pour changer le monde. — Nelson Mandela",
            "On devient ce que l'on contemple. — William Blake",
            "Le courage, c'est d'agir sans avoir peur d'avoir peur. — Jean Jaures",
            "Il faut toujours viser la lune, meme en cas d'echec on atterrit dans les etoiles. — Oscar Wilde",
            "La plus grande gloire n'est pas de ne jamais tomber, mais de se relever. — Confucius",
            "Votre temps est limite, ne le gachez pas en vivant la vie de quelqu'un d'autre. — Steve Jobs",
            "Les limites de mon langage sont les limites de mon monde. — Wittgenstein",
            "Je n'ai jamais rencontre un homme si ignorant qu'il n'ait rien a m'apprendre. — Galilee",
            "Les livres sont les gardiens de la memoire. — Rebecca Solnit",
            "La vraie richesse, c'est d'avoir du temps pour lire. — Baudelaire",
            "Pour bien ecrire, il faut beaucoup lire. — Gustave Flaubert",
            "Les livres nous apprennent a vivre plusieurs vies en une. — Milan Kundera",
            "La culture, c'est ce qui reste quand on a tout oublie. — Edouard Herriot",
            "L'art de la lecture, c'est l'art de penser avec un peu d'aide etrangere. — Mortimer Adler",
            "Lire, c'est ecouter la voix silencieuse d'une autre ame. — Stephen King",
            "Chaque page tournee est une porte ouverte sur l'inconnu. — Jules Verne",
            "Les livres sont les seuls objets inanimés qui contiennent de la magie. — J.K. Rowling",
            "Partager un livre, c'est partager une vision du monde. — Simone de Beauvoir",
            "Celui qui lit vit deux fois. — Umberto Eco",
            "La passion de lire est une addiction dont personne ne guerit. — Gaston Miron",
            "Toute lecture est un acte de resistance. — Daniel Pennac",
            "Lire est une action solitaire qui lie les hommes entre eux. — Albert Camus",
            "Un livre est un cadeau que tu peux ouvrir encore et encore. — Garrison Keillor",
            "Sans la lecture, le monde serait a moitie ferme. — J.M.G. Le Clezio",
            "Eduquer un enfant, c'est lui donner une bibliotheque interieure. — Eric-Emmanuel Schmitt",
            "Le lecteur ideal souffre d'insomnie perpetuelle. — James Joyce",
            "On ne choisit pas ses lectures, elles vous choisissent. — Jean Guenot",
            "Un livre ouvert, c'est un cerveau qui parle ; ferme, un ami qui attend. — Victor Hugo",
            "La litterature, c'est la pensee humaine mise en mots. — Emile Zola",
            "Lire, c'est partir a la decouverte de soi-meme. — Andre Maurois",
            "Un livre bien choisi vous sauve de tout, meme de vous-meme. — Daniel Pennac"
        )

        fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            try {
                val views = RemoteViews(context.packageName, R.layout.widget_idee_du_jour)
                val dayOfYear = Calendar.getInstance().get(Calendar.DAY_OF_YEAR)
                val quote = QUOTES[dayOfYear % QUOTES.size]
                views.setTextViewText(R.id.widget_quote, quote)

                // Clic sur le widget → ouvre l'app
                val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
                if (launchIntent != null) {
                    launchIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    val pendingIntent = PendingIntent.getActivity(
                        context,
                        0,
                        launchIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                    views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)
                }

                appWidgetManager.updateAppWidget(appWidgetId, views)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        // Planifie une alarme exacte à minuit (heure locale) pour rafraîchir la citation
        fun scheduleMidnightAlarm(context: Context) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

            // Calculer le prochain minuit
            val midnight = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 5) // 5s après minuit pour laisser Android respirer
                set(Calendar.MILLISECOND, 0)
                if (before(Calendar.getInstance())) {
                    add(Calendar.DAY_OF_YEAR, 1)
                }
            }

            val intent = Intent(context, IdeeDuJourWidgetProvider::class.java).apply {
                action = ACTION_MIDNIGHT
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                1001,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            // setExactAndAllowWhileIdle garantit le déclenchement même en mode Doze
            alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                midnight.timeInMillis,
                pendingIntent
            )
        }

        fun cancelMidnightAlarm(context: Context) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(context, IdeeDuJourWidgetProvider::class.java).apply {
                action = ACTION_MIDNIGHT
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                1001,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            alarmManager.cancel(pendingIntent)
        }
    }
}
`;

// ─── Layout XML ────────────────────────────────────────────────────────────────
// IMPORTANT : RemoteViews sur Android supporte uniquement :
// FrameLayout, LinearLayout, RelativeLayout, GridLayout
// AnalogClock, Button, Chronometer, ImageButton, ImageView, ProgressBar,
// TextView, ViewFlipper, ListView, GridView, StackView, AdapterViewFlipper
// Attributs INTERDITS dans les widgets : fontFamily, letterSpacing,
// lineSpacingMultiplier, alpha (XML), View séparateur standalone

const WIDGET_LAYOUT_XML = `<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/widget_root"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@drawable/widget_background"
    android:padding="14dp">

    <!-- Titre en haut -->
    <TextView
        android:id="@+id/widget_title"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_alignParentTop="true"
        android:layout_alignParentStart="true"
        android:text="L'idee du jour"
        android:textColor="#FFFFFF"
        android:textSize="13sp"
        android:textStyle="bold" />

    <!-- Séparateur horizontal simulé avec un TextView vide -->
    <TextView
        android:id="@+id/widget_divider"
        android:layout_width="match_parent"
        android:layout_height="1dp"
        android:layout_below="@id/widget_title"
        android:layout_marginTop="6dp"
        android:background="#66FFFFFF"
        android:text="" />

    <!-- Citation (zone principale) -->
    <TextView
        android:id="@+id/widget_quote"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_below="@id/widget_divider"
        android:layout_above="@id/widget_footer"
        android:layout_marginTop="8dp"
        android:layout_marginBottom="4dp"
        android:text="Lire, c'est voyager sans bouger de sa chaise."
        android:textColor="#FFFFFF"
        android:textSize="11sp"
        android:maxLines="4"
        android:ellipsize="end" />

    <!-- Footer -->
    <TextView
        android:id="@+id/widget_footer"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_alignParentBottom="true"
        android:text="Summshine - Citation du jour"
        android:textColor="#CCFFFFFF"
        android:textSize="9sp"
        android:gravity="end" />

</RelativeLayout>
`;

// ─── Dégradé arrière-plan ──────────────────────────────────────────────────────

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

// ─── Widget metadata ───────────────────────────────────────────────────────────

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
    android:previewImage="@mipmap/ic_launcher"
    android:resizeMode="none" />
`;

// ─── Helper écriture fichiers ──────────────────────────────────────────────────

function writeFileInProject(projectRoot, relativePath, content) {
  const fullPath = path.join(projectRoot, "android", relativePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content, "utf8");
  console.log(`[withAndroidWidget] Wrote: ${relativePath}`);
}

// ─── Plugin : fichiers natifs ──────────────────────────────────────────────────

const withAndroidWidgetFiles = (config) => {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const pkg = "app/coverscan";

      writeFileInProject(
        projectRoot,
        `app/src/main/java/${pkg}/IdeeDuJourWidgetProvider.kt`,
        WIDGET_PROVIDER_KOTLIN
      );

      writeFileInProject(
        projectRoot,
        "app/src/main/res/layout/widget_idee_du_jour.xml",
        WIDGET_LAYOUT_XML
      );

      writeFileInProject(
        projectRoot,
        "app/src/main/res/drawable/widget_background.xml",
        WIDGET_BACKGROUND_XML
      );

      writeFileInProject(
        projectRoot,
        "app/src/main/res/xml/widget_idee_du_jour_info.xml",
        WIDGET_INFO_XML
      );

      return config;
    },
  ]);
};

// ─── Plugin : AndroidManifest ──────────────────────────────────────────────────

const withAndroidWidgetManifest = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const application = manifest.manifest.application?.[0];

    if (!application) return config;

    const receivers = application.receiver || [];
    const alreadyAdded = receivers.some(
      (r) => r.$?.["android:name"] === "app.coverscan.IdeeDuJourWidgetProvider"
    );

    if (!alreadyAdded) {
      application.receiver = [
        ...receivers,
        {
          $: {
            "android:name": "app.coverscan.IdeeDuJourWidgetProvider",
            "android:label": "L'idee du jour",
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
                {
                  $: {
                    "android:name": "app.coverscan.WIDGET_MIDNIGHT_UPDATE",
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
        },
      ];
      console.log("[withAndroidWidget] Receiver added to AndroidManifest.xml");
    }

    return config;
  });
};

// ─── Export ────────────────────────────────────────────────────────────────────

module.exports = (config) => {
  config = withAndroidWidgetFiles(config);
  config = withAndroidWidgetManifest(config);
  return config;
};
