import { getUserTier, hasAdvancedFeatures } from "@/lib/get-user-tier"
import { UpgradeRequired } from "@/components/upgrade-required"
import { ABTestClient } from "./client"

export default async function ABTestPage() {
  const { tier } = await getUserTier()

  if (!hasAdvancedFeatures(tier)) {
    return <UpgradeRequired feature="A/B Testing" requiredTier="Lister" />

  }

  return <ABTestClient />
}
