export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Conditions Générales de Vente – Summshine</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #FFF8F0;
      color: #3E2723;
      padding: 32px 20px;
      max-width: 720px;
      margin: 0 auto;
      line-height: 1.7;
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      color: #E64A19;
      margin-bottom: 8px;
    }
    .subtitle {
      font-size: 14px;
      color: #8D6E63;
      margin-bottom: 36px;
    }
    h2 {
      font-size: 17px;
      font-weight: 700;
      color: #3E2723;
      margin-top: 28px;
      margin-bottom: 10px;
    }
    p, li {
      font-size: 15px;
      color: #5D4037;
      margin-bottom: 8px;
    }
    ul { padding-left: 20px; }
    a { color: #E64A19; }
    .footer {
      margin-top: 48px;
      padding-top: 20px;
      border-top: 1px solid #E8D5C4;
      font-size: 13px;
      color: #8D6E63;
    }
  </style>
</head>
<body>
  <h1>Conditions Générales de Vente</h1>
  <p class="subtitle">Summshine – Dernière mise à jour : novembre 2026</p>

  <h2>1. Objet</h2>
  <p>Les présentes Conditions Générales de Vente (CGV) régissent les achats effectués dans l'application Summshine, notamment les abonnements Premium proposés via le Play Store (Google) et l'App Store (Apple).</p>

  <h2>2. Éditeur</h2>
  <p>L'application Summshine est éditée par un développeur indépendant. Pour toute question, contactez-nous à : <a href="mailto:support@summshine.app">support@summshine.app</a></p>

  <h2>3. Produits et tarifs</h2>
  <p>Summshine propose les abonnements suivants :</p>
  <ul>
    <li><strong>Mensuel</strong> : accès Premium mensuel, renouvelé automatiquement</li>
    <li><strong>Annuel</strong> : accès Premium annuel, renouvelé automatiquement</li>
    <li><strong>À vie</strong> : accès Premium permanent, paiement unique</li>
  </ul>
  <p>Les prix sont affichés dans l'application et incluent les taxes applicables. Les tarifs peuvent être modifiés à tout moment, sans effet sur les abonnements en cours.</p>

  <h2>4. Paiement</h2>
  <p>Les paiements sont traités exclusivement par Google Play ou Apple App Store. Summshine n'a pas accès à vos informations de paiement. Les achats sont soumis aux conditions de la plateforme utilisée.</p>

  <h2>5. Résiliation et remboursement</h2>
  <p>Vous pouvez résilier votre abonnement à tout moment depuis les paramètres de votre compte Google Play ou App Store. L'accès Premium reste actif jusqu'à la fin de la période payée.</p>
  <p>Les remboursements sont gérés par Google ou Apple conformément à leurs politiques respectives. Aucun remboursement partiel n'est accordé pour une période entamée.</p>

  <h2>6. Droit de rétractation</h2>
  <p>Conformément à la réglementation en vigueur, vous disposez d'un droit de rétractation de 14 jours à compter de l'achat, sauf si vous avez expressément accepté la fourniture immédiate du service numérique.</p>

  <h2>7. Propriété intellectuelle</h2>
  <p>L'ensemble du contenu de l'application (design, textes, algorithmes, résumés générés) est la propriété exclusive de Summshine. Toute reproduction sans autorisation est interdite.</p>

  <h2>8. Responsabilité</h2>
  <p>Les résumés générés par Summshine sont produits par intelligence artificielle à titre informatif. Summshine ne garantit pas l'exactitude ou l'exhaustivité des contenus générés.</p>

  <h2>9. Droit applicable</h2>
  <p>Les présentes CGV sont soumises au droit français. Tout litige sera soumis aux tribunaux compétents de France.</p>

  <div class="footer">
    <p>© 2026 Summshine. Tous droits réservés.</p>
  </div>
</body>
</html>`);
}
