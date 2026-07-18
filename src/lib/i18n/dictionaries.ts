export type Locale = "en" | "fr";

export const LOCALES: Locale[] = ["en", "fr"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_STORAGE_KEY = "kronos-locale";

type Dict = Record<string, string>;

const en: Dict = {
  "brand.tagline": "Time · Capital · Skills · Recharge",
  "brand.badge": "Operator OS",

  "nav.pulse": "Pulse",
  "nav.log": "Log",
  "nav.focus": "Focus",
  "nav.activities": "Activities",
  "nav.skills": "Skills",

  "period.day": "Day",
  "period.week": "Week",
  "period.month": "Month",
  "period.year": "Year",

  "dashboard.quickLog": "Quick log",
  "dashboard.loading": "Loading pulse…",
  "dashboard.error":
    "Dashboard unavailable. Run migrations + seed, then refresh.",
  "dashboard.breakdownTitle": "Where your time goes",
  "dashboard.breakdownHint": "Share of logged hours",
  "dashboard.gaugeHelp":
    "Each gauge is that activity’s % of all time you logged this period. Biggest ring = where focus actually went.",
  "dashboard.ofTotal": "{percent}% of period",
  "dashboard.cashSpent": "{money} cash logged",
  "dashboard.mostTime": "Most time",
  "dashboard.skillsTitle": "Skill compounding",
  "dashboard.skillsHint": "XP from logged work",
  "dashboard.skillsFolded": "Tap to expand skills",
  "dashboard.emptyBreakdown":
    "No activities yet. Add brands under Activities, then log time.",

  "stat.totalWork": "Total time",
  "stat.totalWorkHint": "{hours}h logged",
  "stat.capitalOut": "Cash logged",
  "stat.capitalHint": "Money you entered on logs",
  "stat.deepShallow": "Deep / Shallow",
  "stat.deepShallowHint": "Focus vs ops",
  "stat.switches": "Switches",
  "stat.switchesHint": "Brain context flips",

  "burnout.title": "Burnout floor",
  "burnout.ratio": "{percent}% recharge / deep",
  "burnout.none":
    "No deep work logged yet — room to build without pressure.",
  "burnout.critical":
    "Recharge is critically low vs deep work. Dance, sport, or social — protect the operator.",
  "burnout.watch":
    "Recharge under 20% of deep work. Schedule recovery before the next sprint.",
  "burnout.ok": "Energy balance looks healthy. Keep the 80/20 floor.",

  "skill.level": "Lv {level}",
  "skill.xpProgress": "{xp} XP · {percent}% to level {next}",
  "skill.kind": "{kind}",
  "skill.spent": "{hours} · {money} spent",
  "skill.timeValue": " · ~{value} time value",
  "skill.hoursPerDollar": "{roi} h/$",

  "kind.brand": "brand",
  "kind.personal": "personal",
  "kind.lifestyle": "lifestyle",

  "log.title": "Quick log",
  "log.subtitle":
    "Pick an activity, set time + cash, done. Under two seconds when you switch contexts.",
  "log.activity": "Activity",
  "log.mode": "Mode",
  "log.mode.deep": "Deep",
  "log.mode.shallow": "Shallow",
  "log.mode.recharge": "Recharge",
  "log.time": "Time",
  "log.stopwatch": "Stopwatch",
  "log.customMinutes": "Custom minutes",
  "log.cash": "Cash spent",
  "log.note": "Note",
  "log.notePlaceholder": "Optional",
  "log.submit": "Log session",
  "log.saving": "Saving…",
  "log.logged": "Logged {minutes}m on {name}",
  "log.error": "Could not save. Check the API / database.",
  "log.loadError": "Could not load activities. Seed the DB first.",
  "log.skillsHint": "Skills that will gain XP",
  "log.skillsNone": "No skills linked — associate them under Skills.",

  "focus.title": "Focus timer",
  "focus.subtitle":
    "Adjustable pomodoro. Completed focus blocks auto-log as Deep Work.",
  "focus.phase.focus": "Focus",
  "focus.phase.break": "Break",
  "focus.cycle": "cycle {cycle}",
  "focus.start": "Start",
  "focus.pause": "Pause",
  "focus.reset": "Reset",
  "focus.logTo": "Log focus to",
  "focus.focusMin": "Focus (min)",
  "focus.breakMin": "Break (min)",
  "focus.longBreak": "Long break",
  "focus.cyclesLong": "Cycles → long",
  "focus.syncing": "Syncing…",
  "focus.logged": "Focus block logged · {minutes}m",

  "activities.title": "Activities",
  "activities.subtitle":
    "Brands, personal work, and lifestyle counters — anything you put time or money into.",
  "activities.new": "New activity",
  "activities.namePlaceholder": "Brand or lifestyle name",
  "activities.add": "Add",
  "activities.rename": "Name",
  "activities.edit": "Edit",
  "activities.save": "Save",
  "activities.added": "Activity added",
  "activities.renamed": "Renamed",
  "activities.saved": "Saved",
  "activities.createError": "Could not create activity",
  "activities.renameError": "Could not save",
  "activities.skills": "Skills",
  "activities.editSkills": "Skills",
  "activities.hourly": " · optional ${rate}/h rate",
  "activities.rateNone": "no $/h rate",
  "activities.rateLabel": "Optional rate ($/h)",
  "activities.ratePlaceholder": "Leave empty if unused",
  "activities.rateHelp":
    "Not calculated by the app. Only if you want a rough “time value” estimate (hours × rate). Real cash is what you type when logging.",
  "activities.rateInvalid": "Rate must be a positive number or empty.",
  "activities.financeTitle": "How finance works",
  "activities.financeHelp":
    "1) Time = minutes you log (source of truth for gauges). 2) Cash = money you enter on a log (ads, tools, materials). 3) $/h rate = optional label you set here — Kronos never invents it.",
  "activities.kind.brand": "Brand",
  "activities.kind.personal": "Personal",
  "activities.kind.lifestyle": "Lifestyle",

  "skills.title": "Skills",
  "skills.subtitle":
    "You own these. Create, rename, and link skills to the activities that practice them. Logging time on a linked activity compounds XP.",
  "skills.new": "New skill",
  "skills.namePlaceholder": "e.g. Frontend Engineering",
  "skills.add": "Add",
  "skills.rename": "Rename",
  "skills.save": "Save",
  "skills.delete": "Delete",
  "skills.added": "Skill added",
  "skills.renamed": "Renamed",
  "skills.deleted": "Skill deleted",
  "skills.createError": "Could not create skill",
  "skills.renameError": "Could not rename",
  "skills.deleteError": "Could not delete",
  "skills.deleteConfirm": "Delete this skill? XP history stays in past logs.",
  "skills.linkTitle": "Linked activities",
  "skills.linkHint": "Tap to toggle which activities feed this skill.",
  "skills.noActivities": "Create an activity first, then link it here.",
  "skills.empty": "No skills yet. Add the capabilities you want to compound.",
  "skills.linkedCount": "{count} activities",
  "skills.xp": "{xp} XP · level {level}",

  "locale.en": "EN",
  "locale.fr": "FR",
  "locale.switch": "Language",

  "brand.powered": "Powered by",
  "theme.toggle": "Toggle light / dark theme",

  "auth.email": "Email",
  "auth.password": "Password",
  "auth.name": "Name",
  "auth.working": "Working…",
  "auth.login.title": "Welcome back",
  "auth.login.subtitle": "Sign in to your operator workspace.",
  "auth.login.submit": "Sign in",
  "auth.login.cta": "Sign in",
  "auth.login.noAccount": "New here?",
  "auth.register.title": "Create your workspace",
  "auth.register.subtitle":
    "Each account gets an isolated multitenant space for brands, time, and skills.",
  "auth.register.submit": "Create account",
  "auth.register.cta": "Create account",
  "auth.register.hasAccount": "Already have an account?",
  "auth.marketing.title": "Email me Kronos updates via Kit",
  "auth.marketing.help":
    "Optional. Product news, free tools, and announcements — unsubscribe anytime.",
  "auth.error.invalid": "Invalid email or password.",
  "auth.error.exists": "That email is already registered.",
  "auth.error.register": "Could not create account. Try again.",
  "auth.error.signInAfterRegister":
    "Account created, but sign-in failed. Try logging in.",
  "auth.signOut": "Sign out",
};

const fr: Dict = {
  "brand.tagline": "Temps · Capital · Compétences · Recharge",
  "brand.badge": "OS Opérateur",

  "nav.pulse": "Pulse",
  "nav.log": "Journal",
  "nav.focus": "Focus",
  "nav.activities": "Activités",
  "nav.skills": "Compétences",

  "period.day": "Jour",
  "period.week": "Semaine",
  "period.month": "Mois",
  "period.year": "Année",

  "dashboard.quickLog": "Journal rapide",
  "dashboard.loading": "Chargement du pulse…",
  "dashboard.error":
    "Tableau indisponible. Lance les migrations + seed, puis rafraîchis.",
  "dashboard.breakdownTitle": "Où va ton temps",
  "dashboard.breakdownHint": "Part des heures journalisées",
  "dashboard.gaugeHelp":
    "Chaque jauge = % du temps total journalisé sur la période. Le plus gros anneau = là où ton focus est vraiment allé.",
  "dashboard.ofTotal": "{percent}% de la période",
  "dashboard.cashSpent": "{money} cash journalisé",
  "dashboard.mostTime": "Plus de temps",
  "dashboard.skillsTitle": "Compounding des compétences",
  "dashboard.skillsHint": "XP depuis le travail journalisé",
  "dashboard.skillsFolded": "Touche pour ouvrir les compétences",
  "dashboard.emptyBreakdown":
    "Aucune activité. Ajoute des marques sous Activités, puis journalise du temps.",

  "stat.totalWork": "Temps total",
  "stat.totalWorkHint": "{hours}h journalisées",
  "stat.capitalOut": "Cash journalisé",
  "stat.capitalHint": "Montants que tu as saisis",
  "stat.deepShallow": "Profond / Léger",
  "stat.deepShallowHint": "Focus vs ops",
  "stat.switches": "Changements",
  "stat.switchesHint": "Changements de contexte",

  "burnout.title": "Seuil burnout",
  "burnout.ratio": "{percent}% recharge / profond",
  "burnout.none":
    "Pas encore de travail profond — de la place pour construire sans pression.",
  "burnout.critical":
    "Recharge critique vs travail profond. Danse, sport ou social — protège l'opérateur.",
  "burnout.watch":
    "Recharge sous 20% du travail profond. Planifie de la récupération avant le prochain sprint.",
  "burnout.ok": "Équilibre énergétique sain. Garde le plancher 80/20.",

  "skill.level": "Niv. {level}",
  "skill.xpProgress": "{xp} XP · {percent}% vers niv. {next}",
  "skill.kind": "{kind}",
  "skill.spent": "{hours} · {money} dépensés",
  "skill.timeValue": " · ~{value} valeur temps",
  "skill.hoursPerDollar": "{roi} h/$",

  "kind.brand": "marque",
  "kind.personal": "personnel",
  "kind.lifestyle": "style de vie",

  "log.title": "Journal rapide",
  "log.subtitle":
    "Choisis une activité, temps + cash, terminé. Moins de deux secondes quand tu changes de contexte.",
  "log.activity": "Activité",
  "log.mode": "Mode",
  "log.mode.deep": "Profond",
  "log.mode.shallow": "Léger",
  "log.mode.recharge": "Recharge",
  "log.time": "Temps",
  "log.stopwatch": "Chrono",
  "log.customMinutes": "Minutes perso",
  "log.cash": "Cash dépensé",
  "log.note": "Note",
  "log.notePlaceholder": "Optionnel",
  "log.submit": "Journaliser",
  "log.saving": "Enregistrement…",
  "log.logged": "{minutes} min journalisées sur {name}",
  "log.error": "Impossible d'enregistrer. Vérifie l'API / la base.",
  "log.loadError": "Impossible de charger les activités. Seed la DB d'abord.",
  "log.skillsHint": "Compétences qui gagneront de l'XP",
  "log.skillsNone":
    "Aucune compétence liée — associe-les sous Compétences.",

  "focus.title": "Minuteur focus",
  "focus.subtitle":
    "Pomodoro ajustable. Les blocs focus terminés se journalisent en travail profond.",
  "focus.phase.focus": "Focus",
  "focus.phase.break": "Pause",
  "focus.cycle": "cycle {cycle}",
  "focus.start": "Démarrer",
  "focus.pause": "Pause",
  "focus.reset": "Réinitialiser",
  "focus.logTo": "Journaliser le focus sur",
  "focus.focusMin": "Focus (min)",
  "focus.breakMin": "Pause (min)",
  "focus.longBreak": "Longue pause",
  "focus.cyclesLong": "Cycles → longue",
  "focus.syncing": "Sync…",
  "focus.logged": "Bloc focus journalisé · {minutes} min",

  "activities.title": "Activités",
  "activities.subtitle":
    "Marques, travail perso et compteurs lifestyle — tout ce qui reçoit ton temps ou ton argent.",
  "activities.new": "Nouvelle activité",
  "activities.namePlaceholder": "Nom de marque ou lifestyle",
  "activities.add": "Ajouter",
  "activities.rename": "Nom",
  "activities.edit": "Modifier",
  "activities.save": "Sauver",
  "activities.added": "Activité ajoutée",
  "activities.renamed": "Renommée",
  "activities.saved": "Enregistré",
  "activities.createError": "Impossible de créer l'activité",
  "activities.renameError": "Impossible d'enregistrer",
  "activities.skills": "Compétences",
  "activities.editSkills": "Compétences",
  "activities.hourly": " · taux optionnel {rate} $/h",
  "activities.rateNone": "pas de taux $/h",
  "activities.rateLabel": "Taux optionnel ($/h)",
  "activities.ratePlaceholder": "Vide si inutilisé",
  "activities.rateHelp":
    "Pas calculé par l'app. Seulement si tu veux une estimation « valeur temps » (heures × taux). Le vrai cash, c'est ce que tu saisis en journalisant.",
  "activities.rateInvalid": "Le taux doit être un nombre positif ou vide.",
  "activities.financeTitle": "Comment marche la finance",
  "activities.financeHelp":
    "1) Temps = minutes que tu journalises (source des jauges). 2) Cash = argent saisi sur un log (ads, outils, matériaux). 3) Taux $/h = étiquette optionnelle que tu règles ici — Kronos ne l'invente jamais.",
  "activities.kind.brand": "Marque",
  "activities.kind.personal": "Personnel",
  "activities.kind.lifestyle": "Style de vie",

  "skills.title": "Compétences",
  "skills.subtitle":
    "Elles t'appartiennent. Crée, renomme et lie les compétences aux activités qui les pratiquent. Journaliser du temps sur une activité liée compound l'XP.",
  "skills.new": "Nouvelle compétence",
  "skills.namePlaceholder": "ex. Ingénierie frontend",
  "skills.add": "Ajouter",
  "skills.rename": "Renommer",
  "skills.save": "Sauver",
  "skills.delete": "Supprimer",
  "skills.added": "Compétence ajoutée",
  "skills.renamed": "Renommée",
  "skills.deleted": "Compétence supprimée",
  "skills.createError": "Impossible de créer la compétence",
  "skills.renameError": "Impossible de renommer",
  "skills.deleteError": "Impossible de supprimer",
  "skills.deleteConfirm":
    "Supprimer cette compétence ? L'historique XP reste dans les logs passés.",
  "skills.linkTitle": "Activités liées",
  "skills.linkHint":
    "Touche pour activer/désactiver les activités qui nourrissent cette compétence.",
  "skills.noActivities":
    "Crée d'abord une activité, puis lie-la ici.",
  "skills.empty":
    "Aucune compétence. Ajoute les capacités que tu veux compounder.",
  "skills.linkedCount": "{count} activités",
  "skills.xp": "{xp} XP · niveau {level}",

  "locale.en": "EN",
  "locale.fr": "FR",
  "locale.switch": "Langue",

  "brand.powered": "Propulsé par",
  "theme.toggle": "Basculer thème clair / sombre",

  "auth.email": "Courriel",
  "auth.password": "Mot de passe",
  "auth.name": "Nom",
  "auth.working": "En cours…",
  "auth.login.title": "Bon retour",
  "auth.login.subtitle": "Connecte-toi à ton espace opérateur.",
  "auth.login.submit": "Se connecter",
  "auth.login.cta": "Se connecter",
  "auth.login.noAccount": "Nouveau ici ?",
  "auth.register.title": "Crée ton espace",
  "auth.register.subtitle":
    "Chaque compte a un espace multilocataire isolé pour marques, temps et compétences.",
  "auth.register.submit": "Créer le compte",
  "auth.register.cta": "Créer un compte",
  "auth.register.hasAccount": "Tu as déjà un compte ?",
  "auth.marketing.title": "Reçois les updates Kronos via Kit",
  "auth.marketing.help":
    "Optionnel. Nouvelles produit, outils gratuits et annonces — désabonnement en un clic.",
  "auth.error.invalid": "Courriel ou mot de passe invalide.",
  "auth.error.exists": "Ce courriel est déjà inscrit.",
  "auth.error.register": "Impossible de créer le compte. Réessaie.",
  "auth.error.signInAfterRegister":
    "Compte créé, mais la connexion a échoué. Essaie de te connecter.",
  "auth.signOut": "Se déconnecter",
};

const dictionaries: Record<Locale, Dict> = { en, fr };

export type TranslationKey = keyof typeof en;

export function translate(
  locale: Locale,
  key: TranslationKey | string,
  vars?: Record<string, string | number>,
): string {
  const table = dictionaries[locale] ?? dictionaries.en;
  let text = table[key] ?? dictionaries.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll(`{${k}}`, String(v));
    }
  }
  return text;
}

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "fr";
}
