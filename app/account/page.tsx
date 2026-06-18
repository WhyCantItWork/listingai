'use client'

import { toast } from "sonner"
import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Crown, CreditCard, LogOut, TrendingUp, Mail, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Tier = "free" | "pro" | "lister"

interface Profile {
  tier: Tier
  listings_used: number | null
  compliance_used: number | null
}

const TIER_LIMITS: Record<Tier, number | null> = {
  free: 5,
  pro: 100,
  lister: null,
}

const VAULT_CAPS: Record<Tier, number | null> = {
  free: 0,
  pro: 50,
  lister: null,
}

const COMPLIANCE_LIMITS: Record<Tier, number | null> = {
  free: 0,
  pro: 75,
  lister: null,
}

function UsageBar({ used, limit }: { used: number; limit: number }) {
  const [width, setWidth] = useState(0)
  const target = Math.min(100, (used / limit) * 100)

  useEffect(() => {
    // Animate from 0 to target on mount
    const raf = requestAnimationFrame(() => setWidth(target))
    return () => cancelAnimationFrame(raf)
  }, [target])

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-1000 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

function AccountSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 space-y-6">
      <div className="space-y-2">
        <div className="tenancy-shimmer h-8 w-48 rounded" />
        <div className="tenancy-shimmer h-4 w-72 rounded" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="tenancy-shimmer h-5 w-40 rounded" />
          <div className="tenancy-shimmer h-3 w-full rounded" />
          <div className="tenancy-shimmer h-3 w-2/3 rounded" />
        </div>
      ))}
    </div>
  )
}

function AccountPageContent() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [vaultUsed, setVaultUsed] = useState(0)

  const [newEmail, setNewEmail] = useState("")
  const [emailLoading, setEmailLoading] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [deleting, setDeleting] = useState(false)

  const router = useRouter()

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
        .select("tier, listings_used, compliance_used")
        .eq("id", user.id)
        .single()
      setProfile(data as Profile)
      setLoading(false)
    }
    load()
  }, [router])

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

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    const res = await fetch("/api/stripe/portal", { method: "POST" })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      toast.error("Couldn't open billing portal", { description: data.error })
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

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      toast.error("Type DELETE in capital letters to confirm")
      return
    }

    setDeleting(true)
    try {
      const res = await fetch("/api/account/delete", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        toast.error("Couldn't delete account", { description: data.error || "Please try again or contact support." })
        setDeleting(false)
        return
      }
      toast.success("Account deleted", { description: "Your account and all data have been removed." })
      window.location.href = "/"
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error"
      toast.error("Couldn't delete account", { description: msg })
      setDeleting(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  if (loading) {
    return <AccountSkeleton />
  }

  const tier = profile?.tier ?? "free"
  const totalLimit = TIER_LIMITS[tier]
  const listingsUsed = profile?.listings_used ?? 0
  const totalVaultCap = VAULT_CAPS[tier]
  const complianceLimit = COMPLIANCE_LIMITS[tier]
  const complianceUsed = profile?.compliance_used ?? 0
  const remaining = totalLimit === null ? null : Math.max(0, totalLimit - listingsUsed)

  // Staggered card entrance helper
  const cardEnter = "animate-[tenancy-rise_0.5s_ease-out_both]"

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 space-y-6">
      <div className="animate-[tenancy-rise_0.5s_ease-out]">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Your account</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription and account settings.</p>
      </div>

      <Card className={cn(cardEnter, "transition-shadow hover:shadow-md")} style={{ animationDelay: "60ms" }}>
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

      {tier !== "free" && (
        <Card className={cn(cardEnter, "transition-shadow hover:shadow-md")} style={{ animationDelay: "120ms" }}>
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
            {totalLimit !== null && <UsageBar used={listingsUsed} limit={totalLimit} />}

            <div className="flex justify-between text-sm pt-2">
              <span className="text-muted-foreground">Compliance scans used</span>
              <span className="font-medium text-foreground">
                {complianceUsed} {complianceLimit === null ? "(unlimited)" : `/ ${complianceLimit}`}
              </span>
            </div>
            {complianceLimit !== null && <UsageBar used={complianceUsed} limit={complianceLimit} />}

            <div className="flex justify-between text-sm pt-2">
              <span className="text-muted-foreground">Vault storage used</span>
              <span className="font-medium text-foreground">
                {vaultUsed} {totalVaultCap === null ? "(unlimited)" : `/ ${totalVaultCap}`}
              </span>
            </div>
            {totalVaultCap !== null && <UsageBar used={vaultUsed} limit={totalVaultCap} />}

            {totalLimit !== null && remaining !== null && remaining < 10 && remaining > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Only {remaining} listings left this month — upgrade to Lister for unlimited.
              </p>
            )}

            {complianceLimit !== null && complianceLimit - complianceUsed < 10 && complianceLimit - complianceUsed > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Only {complianceLimit - complianceUsed} compliance scans left this month — upgrade to Lister for unlimited.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className={cn(cardEnter, "transition-shadow hover:shadow-md")} style={{ animationDelay: "180ms" }}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Change email
          </CardTitle>
          <CardDescription>
            You&apos;ll receive a confirmation link at the new address. The change takes effect once you click it.
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
              className="transition-colors focus-visible:border-primary"
            />
          </div>
          <Button
            onClick={handleChangeEmail}
            disabled={emailLoading || !newEmail}
            className="w-full sm:w-auto transition-transform active:scale-[0.98]"
          >
            {emailLoading ? "Sending..." : "Send confirmation"}
          </Button>
        </CardContent>
      </Card>

      <Card className={cn(cardEnter, "transition-shadow hover:shadow-md")} style={{ animationDelay: "240ms" }}>
        <CardHeader>
          <CardTitle className="text-lg">Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tier === "free" ? (
            <>
              <p className="text-sm text-muted-foreground">
                You&apos;re on the Free plan. Upgrade to unlock more listings, compliance scans, vault storage, A/B testing, and more.
              </p>
              <Button onClick={() => router.push("/pricing")} className="w-full sm:w-auto transition-transform active:scale-[0.98]">
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
                className="w-full sm:w-auto flex items-center gap-2 transition-transform active:scale-[0.98]"
              >
                <CreditCard className="h-4 w-4" />
                {portalLoading ? "Opening..." : "Manage subscription"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card className={cn(cardEnter, "transition-shadow hover:shadow-md")} style={{ animationDelay: "300ms" }}>
        <CardHeader>
          <CardTitle className="text-lg">Sign out</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2 transition-transform active:scale-[0.98]">
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </CardContent>
      </Card>

      <Card
        className={cn(cardEnter, "border-rose-500/30 transition-all hover:border-rose-500/50 hover:shadow-lg hover:shadow-rose-500/5")}
        style={{ animationDelay: "360ms" }}
      >
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-rose-500">
            <AlertTriangle className="h-5 w-5" />
            Delete account
          </CardTitle>
          <CardDescription>
            Permanently delete your account, all your saved listings, and your subscription. This can&apos;t be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Deleting your account will:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
            <li>Cancel any active subscription immediately</li>
            <li>Permanently delete all listings in your vault</li>
            <li>Remove your profile and account data</li>
            <li>Log you out of all devices</li>
          </ul>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto transition-transform active:scale-[0.98]">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Delete my account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <span className="block">
                    This action is <strong>permanent</strong>. Your account, all saved listings, and any active subscription will be deleted immediately and cannot be recovered.
                  </span>
                  <span className="block">
                    Type <strong>DELETE</strong> below to confirm.
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="Type DELETE to confirm"
                autoComplete="off"
                disabled={deleting}
                className="mt-2"
              />
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => setDeleteConfirm("")}
                  disabled={deleting}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirm !== "DELETE"}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? "Deleting..." : "Delete account permanently"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountSkeleton />}>
      <AccountPageContent />
    </Suspense>
  )
}
