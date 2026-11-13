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
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Shader
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

        // Génère un Bitmap avec dégradé arrondi aux couleurs du thème utilisateur
        private fun makeGradientBitmap(w: Int, h: Int, c0: Int, c1: Int, c2: Int): Bitmap {
            val bmp = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bmp)
            val paint = Paint(Paint.ANTI_ALIAS_FLAG)
            // Dégradé diagonal (haut-gauche → bas-droite) avec 3 couleurs
            paint.shader = LinearGradient(
                0f, 0f, w.toFloat(), h.toFloat(),
                intArrayOf(c0, c1, c2),
                floatArrayOf(0f, 0.5f, 1f),
                Shader.TileMode.CLAMP
            )
            val radius = (20 * w / 320f) // ~20dp adaptatif
            canvas.drawRoundRect(RectF(0f, 0f, w.toFloat(), h.toFloat()), radius, radius, paint)
            return bmp
        }

        // Lit les couleurs depuis SharedPreferences (écrit par WidgetThemeModule depuis React Native)
        private fun getThemeColors(context: Context): Triple<Int, Int, Int> {
            val prefs = context.getSharedPreferences("widget_theme", Context.MODE_PRIVATE)
            val g0 = prefs.getString("gradient0", "#FF6B35") ?: "#FF6B35"
            val g1 = prefs.getString("gradient1", "#D63B6E") ?: "#D63B6E"
            val g2 = prefs.getString("gradient2", "#8B1A8B") ?: "#8B1A8B"
            return try {
                Triple(Color.parseColor(g0), Color.parseColor(g1), Color.parseColor(g2))
            } catch (e: Exception) {
                Triple(Color.parseColor("#FF6B35"), Color.parseColor("#D63B6E"), Color.parseColor("#8B1A8B"))
            }
        }

        fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            try {
                val views = RemoteViews(context.packageName, R.layout.widget_idee_du_jour)
                val dayOfYear = Calendar.getInstance().get(Calendar.DAY_OF_YEAR)
                val full = QUOTES[dayOfYear % QUOTES.size]

                // Séparer citation et auteur sur " — "
                val parts = full.split(" — ", limit = 2)
                val quoteText = if (parts.size == 2) parts[0] else full
                val authorText = if (parts.size == 2) "— ${parts[1]}" else ""

                views.setTextViewText(R.id.widget_quote, quoteText)
                views.setTextViewText(R.id.widget_author, authorText)

                // Appliquer le dégradé aux couleurs du thème utilisateur
                val (c0, c1, c2) = getThemeColors(context)
                val options = appWidgetManager.getAppWidgetOptions(appWidgetId)
                val w = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH, 320)
                val h = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 180)
                val widthPx = (w * context.resources.displayMetrics.density).toInt().coerceAtLeast(320)
                val heightPx = (h * context.resources.displayMetrics.density).toInt().coerceAtLeast(160)
                val bmp = makeGradientBitmap(widthPx, heightPx, c0, c1, c2)
                views.setImageViewBitmap(R.id.widget_bg, bmp)

                // Clic sur le widget → ouvre l'app
                val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
                if (launchIntent != null) {
                    launchIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    val pendingIntent = PendingIntent.getActivity(
                        context, 0, launchIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                    views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)
                }

                appWidgetManager.updateAppWidget(appWidgetId, views)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        fun scheduleMidnightAlarm(context: Context) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val midnight = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 5)
                set(Calendar.MILLISECOND, 0)
                if (before(Calendar.getInstance())) add(Calendar.DAY_OF_YEAR, 1)
            }
            val intent = Intent(context, IdeeDuJourWidgetProvider::class.java).apply {
                action = ACTION_MIDNIGHT
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context, 1001, intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, midnight.timeInMillis, pendingIntent)
        }

        fun cancelMidnightAlarm(context: Context) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(context, IdeeDuJourWidgetProvider::class.java).apply {
                action = ACTION_MIDNIGHT
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context, 1001, intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            alarmManager.cancel(pendingIntent)
        }
    }
}
`;

// ─── Layout XML ────────────────────────────────────────────────────────────────

const WIDGET_LAYOUT_XML = `<?xml version="1.0" encoding="utf-8"?>
<FrameLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/widget_root"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <!-- Background dynamique : ImageView rempli par le Bitmap dégradé du thème -->
    <ImageView
        android:id="@+id/widget_bg"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:scaleType="fitXY" />

    <!-- Grand guillemet décoratif -->
    <TextView
        android:id="@+id/widget_deco"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="top|end"
        android:layout_marginTop="-4dp"
        android:layout_marginEnd="8dp"
        android:text="&quot;"
        android:textColor="#22FFFFFF"
        android:textSize="96sp"
        android:textStyle="bold" />

    <!-- Contenu principal -->
    <LinearLayout
        android:id="@+id/widget_content"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:orientation="vertical"
        android:padding="14dp"
        android:gravity="center_vertical">

        <!-- En-tête -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:gravity="center_vertical">

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="&#9670;"
                android:textColor="#FFE0CC"
                android:textSize="8sp"
                android:layout_marginEnd="6dp" />

            <TextView
                android:id="@+id/widget_title"
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:text="L'idee du jour"
                android:textColor="#FFE0CC"
                android:textSize="11sp"
                android:textStyle="bold" />

        </LinearLayout>

        <!-- Séparateur court -->
        <TextView
            android:id="@+id/widget_divider"
            android:layout_width="40dp"
            android:layout_height="2dp"
            android:layout_marginTop="8dp"
            android:layout_marginBottom="10dp"
            android:background="#80FFFFFF"
            android:text="" />

        <!-- Citation -->
        <TextView
            android:id="@+id/widget_quote"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text="Lire, c'est voyager sans bouger de sa chaise."
            android:textColor="#FFFFFF"
            android:textSize="13sp"
            android:textStyle="bold"
            android:maxLines="3"
            android:ellipsize="end" />

        <!-- Auteur -->
        <TextView
            android:id="@+id/widget_author"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="6dp"
            android:text=""
            android:textColor="#CCFFFFFF"
            android:textSize="10sp"
            android:maxLines="1"
            android:ellipsize="end" />

    </LinearLayout>

</FrameLayout>
`;

// ─── Dégradé arrière-plan ──────────────────────────────────────────────────────

const WIDGET_BACKGROUND_XML = `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">

    <gradient
        android:startColor="#FF6B35"
        android:centerColor="#D63B6E"
        android:endColor="#8B1A8B"
        android:angle="135"
        android:type="linear" />

    <corners android:radius="20dp" />

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
