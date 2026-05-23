import Link from "next/link"
import { Crown, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function UpgradeRequired({ feature, requiredTier = "Pro" }: { feature: string; requiredTier?: "Pro" | "Lister" }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Card className="border-2 border-primary/20">
        <CardContent className="pt-12 pb-12 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {feature} requires {requiredTier}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Upgrade to {requiredTier} to unlock {feature.toLowerCase()} and the rest of {requiredTier === "Lister" ? "the power-user toolkit" : "Tenancy"}.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="flex items-center gap-2">
              <Link href="/pricing">
                <Crown className="h-4 w-4" />
                See plans
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/generator">Back to Generator</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
