"use client"

import { useEffect, useState } from "react"
import { ScanLine, AlertTriangle, Check } from "lucide-react"

const examples = [
  {
    before: "Lovely 2-bed flat, professionals only, no DSS. Minimum 12-month term.",
    bad: ["professionals only", "no DSS", "Minimum 12-month term"],
    after: "Lovely 2-bed flat. All applicants welcome. Open-ended tenancy.",
    reason: "“Professionals only” and “no DSS” breach the Equality Act; fixed terms are abolished under the RRA.",
  },
  {
    before: "Modern studio. No children. Offers over £1,200 considered. 6 months rent upfront.",
    bad: ["No children", "Offers over £1,200", "6 months rent upfront"],
    after: "Modern studio. Families welcome. £1,200 pcm. One month’s rent in advance.",
    reason: "Banning children, rental bidding, and large advance rent are all banned under the RRA 2025.",
  },
  {
    before: "Bright room in safe area. No pets under any circumstances.",
    bad: ["safe area", "No pets under any circumstances"],
    after: "Bright room in a well-connected location. Pet requests considered.",
    reason: "“Safe area” is a subjective liability claim; blanket no-pets clauses are no longer permitted.",
  },
]

type Phase = "scanning" | "flagged" | "fixed"

function highlight(text: string, phrases: string[], cls: string) {
  let parts: (string | { m: string })[] = [text]
  phrases.forEach((p) => {
    parts = parts.flatMap((part) => {
      if (typeof part !== "string") return [part]
      const idx = part.toLowerCase().indexOf(p.toLowerCase())
      if (idx === -1) return [part]
      return [part.slice(0, idx), { m: part.slice(idx, idx + p.length) }, part.slice(idx + p.length)]
    })
  })
  return parts.map((part, i) =>
    typeof part === "string" ? (
      <span key={i}>{part}</span>
    ) : (
      <span key={i} className={cls}>{part.m}</span>
    )
  )
}

export function CheckerDemo() {
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>("scanning")

  const ex = examples[idx]

  useEffect(() => {
    const seq: [Phase, number][] = [
      ["scanning", 1400],
      ["flagged", 2600],
      ["fixed", 3200],
    ]
    let active = true
    let step = 0

    const run = () => {
      if (!active) return
      const [p, dur] = seq[step]
      setPhase(p)
      step++
      if (step < seq.length) {
        setTimeout(run, dur)
      } else {
        // advance to next example after the "fixed" hold
        setTimeout(() => {
          if (!active) return
          setIdx((i) => (i + 1) % examples.length)
          step = 0
          run()
        }, dur)
      }
    }
    run()
    return () => { active = false }
  }, [idx])

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-border bg-card/80 p-5 shadow-xl shadow-primary/5 backdrop-blur">
      {/* Status bar */}
      <div className="mb-4 flex items-center gap-2 text-sm font-medium">
        {phase === "scanning" && (
          <span className="flex items-center gap-2 text-muted-foreground">
            <ScanLine className="h-4 w-4 animate-pulse text-primary" />
            Scanning advert…
          </span>
        )}
        {phase === "flagged" && (
          <span className="flex items-center gap-2 text-rose-500 animate-[tenancy-rise_0.3s_ease-out]">
            <AlertTriangle className="h-4 w-4" />
            {ex.bad.length} issue{ex.bad.length !== 1 ? "s" : ""} found
          </span>
        )}
        {phase === "fixed" && (
          <span className="flex items-center gap-2 text-green-500 animate-[tenancy-pop_0.4s_cubic-bezier(0.34,1.56,0.64,1)]">
            <Check className="h-4 w-4" />
            Fixed — compliant
          </span>
        )}
      </div>

      {/* Advert text */}
      <div
        className={`relative rounded-lg border p-4 text-[15px] leading-relaxed transition-colors duration-500 ${
          phase === "fixed" ? "border-green-500/40 bg-green-500/5" : "border-border bg-background/50"
        }`}
      >
        {/* Scan line sweep */}
        {phase === "scanning" && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-12 -translate-y-full bg-gradient-to-b from-transparent via-primary/20 to-transparent"
            style={{ animation: "checker-sweep 1.4s ease-in-out" }}
          />
        )}

        {phase === "fixed" ? (
          <span className="text-foreground animate-[tenancy-rise_0.4s_ease-out]">
            {highlight(ex.after, [], "")}
            {ex.after}
          </span>
        ) : (
          <span className="text-foreground">
            {highlight(
              ex.before,
              ex.bad,
              phase === "flagged"
                ? "rounded bg-rose-500/15 px-1 font-medium text-rose-600 line-through decoration-rose-500/60 dark:text-rose-400 transition-all"
                : "transition-all"
            )}
          </span>
        )}
      </div>

      {/* Reason line */}
      <div className="mt-3 min-h-[2.5rem] text-xs text-muted-foreground">
        {phase === "flagged" && (
          <p className="animate-[tenancy-rise_0.3s_ease-out]">{ex.reason}</p>
        )}
        {phase === "fixed" && (
          <p className="animate-[tenancy-rise_0.3s_ease-out] text-green-600 dark:text-green-400">
            ✓ Rewritten to comply with the Renters’ Rights Act, Equality Act &amp; Tenant Fees Act.
          </p>
        )}
      </div>
    </div>
  )
}
