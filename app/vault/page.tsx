import { getUserTier, isPaidTier } from "@/lib/get-user-tier"
import { UpgradeRequired } from "@/components/upgrade-required"
import { VaultClient } from "./client"

export default async function VaultPage() {
  const { tier } = await getUserTier()

  if (!isPaidTier(tier)) {
    return <UpgradeRequired feature="Vault" />
  }

  return <VaultClient />
}
