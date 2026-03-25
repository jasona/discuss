import { prisma } from "@/lib/db";
import { PLAN_LIMITS, type PlanType } from "@/lib/constants";

async function getOrgPlan(orgId: string): Promise<PlanType> {
  const subscription = await prisma.subscription.findFirst({
    where: { orgId },
    select: { plan: true },
  });
  return (subscription?.plan || "free") as PlanType;
}

export async function checkUserLimit(
  orgId: string
): Promise<{ allowed: boolean; current: number; max: number }> {
  const plan = await getOrgPlan(orgId);
  const limits = PLAN_LIMITS[plan];
  const current = await prisma.orgMember.count({ where: { orgId } });

  return {
    allowed: current < limits.maxUsers,
    current,
    max: limits.maxUsers,
  };
}

export async function checkSpaceLimit(
  orgId: string
): Promise<{ allowed: boolean; current: number; max: number }> {
  const plan = await getOrgPlan(orgId);
  const limits = PLAN_LIMITS[plan];
  const current = await prisma.space.count({
    where: { orgId, isArchived: false },
  });

  return {
    allowed: current < limits.maxSpaces,
    current,
    max: limits.maxSpaces,
  };
}

export async function checkStorageLimit(
  orgId: string
): Promise<{ allowed: boolean; max: number }> {
  const plan = await getOrgPlan(orgId);
  const limits = PLAN_LIMITS[plan];

  // Storage tracking would require summing uploaded file sizes.
  // For MVP, just return the limit — actual enforcement happens at upload time.
  return {
    allowed: true,
    max: limits.storageBytes,
  };
}

export async function checkExternalShareLimit(
  orgId: string
): Promise<{ allowed: boolean; current: number; max: number }> {
  const plan = await getOrgPlan(orgId);
  const limits = PLAN_LIMITS[plan];
  const current = await prisma.page.count({
    where: { orgId, isExternallyShared: true },
  });

  return {
    allowed: current < limits.maxExternalShares,
    current,
    max: limits.maxExternalShares,
  };
}

export async function getLimitWarnings(
  orgId: string
): Promise<string[]> {
  const warnings: string[] = [];

  const [userLimit, spaceLimit, shareLimit] = await Promise.all([
    checkUserLimit(orgId),
    checkSpaceLimit(orgId),
    checkExternalShareLimit(orgId),
  ]);

  if (
    userLimit.max !== Infinity &&
    userLimit.current >= userLimit.max * 0.8
  ) {
    warnings.push(
      `You're using ${userLimit.current} of ${userLimit.max} team members`
    );
  }

  if (
    spaceLimit.max !== Infinity &&
    spaceLimit.current >= spaceLimit.max * 0.8
  ) {
    warnings.push(
      `You're using ${spaceLimit.current} of ${spaceLimit.max} spaces`
    );
  }

  if (
    shareLimit.max !== Infinity &&
    shareLimit.max > 0 &&
    shareLimit.current >= shareLimit.max * 0.8
  ) {
    warnings.push(
      `You're using ${shareLimit.current} of ${shareLimit.max} external shares`
    );
  }

  return warnings;
}
