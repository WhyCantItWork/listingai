import { getUserTier, hasCompliance } from "@/lib/get-user-tier"
import { UpgradeRequired } from "@/components/upgrade-required"
import { ComplianceClient } from "./client"

export default async function CompliancePage() {
  const { tier } = await getUserTier()

  if (!hasCompliance(tier)) {
    return <UpgradeRequired feature="Compliance Checker" requiredTier="Pro" />
  }

  return <ComplianceClient />
}
