export const PLAN_IDS = ["free", "pro"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export const FREE_LIMITS = {
  activities: 6,
  skills: 8,
  historyDays: 30,
  workspaces: 1,
} as const;

export const PRO_PRICE = {
  monthlyCad: 12,
  displayEn: "$12 CAD / month",
  displayFr: "12 $ CA / mois",
} as const;

export type PlanCode =
  | "ACTIVITY_LIMIT"
  | "SKILL_LIMIT"
  | "HISTORY_LIMIT"
  | "CAPITAL_PRO"
  | "SEASON_PRO"
  | "RATE_PRO"
  | "YEAR_PRO"
  | "WORKSPACE_LIMIT";

export type PlanSnapshot = {
  plan: PlanId;
  isPro: boolean;
  limits: {
    activities: number | null;
    skills: number | null;
    historyDays: number | null;
    workspaces: number | null;
  };
  usage: {
    activities: number;
    skills: number;
    workspaces: number;
  };
  features: {
    capital: boolean;
    seasons: boolean;
    yearHistory: boolean;
    hourlyRate: boolean;
    unlimited: boolean;
  };
  billing: {
    provider: "stripe";
    status: "coming_soon";
  };
};

export function isPlanId(value: string | null | undefined): value is PlanId {
  return value === "free" || value === "pro";
}

export function normalizePlan(value: string | null | undefined): PlanId {
  return value === "pro" ? "pro" : "free";
}

export function isPro(plan: string | null | undefined): boolean {
  return normalizePlan(plan) === "pro";
}

export function buildPlanSnapshot(input: {
  plan: string | null | undefined;
  activities: number;
  skills: number;
  workspaces: number;
}): PlanSnapshot {
  const plan = normalizePlan(input.plan);
  const pro = plan === "pro";

  return {
    plan,
    isPro: pro,
    limits: {
      activities: pro ? null : FREE_LIMITS.activities,
      skills: pro ? null : FREE_LIMITS.skills,
      historyDays: pro ? null : FREE_LIMITS.historyDays,
      workspaces: pro ? null : FREE_LIMITS.workspaces,
    },
    usage: {
      activities: input.activities,
      skills: input.skills,
      workspaces: input.workspaces,
    },
    features: {
      capital: pro,
      seasons: pro,
      yearHistory: pro,
      hourlyRate: pro,
      unlimited: pro,
    },
    billing: {
      provider: "stripe",
      status: "coming_soon",
    },
  };
}

export function atFreeActivityLimit(snapshot: PlanSnapshot): boolean {
  return !snapshot.isPro && snapshot.usage.activities >= FREE_LIMITS.activities;
}

export function atFreeSkillLimit(snapshot: PlanSnapshot): boolean {
  return !snapshot.isPro && snapshot.usage.skills >= FREE_LIMITS.skills;
}
