'use client'
import { toast } from "sonner"
import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Crown, CreditCard, LogOut, Plus, Sparkles, CheckCircle2, X, Clock, TrendingUp, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"



type Tier = "free" | "pro" | "lister" | "team"

interface Profile {
  tier: Tier
  listings_used: number | null
  bonus_listings: number | null
  bonus_listings_expires_at: string | null
  bonus_vault_slots: number | null
  bonus_vault_expires_at: string | null
}

const TIER_LIMITS: Record<Tier, number | null> = {
  free: 5,
  pro: 100,
  lister: null,
  team: null,
}

const LISTING_TOPUPS = [
  {
    id: "50",
    label: "+50 Listings",
    price: "£9",
    description: "Adds 50 listings to your monthly allowance for 30 days",
    badge: null,
  },
  {
    id: "100",
    label: "+100 Listings",
    price: "£15",
    description: "Adds 100 listings to your monthly allowance for 30 days",
    badge: "Best value",
  },
]

const VAULT_TOPUPS = [
  {
    id: "vault-25",
    label: "+25 Vault Slots",
    price: "£5",
    description: "Adds 25 vault storage slots for 30 days",
    badge: null,
  },
]

function AccountPageContent() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [topupLoading, setTopupLoading] = useState<string | null>(null)
  const [showSuccessBanner, setShowSuccessBanner] = useState(false)
  const [showCancelBanner, setShowCancelBanner] = useState(false)
  const [vaultUsed, setVaultUsed] = useState(0)
  // Change email state
const [newEmail, setNewEmail] = useState("")
const [emailLoading, setEmailLoading] = useState(false)

// Change password state
const [currentPassword, setCurrentPassword] = useState("")
const [newPassword, setNewPassword] = useState("")
const [confirmPassword, setConfirmPassword] = useState("")
const [showCurrentPassword, setShowCurrentPassword] = useState(false)
const [showNewPassword, setShowNewPassword] = useState(false)
const [passwordLoading, setPasswordLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("topup") === "success") setShowSuccessBanner(true)
    if (searchParams.get("topup") === "cancelled") setShowCancelBanner(true)
  }, [searchParams])
useEffect(() => {
  const loadVaultCount = async () => {
    try {
      const res = await fetch("/api/vault")
      if (res.ok) {
        const data = await res.json()
        setVaultUsed((data.listings || []).length)
      }
    } catch {
      setVaultUsed(0)
    }
  }
  loadVaultCount()
}, [])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)
      const { data } = await supabase
        .from("profiles")
        .select("tier, listings_used, bonus_listings, bonus_listings_expires_at, bonus_vault_slots, bonus_vault_expires_at")
        .eq("id", user.id)
        .single()
      setProfile(data as Profile)
      setLoading(false)
    }
    load()
  }, [router])

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    const res = await fetch("/api/stripe/portal", { method: "POST" })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      alert(data.error || "Couldn't open billing portal")
      setPortalLoading(false)
    }
  }
const handleChangeEmail = async () => {
  if (!newEmail || !newEmail.includes("@")) {
    toast.error("Please enter a valid email address")
    return
  }
  if (newEmail === user?.email) {
    toast.error("That's already your email")
    return
  }

  setEmailLoading(true)
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ email: newEmail })

  if (error) {
    toast.error("Couldn't change email", { description: error.message })
    setEmailLoading(false)
    return
  }

  toast.success("Confirmation sent", {
    description: `Check ${newEmail} and click the confirmation link to finish the change.`,
    duration: 8000,
  })
  setNewEmail("")
  setEmailLoading(false)
}

const handleChangePassword = async () => {
  if (!currentPassword) {
    toast.error("Enter your current password")
    return
  }
  if (newPassword.length < 8) {
    toast.error("New password must be at least 8 characters")
    return
  }
  if (newPassword !== confirmPassword) {
    toast.error("New passwords don't match")
    return
  }
  if (newPassword === currentPassword) {
    toast.error("New password must be different from your current one")
    return
  }

  setPasswordLoading(true)
  const supabase = createClient()

  // First verify the current password by attempting a re-login
  if (!user?.email) {
    toast.error("Couldn't verify your account")
    setPasswordLoading(false)
    return
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (signInError) {
    toast.error("Current password is incorrect")
    setPasswordLoading(false)
    return
  }

  // Now update the password
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

  if (updateError) {
    toast.error("Couldn't change password", { description: updateError.message })
    setPasswordLoading(false)
    return
  }

  toast.success("Password changed", { description: "Use your new password next time you log in." })
  setCurrentPassword("")
  setNewPassword("")
  setConfirmPassword("")
  setPasswordLoading(false)
}

  const handleTopUp = async (topupId: string) => {
    setTopupLoading(topupId)
    const res = await fetch("/api/stripe/topup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topupId }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      alert(data.error || "Couldn't start checkout")
      setTopupLoading(null)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-muted-foreground">
        Loading account...
      </div>
    )
  }

  const tier = profile?.tier ?? "free"
  const baseLimit = TIER_LIMITS[tier]
  const listingsUsed = profile?.listings_used ?? 0
  const VAULT_CAPS: Record<Tier, number | null> = {
  free: 0,
  pro: 50,
  lister: null,
  team: null,
}
const baseVaultCap = VAULT_CAPS[tier]


  // Active bonus check (only count if not expired)
  const now = new Date()
  const bonusListingsValid =
    profile?.bonus_listings_expires_at && new Date(profile.bonus_listings_expires_at) > now
      ? profile.bonus_listings ?? 0
      : 0
  const bonusListingsExpiresIn = profile?.bonus_listings_expires_at
    ? Math.max(0, Math.ceil((new Date(profile.bonus_listings_expires_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  const totalLimit = baseLimit === null ? null : baseLimit + bonusListingsValid
  const remaining = totalLimit === null ? null : Math.max(0, totalLimit - listingsUsed)
  const bonusVaultValid =
  profile?.bonus_vault_expires_at && new Date(profile.bonus_vault_expires_at) > now
    ? profile.bonus_vault_slots ?? 0
    : 0
const totalVaultCap = baseVaultCap === null ? null : baseVaultCap + bonusVaultValid
const vaultRemaining = totalVaultCap === null ? null : Math.max(0, totalVaultCap - vaultUsed)


  return (
    <div className="mx-auto max-w-3xl px-4 py-16 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Your account</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription, top-ups, and account settings.</p>
      </div>

      {/* Success / cancel banners */}
      {showSuccessBanner && (
        <Card className="border-emerald-500/40 bg-emerald-500/5">
          <CardContent className="flex items-center justify-between gap-3 py-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Top-up activated</p>
                <p className="text-muted-foreground mt-1">
                  Your extra listings are ready to use. They'll stay active for 30 days from purchase.
                </p>
              </div>
            </div>
            <button onClick={() => setShowSuccessBanner(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>
      )}
      {showCancelBanner && (
        <Card className="border-muted bg-muted/30">
          <CardContent className="flex items-center justify-between gap-3 py-4">
            <p className="text-sm text-muted-foreground">Top-up cancelled — no payment was taken.</p>
            <button onClick={() => setShowCancelBanner(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>
      )}

      {/* Account details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium text-foreground">{user?.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-medium text-foreground capitalize flex items-center gap-1">
              {tier !== "free" && <Crown className="h-3.5 w-3.5 text-amber-500" />}
              {tier}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      {tier !== "free" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Usage this month
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Listings used</span>
              <span className="font-medium text-foreground">
                {listingsUsed} {totalLimit === null ? "(unlimited)" : `/ ${totalLimit}`}
              </span>
            </div>
            {totalLimit !== null && (
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, (listingsUsed / totalLimit) * 100)}%` }}
                />
              </div>
            )}
            <div className="flex justify-between text-sm pt-2">
  <span className="text-muted-foreground">Vault storage used</span>
  <span className="font-medium text-foreground">
    {vaultUsed} {totalVaultCap === null ? "(unlimited)" : `/ ${totalVaultCap}`}
  </span>
</div>
{totalVaultCap !== null && (
  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
    <div
      className="h-full bg-primary transition-all"
      style={{ width: `${Math.min(100, (vaultUsed / totalVaultCap) * 100)}%` }}
    />
  </div>
)}

            {bonusListingsValid > 0 && (
  <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">
    <div className="flex items-start gap-2">
      <Sparkles className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-medium text-foreground">+{bonusListingsValid} bonus listings active</p>
        <p className="text-muted-foreground text-xs mt-0.5 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Expires in {bonusListingsExpiresIn} day{bonusListingsExpiresIn !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  </div>
)}

{(() => {
  const vaultExpiresAt = profile?.bonus_vault_expires_at ? new Date(profile.bonus_vault_expires_at) : null
  const vaultValid = vaultExpiresAt && vaultExpiresAt > now ? profile?.bonus_vault_slots ?? 0 : 0
  const vaultExpiresIn = vaultExpiresAt
    ? Math.max(0, Math.ceil((vaultExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0
  if (vaultValid === 0) return null
  return (
    <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">
      <div className="flex items-start gap-2">
        <Sparkles className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-foreground">+{vaultValid} bonus vault slots active</p>
          <p className="text-muted-foreground text-xs mt-0.5 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Expires in {vaultExpiresIn} day{vaultExpiresIn !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  )
})()}

            {totalLimit !== null && remaining !== null && remaining < 10 && remaining > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Only {remaining} listings left — consider a top-up below.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Listing top-ups */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Top up listings
          </CardTitle>
          <CardDescription>
            Need more listings this month? Buy a top-up — it stacks on top of your plan and lasts 30 days from purchase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {tier === "free" ? (
            <div className="rounded-md border border-border bg-muted/30 p-4 text-sm">
              <p className="text-muted-foreground">
                Top-ups are available on Pro, Lister, and Team plans.{" "}
                <button onClick={() => router.push("/pricing")} className="text-primary underline">
                  Upgrade to a paid plan
                </button>{" "}
                to unlock them.
              </p>
            </div>
          ) : tier === "lister" || tier === "team" ? (
            <div className="rounded-md border border-border bg-muted/30 p-4 text-sm">
              <p className="text-muted-foreground">
                You're on {tier === "lister" ? "Lister" : "Team"} with unlimited listings — no top-ups needed.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {LISTING_TOPUPS.map((topup) => (
                <Card
                  key={topup.id}
                  className={
                    topup.badge
                      ? "relative border-2 border-primary bg-primary/5"
                      : "border-border"
                  }
                >
                  {topup.badge && (
                    <div className="absolute -top-2.5 right-4">
                      <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                        {topup.badge}
                      </span>
                    </div>
                  )}
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-foreground">{topup.label}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{topup.description}</p>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-foreground">{topup.price}</span>
                      <span className="text-xs text-muted-foreground">one-off</span>
                    </div>
                    <Button
                      onClick={() => handleTopUp(topup.id)}
                      disabled={topupLoading !== null}
                      size="sm"
                      className="w-full"
                      variant={topup.badge ? "default" : "outline"}
                    >
                      {topupLoading === topup.id ? "Opening..." : "Buy now"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vault top-ups */}
      {tier === "pro" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Top up vault storage
            </CardTitle>
            <CardDescription>
              Need more vault space? Buy extra slots — they stack on top of your 50 Pro slots and last 30 days from purchase.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {VAULT_TOPUPS.map((topup) => (
                <Card key={topup.id} className="border-border">
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-foreground">{topup.label}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{topup.description}</p>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-foreground">{topup.price}</span>
                      <span className="text-xs text-muted-foreground">one-off</span>
                    </div>
                    <Button
                      onClick={() => handleTopUp(topup.id)}
                      disabled={topupLoading !== null}
                      size="sm"
                      className="w-full"
                      variant="outline"
                    >
                      {topupLoading === topup.id ? "Opening..." : "Buy now"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
{/* Change Email */}
<Card>
  <CardHeader>
    <CardTitle className="text-lg flex items-center gap-2">
      <Mail className="h-5 w-5 text-primary" />
      Change email
    </CardTitle>
    <CardDescription>
      You'll receive a confirmation link at the new address. The change takes effect once you click it.
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="newEmail" className="text-sm">New email address</Label>
      <Input
        id="newEmail"
        type="email"
        placeholder="you@newaddress.com"
        value={newEmail}
        onChange={(e) => setNewEmail(e.target.value)}
        disabled={emailLoading}
      />
    </div>
    <Button
      onClick={handleChangeEmail}
      disabled={emailLoading || !newEmail}
      className="w-full sm:w-auto"
    >
      {emailLoading ? "Sending..." : "Send confirmation"}
    </Button>
  </CardContent>
</Card>

{/* Change Password */}
<Card>
  <CardHeader>
    <CardTitle className="text-lg flex items-center gap-2">
      <Lock className="h-5 w-5 text-primary" />
      Change password
    </CardTitle>
    <CardDescription>
      Pick a new password — at least 8 characters. You'll stay logged in.
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="currentPassword" className="text-sm">Current password</Label>
      <div className="relative">
        <Input
          id="currentPassword"
          type={showCurrentPassword ? "text" : "password"}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          disabled={passwordLoading}
        />
        <button
          type="button"
          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          tabIndex={-1}
        >
          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor="newPassword" className="text-sm">New password</Label>
      <div className="relative">
        <Input
          id="newPassword"
          type={showNewPassword ? "text" : "password"}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={passwordLoading}
          placeholder="At least 8 characters"
        />
        <button
          type="button"
          onClick={() => setShowNewPassword(!showNewPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          tabIndex={-1}
        >
          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor="confirmPassword" className="text-sm">Confirm new password</Label>
      <Input
        id="confirmPassword"
        type={showNewPassword ? "text" : "password"}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={passwordLoading}
      />
    </div>
    <Button
      onClick={handleChangePassword}
      disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
      className="w-full sm:w-auto"
    >
      {passwordLoading ? "Changing..." : "Change password"}
    </Button>
  </CardContent>
</Card>

      {/* Subscription management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tier === "free" ? (
            <>
              <p className="text-sm text-muted-foreground">
                You're on the Free plan. Upgrade to unlock more listings, vault storage, A/B testing, and more.
              </p>
              <Button onClick={() => router.push("/pricing")} className="w-full sm:w-auto">
                See plans
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Manage your subscription, update payment methods, view invoices, or cancel.
              </p>
              <Button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="w-full sm:w-auto flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                {portalLoading ? "Opening..." : "Manage subscription"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Sign out */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sign out</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-muted-foreground">
        Loading account...
      </div>
    }>
      <AccountPageContent />
    </Suspense>
  )
}
