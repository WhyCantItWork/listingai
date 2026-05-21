import { createClient } from "@/lib/supabase/server"

export type Tier = "free" | "pro" | "lister" | "team"

export async function getUserTier(): Promise<{ tier: Tier; userId: string | null; email: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { tier: "free", userId: null, email: null }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tier")
    .eq("id", user.id)
    .single()

  return {
    tier: (profile?.tier as Tier) || "free",
    userId: user.id,
    email: user.email || null,
  }
}

export function isPaidTier(tier: Tier): boolean {
  return tier === "pro" || tier === "lister" || tier === "team"
}

export function hasAdvancedFeatures(tier: Tier): boolean {
  return tier === "lister" || tier === "team"
}
