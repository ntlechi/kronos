import type { Locale } from "@/lib/i18n/dictionaries";
import {
  LEGAL_UPDATED,
  OPERATOR_NAME,
  OPERATOR_URL,
  PRIVACY_EMAIL,
  SITE_ORIGIN,
} from "@/lib/legal/contact";

export type LegalSection = { heading: string; body: string[] };

export type LegalDoc = {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

function privacyEn(): LegalDoc {
  return {
    title: "Privacy policy",
    updated: LEGAL_UPDATED,
    intro: `Kronos (${SITE_ORIGIN}) is an operator workspace operated by ${OPERATOR_NAME} (${OPERATOR_URL}) from Québec, Canada. This notice explains what we collect, why, and your rights under Québec’s Act 25 and Canada’s federal privacy rules. It is not legal advice.`,
    sections: [
      {
        heading: "What we collect",
        body: [
          "Account data: name, email, and a hashed password. We never store your password in plain text.",
          "Workspace data you enter: activities, time logs, skills, seasons, optional cash amounts, and focus preferences.",
          "Optional marketing: if you tick the Survive Backpacking & Kronos box, we send your name and email to Kit (ConvertKit) so we can email product news. The box is off by default.",
          "Technical data: session cookies for sign-in, and local settings (language, theme, ambient sound) in your browser.",
        ],
      },
      {
        heading: "Why we use it",
        body: [
          "To create and secure your isolated workspace, run the product, and prevent abuse.",
          "To email you only if you opted in. You can unsubscribe from any message.",
          "We do not sell personal information. We do not show advertising.",
        ],
      },
      {
        heading: "Who we share with (processors)",
        body: [
          "Vercel hosts the app. Neon hosts the database. Kit sends optional newsletters. Stripe will process Pro payments when checkout launches — not live today.",
          "These providers only process data to run Kronos. Survive Backpacking is a sister site we may mention; checking the box can add you to a shared Kit list.",
        ],
      },
      {
        heading: "Retention and security",
        body: [
          "We keep account and workspace data while your account is open. You can ask us to delete it.",
          "We use HTTPS, hashed passwords, and tenant isolation so one workspace cannot read another.",
        ],
      },
      {
        heading: "Your rights (Québec Act 25)",
        body: [
          "You may request access to, correction of, or deletion of your personal information, and withdraw marketing consent at any time.",
          "Write to the privacy officer at " +
            PRIVACY_EMAIL +
            ". We aim to reply within 30 days. You may also contact the Commission d’accès à l’information du Québec.",
        ],
      },
      {
        heading: "Contact",
        body: [
          `Privacy officer: ${PRIVACY_EMAIL}`,
          `Operator: ${OPERATOR_NAME} — ${OPERATOR_URL}`,
        ],
      },
    ],
  };
}

function privacyFr(): LegalDoc {
  return {
    title: "Politique de confidentialité",
    updated: LEGAL_UPDATED,
    intro: `Kronos (${SITE_ORIGIN}) est un espace opérateur exploité par ${OPERATOR_NAME} (${OPERATOR_URL}) au Québec, Canada. Cette notice décrit ce que nous collectons, pourquoi, et tes droits selon la Loi 25 du Québec et les règles fédérales canadiennes. Ce n’est pas un avis juridique.`,
    sections: [
      {
        heading: "Ce que nous collectons",
        body: [
          "Compte : nom, courriel, et un mot de passe haché. Nous ne stockons jamais le mot de passe en clair.",
          "Données d’espace que tu saisis : activités, journaux de temps, compétences, saisons, montants optionnels, préférences de focus.",
          "Marketing optionnel : si tu coches la case Survive Backpacking & Kronos, nous envoyons ton nom et courriel à Kit (ConvertKit) pour des nouvelles produit. La case est décochée par défaut.",
          "Données techniques : cookies de session pour la connexion, et réglages locaux (langue, thème, ambiance) dans ton navigateur.",
        ],
      },
      {
        heading: "Pourquoi nous les utilisons",
        body: [
          "Pour créer et sécuriser ton espace isolé, faire fonctionner le produit, et prévenir les abus.",
          "Pour t’écrire seulement si tu as consenti. Tu peux te désabonner de chaque message.",
          "Nous ne vendons pas de renseignements personnels. Nous n’affichons pas de publicité.",
        ],
      },
      {
        heading: "Avec qui nous partageons (fournisseurs)",
        body: [
          "Vercel héberge l’app. Neon héberge la base. Kit envoie les infolettres optionnelles. Stripe traitera les paiements Pro quand le paiement sera lancé — pas encore en ligne.",
          "Ces fournisseurs traitent les données uniquement pour Kronos. Survive Backpacking est un site sœur ; la case peut t’ajouter à une liste Kit partagée.",
        ],
      },
      {
        heading: "Conservation et sécurité",
        body: [
          "Nous gardons le compte et l’espace tant que le compte est ouvert. Tu peux demander la suppression.",
          "Nous utilisons HTTPS, des mots de passe hachés, et l’isolation des locataires.",
        ],
      },
      {
        heading: "Tes droits (Loi 25, Québec)",
        body: [
          "Tu peux demander l’accès, la rectification ou la suppression de tes renseignements, et retirer le consentement marketing en tout temps.",
          "Écris au responsable de la protection des renseignements à " +
            PRIVACY_EMAIL +
            ". Nous visons une réponse en 30 jours. Tu peux aussi joindre la Commission d’accès à l’information du Québec.",
        ],
      },
      {
        heading: "Contact",
        body: [
          `Responsable de la confidentialité : ${PRIVACY_EMAIL}`,
          `Exploitant : ${OPERATOR_NAME} — ${OPERATOR_URL}`,
        ],
      },
    ],
  };
}

function termsEn(): LegalDoc {
  return {
    title: "Terms of use",
    updated: LEGAL_UPDATED,
    intro: `By creating a Kronos account you agree to these terms. Kronos is a productivity workspace at ${SITE_ORIGIN}, operated by ${OPERATOR_NAME}.`,
    sections: [
      {
        heading: "The service",
        body: [
          "Kronos lets you log time, skills, recharge, and optional capital across activities. Free plans have limits (activities, skills, history). Pro features are previewed; paid checkout is not live yet.",
          "The service is provided “as is.” We aim for reliability but do not guarantee uninterrupted access.",
        ],
      },
      {
        heading: "Your account",
        body: [
          "You must provide a real email and keep your password secret. You are responsible for activity in your workspace.",
          "One person, one account unless we agree otherwise. Do not use Kronos for unlawful content or to attack the service.",
        ],
      },
      {
        heading: "Your data",
        body: [
          "You own the content you log. You grant us a limited licence to host it so the product works.",
          "Privacy details are in the Privacy policy. Marketing email is optional and CASL-compliant (opt-in).",
        ],
      },
      {
        heading: "Liability",
        body: [
          "Kronos is a self-tracking tool, not professional legal, medical, or financial advice. To the extent allowed by Québec law, we are not liable for lost profits or data beyond what we can reasonably restore.",
          "Nothing here limits rights you cannot waive as a consumer in Québec.",
        ],
      },
      {
        heading: "Changes and contact",
        body: [
          "We may update these terms. Continued use after a notice on this page means you accept the new version.",
          `Questions: ${PRIVACY_EMAIL}`,
        ],
      },
    ],
  };
}

function termsFr(): LegalDoc {
  return {
    title: "Conditions d’utilisation",
    updated: LEGAL_UPDATED,
    intro: `En créant un compte Kronos, tu acceptes ces conditions. Kronos est un espace de productivité à ${SITE_ORIGIN}, exploité par ${OPERATOR_NAME}.`,
    sections: [
      {
        heading: "Le service",
        body: [
          "Kronos permet de journaliser temps, compétences, recharge et capital optionnel. L’offre gratuite a des limites. Les fonctions Pro sont présentées ; le paiement n’est pas encore en ligne.",
          "Le service est fourni « tel quel ». Nous visons la fiabilité sans garantir un accès ininterrompu.",
        ],
      },
      {
        heading: "Ton compte",
        body: [
          "Tu fournis un vrai courriel et gardes ton mot de passe secret. Tu es responsable de l’activité dans ton espace.",
          "Un compte par personne, sauf entente. Pas d’usage illégal ni d’attaque du service.",
        ],
      },
      {
        heading: "Tes données",
        body: [
          "Tu restes propriétaire de ce que tu journalises. Tu nous accordes une licence limitée pour l’héberger.",
          "Les détails sont dans la politique de confidentialité. L’infolettre est optionnelle et conforme à la LCAP (opt-in).",
        ],
      },
      {
        heading: "Responsabilité",
        body: [
          "Kronos est un outil d’auto-suivi, pas un conseil juridique, médical ou financier. Dans la mesure permise par le droit québécois, nous ne sommes pas responsables des pertes de profits ou de données au-delà de ce que nous pouvons raisonnablement restaurer.",
          "Rien ici ne limite les droits auxquels un consommateur au Québec ne peut renoncer.",
        ],
      },
      {
        heading: "Changements et contact",
        body: [
          "Nous pouvons mettre à jour ces conditions. Continuer après un avis sur cette page vaut acceptation.",
          `Questions : ${PRIVACY_EMAIL}`,
        ],
      },
    ],
  };
}

export function getPrivacyDoc(locale: Locale): LegalDoc {
  return locale === "fr" ? privacyFr() : privacyEn();
}

export function getTermsDoc(locale: Locale): LegalDoc {
  return locale === "fr" ? termsFr() : termsEn();
}
