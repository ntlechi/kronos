import type { BurnoutStatus } from "@/lib/types";

/** Recharge should be at least 20% of Deep Work minutes (80/20 health floor). */
export const RECHARGE_THRESHOLD_PERCENT = 20;

export function evaluateBurnout(
  deepMinutes: number,
  rechargeMinutes: number,
): BurnoutStatus {
  const thresholdPercent = RECHARGE_THRESHOLD_PERCENT;
  const neededMinutes =
    deepMinutes > 0
      ? Math.ceil((deepMinutes * thresholdPercent) / 100)
      : 0;
  const deficitMinutes = Math.max(0, neededMinutes - rechargeMinutes);

  if (deepMinutes <= 0) {
    return {
      level: "ok",
      messageKey: "burnout.none",
      rechargePercentOfDeep: 100,
      thresholdPercent,
      deficitMinutes: 0,
      neededMinutes: 0,
    };
  }

  const rechargePercentOfDeep = (rechargeMinutes / deepMinutes) * 100;

  if (rechargePercentOfDeep < thresholdPercent * 0.5) {
    return {
      level: "critical",
      messageKey: "burnout.critical",
      rechargePercentOfDeep,
      thresholdPercent,
      deficitMinutes,
      neededMinutes,
    };
  }

  if (rechargePercentOfDeep < thresholdPercent) {
    return {
      level: "watch",
      messageKey: "burnout.watch",
      rechargePercentOfDeep,
      thresholdPercent,
      deficitMinutes,
      neededMinutes,
    };
  }

  return {
    level: "ok",
    messageKey: "burnout.ok",
    rechargePercentOfDeep,
    thresholdPercent,
    deficitMinutes: 0,
    neededMinutes,
  };
}
