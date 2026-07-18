export const ACTIVITY_CATEGORIES = [
  "DEEP_WORK",
  "SHALLOW_WORK",
  "RECHARGE",
] as const;

export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];

export const PROJECT_KINDS = ["brand", "personal", "lifestyle"] as const;
export type ProjectKind = (typeof PROJECT_KINDS)[number];

export const TIME_SOURCES = ["manual", "stopwatch", "pomodoro"] as const;
export type TimeSource = (typeof TIME_SOURCES)[number];

export type Period = "day" | "week" | "month" | "year";

export type ProjectBreakdown = {
  projectId: string;
  name: string;
  color: string;
  kind: string;
  hours: number;
  /** Share of total logged minutes in the period (0–100). */
  percentOfTotal: number;
  expenseCents: number;
  /** Optional: hours × user-set hourly rate. Not real cash. */
  estimatedTimeValueCents: number;
  hourlyRateCents: number | null;
  deepMinutes: number;
  shallowMinutes: number;
  rechargeMinutes: number;
};

export type DashboardSummary = {
  period: Period;
  rangeStart: string;
  rangeEnd: string;
  totalMinutes: number;
  totalHours: number;
  totalExpenseCents: number;
  deepMinutes: number;
  shallowMinutes: number;
  rechargeMinutes: number;
  rechargeRatio: number;
  burnout: BurnoutStatus;
  contextSwitches: number;
  projects: ProjectBreakdown[];
  skills: SkillProgress[];
};

export type BurnoutStatus = {
  level: "ok" | "watch" | "critical";
  messageKey: "burnout.none" | "burnout.ok" | "burnout.watch" | "burnout.critical";
  rechargePercentOfDeep: number;
  thresholdPercent: number;
};

export type SkillProgress = {
  id: string;
  name: string;
  xp: number;
  level: number;
  xpToNext: number;
  progressPercent: number;
};
