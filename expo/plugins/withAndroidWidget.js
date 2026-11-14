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

        // Table complète des thèmes — dupliquée depuis appThemes.ts pour éviter tout pont JS
        // Format : themeName -> Triple(gradient0, gradient1, gradient2) en hex
        private val THEME_COLORS = mapOf(
            "orange"    to Triple("#FFA726", "#FF6B35", "#F44771"),
            "red"       to Triple("#FF4444", "#FF6B6B", "#FF9999"),
            "purple"    to Triple("#7B2FBE", "#9B4DCA", "#B06AE8"),
            "turquoise" to Triple("#00C9FF", "#22D3EE", "#67E8F9"),
            "pink"      to Triple("#FF3DA8", "#FF69B4", "#FF8FCE"),
            "yellow"    to Triple("#FFE55A", "#FFED7A", "#FFF59D"),
            "coral"     to Triple("#C4845A", "#D4906A", "#E4A880"),
            "lime"      to Triple("#A8E063", "#BEF77A", "#D4FF99"),
            "sunset"    to Triple("#FF5A8A", "#FF6B4A", "#FF9566"),
            "dreamy"    to Triple("#C9748F", "#A98BC4", "#8BA6D8"),
            "neon"      to Triple("#39FF14", "#AAFF00", "#00E5FF"),
            "flamingo"  to Triple("#E84393", "#FF6B6B", "#FF8C42"),
            "aurora"    to Triple("#FF9A3C", "#E879A0", "#D06ECC"),
            "ocean"     to Triple("#2E8B9A", "#4CBECC", "#A8E6CF"),
            "silver"    to Triple("#757575", "#9E9E9E", "#E0E0E0"),
            "gold"      to Triple("#B8860B", "#C9962A", "#F5D77E"),
            "tropical"  to Triple("#4158D0", "#C850C0", "#F64F8B"),
            "peach"     to Triple("#FFBB6C", "#FF8A65", "#F06292"),
            "velvet"    to Triple("#B5294E", "#D44B70", "#E87090"),
            "glacier"   to Triple("#00B4D8", "#00D4FF", "#90E8FF"),
            "galaxy"    to Triple("#6B35E8", "#9B5FFF", "#C89FFF"),
            "tartan"    to Triple("#CC1A1A", "#E03030", "#F05050"),
            "holo"      to Triple("#9B7FE8", "#B8A9E8", "#D4CCF5"),
            "arctic"    to Triple("#7B35E8", "#5B5FFF", "#00D4FF"),
            "lagoon"    to Triple("#0097B2", "#00B4D8", "#48CAE4"),
            "dev_logo"  to Triple("#F97C3C", "#FB8C00", "#FFA040"),
            "og_orange" to Triple("#FF5200", "#FF6A00", "#FF8533")
        )

        // Lit le nom du thème depuis SharedPreferences et retourne les 3 couleurs du gradient
        private fun getThemeColors(context: Context): Triple<Int, Int, Int> {
            val prefs = context.getSharedPreferences("widget_theme", Context.MODE_PRIVATE)
            val themeName = prefs.getString("theme_name", "orange") ?: "orange"
            val (h0, h1, h2) = THEME_COLORS[themeName] ?: THEME_COLORS["orange"]!!
            return try {
                Triple(Color.parseColor(h0), Color.parseColor(h1), Color.parseColor(h2))
            } catch (e: Exception) {
                Triple(Color.parseColor("#FFA726"), Color.parseColor("#FF6B35"), Color.parseColor("#F44771"))
            }
        }

        // Bitmap dégradé arrondi pour le fond du widget
        private fun makeGradientBitmap(w: Int, h: Int, c0: Int, c1: Int, c2: Int): Bitmap {
            val bmp = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bmp)
            val paint = Paint(Paint.ANTI_ALIAS_FLAG)
            paint.shader = LinearGradient(
                0f, 0f, w.toFloat(), h.toFloat(),
                intArrayOf(c0, c1, c2),
                floatArrayOf(0f, 0.5f, 1f),
                Shader.TileMode.CLAMP
            )
            val radius = (20 * w / 320f)
            canvas.drawRoundRect(RectF(0f, 0f, w.toFloat(), h.toFloat()), radius, radius, paint)
            return bmp
        }

        // Bitmap blanc semi-transparent arrondi pour le bloc citation
        private fun makeCardBitmap(w: Int, h: Int): Bitmap {
            val bmp = Bitmap.createBitmap(w.coerceAtLeast(1), h.coerceAtLeast(1), Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bmp)
            val paint = Paint(Paint.ANTI_ALIAS_FLAG)
            paint.color = 0xCCFFFFFF.toInt()
            val radius = (16 * w / 320f)
            canvas.drawRoundRect(RectF(0f, 0f, w.toFloat(), h.toFloat()), radius, radius, paint)
            return bmp
        }

        fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            try {
                val views = RemoteViews(context.packageName, R.layout.widget_idee_du_jour)
                val dayOfYear = Calendar.getInstance().get(Calendar.DAY_OF_YEAR)
                val full = QUOTES[dayOfYear % QUOTES.size]

                // Citation uniquement (sans auteur) pour lisibilité
                val quoteOnly = if (full.contains(" — ")) full.substringBefore(" — ") else full
                views.setTextViewText(R.id.widget_quote, quoteOnly)

                // Dimensions du widget
                val (c0, c1, c2) = getThemeColors(context)
                val options = appWidgetManager.getAppWidgetOptions(appWidgetId)
                val density = context.resources.displayMetrics.density
                val wDp = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH, 320)
                val hDp = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 180)
                val wPx = (wDp * density).toInt().coerceAtLeast(320)
                val hPx = (hDp * density).toInt().coerceAtLeast(160)

                // Fond dégradé
                views.setImageViewBitmap(R.id.widget_bg, makeGradientBitmap(wPx, hPx, c0, c1, c2))

                // Carte blanche pour la citation
                val cardW = (wPx * 0.92f).toInt()
                val cardH = (hPx * 0.52f).toInt()
                views.setImageViewBitmap(R.id.widget_card_bg, makeCardBitmap(cardW, cardH))

                // Clic → ouvre l'app
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

    <!-- Background dégradé dynamique (couleur du thème) -->
    <ImageView
        android:id="@+id/widget_bg"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:scaleType="fitXY" />

    <!-- Layout principal vertical -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:orientation="vertical"
        android:padding="10dp">

        <!-- EN-TÊTE : ampoule + séparateur + titre -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="0dp"
            android:layout_weight="1"
            android:orientation="horizontal"
            android:gravity="center_vertical"
            android:paddingStart="4dp">

            <!-- Ampoule (simulée en texte) -->
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="&#128161;"
                android:textSize="22sp" />

            <!-- Séparateur vertical blanc -->
            <TextView
                android:layout_width="2dp"
                android:layout_height="28dp"
                android:background="#AAFFFFFF"
                android:layout_marginStart="8dp"
                android:layout_marginEnd="10dp"
                android:text="" />

            <!-- Titre -->
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="L\'idee du jour"
                android:textColor="#FFFFFF"
                android:textSize="17sp"
                android:textStyle="bold" />

        </LinearLayout>

        <!-- BLOC CITATION avec fond blanc arrondi -->
        <FrameLayout
            android:layout_width="match_parent"
            android:layout_height="0dp"
            android:layout_weight="2.2"
            android:layout_marginBottom="2dp">

            <!-- Fond blanc arrondi (généré programmatiquement) -->
            <ImageView
                android:id="@+id/widget_card_bg"
                android:layout_width="match_parent"
                android:layout_height="match_parent"
                android:scaleType="fitXY" />

            <!-- Guillemet ouvrant -->
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_gravity="top|start"
                android:layout_margin="6dp"
                android:text="&#8220;"
                android:textColor="#CC333333"
                android:textSize="28sp"
                android:textStyle="bold" />

            <!-- Guillemet fermant -->
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_gravity="bottom|end"
                android:layout_margin="6dp"
                android:text="&#8221;"
                android:textColor="#CC333333"
                android:textSize="28sp"
                android:textStyle="bold" />

            <!-- Texte de la citation -->
            <TextView
                android:id="@+id/widget_quote"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:layout_gravity="center"
                android:layout_marginStart="28dp"
                android:layout_marginEnd="28dp"
                android:gravity="center"
                android:text="Le succes vient davantage de la constance que de la motivation."
                android:textColor="#222222"
                android:textSize="12sp"
                android:textStyle="bold"
                android:maxLines="3"
                android:ellipsize="end" />

        </FrameLayout>

        <!-- BAS : soleil centré -->
        <TextView
            android:layout_width="match_parent"
            android:layout_height="0dp"
            android:layout_weight="0.6"
            android:text="&#127774;"
            android:textSize="16sp"
            android:gravity="center"
            android:textColor="#FFFFFF" />

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
