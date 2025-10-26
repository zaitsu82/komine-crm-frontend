/**
 * 合祀管理の制限設定
 */

export const COLLECTIVE_BURIAL_LIMITS = {
  // 1つの合祀申込あたりの最大故人数
  MAX_PERSONS_PER_APPLICATION: 10,

  // 1つの区画あたりの最大合祀人数（累計）
  MAX_PERSONS_PER_PLOT: 50,

  // 合祀堂全体の最大収容人数
  MAX_TOTAL_CAPACITY: 500,

  // 警告を表示する閾値（％）
  WARNING_THRESHOLD: 80, // 80%で警告

  // 危険域の閾値（％）
  CRITICAL_THRESHOLD: 95, // 95%で危険警告
} as const;

export type CollectiveBurialLimits = typeof COLLECTIVE_BURIAL_LIMITS;

/**
 * 人数制限のステータスを判定
 */
export function getCapacityStatus(current: number, max: number): 'safe' | 'warning' | 'critical' | 'full' {
  const percentage = (current / max) * 100;

  if (current >= max) {
    return 'full';
  } else if (percentage >= COLLECTIVE_BURIAL_LIMITS.CRITICAL_THRESHOLD) {
    return 'critical';
  } else if (percentage >= COLLECTIVE_BURIAL_LIMITS.WARNING_THRESHOLD) {
    return 'warning';
  }

  return 'safe';
}

/**
 * 残り人数を計算
 */
export function getRemainingCapacity(current: number, max: number): number {
  return Math.max(0, max - current);
}

/**
 * 使用率を計算（％）
 */
export function getCapacityPercentage(current: number, max: number): number {
  return Math.min(100, Math.round((current / max) * 100));
}
