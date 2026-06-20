"use client"

import { useEffect, useState } from "react"
import { Archive, Home, Building2, Check } from "lucide-react"

const listings = [
  { icon: Building2, title: "2-bed flat · Clapham", meta: "£1,800 pcm · Furnished" },
  { icon: Home, title: "3-bed semi · Leeds", meta: "£1,200 pcm · Unfurnished" },
  { icon: Building2, title: "Studio · Manchester", meta: "£850 pcm · Furnished" },
  { icon: Home, title: "4-bed detached · Bristol", meta: "£2,400 pcm · Part-furnished" },
]

export function VaultDemo() {
  const [shown, setShown] = useState(0)

  useEffect(() => {
    let active = true
    const timers: ReturnType<typeof setTimeout>[] = []

    const cycle = () => {
      if (!active) return
      setShown(0)
      // reveal one card at a time
      listings.forEach((_, i) => {
        timers.push(setTimeout(() => active && setShown(i + 1), 400 + i * 500))
      })
      // hold the full grid, then restart the whole cycle
      const total = 400 + listings.length * 500 + 2200
      timers.push(setTimeout(cycle, total))
    }

    cycle()
    return () => {
      active = false
      timers.forEach(clearTimeout)
    }
  }, [])

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-border bg-card/80 p-5 shadow-xl shadow-primary/5 backdrop-blur">
      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Archive className="h-4 w-4 text-primary" />
        Your Vault · {shown} saved
      </div>

      <div className="grid grid-cols-2 gap-3">
        {listings.map((l, i) => {
          const visible = i < shown
          const Icon = l.icon
          return (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-lg border border-border bg-background/50 p-3 transition-all duration-500 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-foreground">{l.title}</p>
                <p className="truncate text-[11px] text-muted-foreground">{l.meta}</p>
              </div>
              {visible && (
                <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-green-500 animate-[tenancy-pop_0.3s_ease-out]" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
