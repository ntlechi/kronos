import type { BurnoutStatus } from "@/lib/types";

/** Recharge should be at least 20% of Deep Work minutes (80/20 health floor). */
export const RECHARGE_THRESHOLD_PERCENT = 20;

export function evaluateBurnout(
  deepMinutes: number,
  rechargeMinutes: number,
): BurnoutStatus {
  if (deepMinutes <= 0) {
    return {
      level: "ok",
      messageKey: "burnout.none",
      rechargePercentOfDeep: 100,
      thresholdPercent: RECHARGE_THRESHOLD_PERCENT,
    };
  }

  const rechargePercentOfDeep = (rechargeMinutes / deepMinutes) * 100;

  if (rechargePercentOfDeep < RECHARGE_THRESHOLD_PERCENT * 0.5) {
    return {
      level: "critical",
      messageKey: "burnout.critical",
      rechargePercentOfDeep,
      thresholdPercent: RECHARGE_THRESHOLD_PERCENT,
    };
  }

  if (rechargePercentOfDeep < RECHARGE_THRESHOLD_PERCENT) {
    return {
      level: "watch",
      messageKey: "burnout.watch",
      rechargePercentOfDeep,
      thresholdPercent: RECHARGE_THRESHOLD_PERCENT,
    };
  }

  return {
    level: "ok",
    messageKey: "burnout.ok",
    rechargePercentOfDeep,
    thresholdPercent: RECHARGE_THRESHOLD_PERCENT,
  };
}
