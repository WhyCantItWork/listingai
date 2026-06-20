"use client"

import { useEffect, useState } from "react"
import { Trophy, Loader2 } from "lucide-react"

const rounds = [
  {
    a: { label: "Variant A", text: "Spacious 2-bed flat available now. Good location, modern kitchen.", score: 64 },
    b: { label: "Variant B", text: "Light-filled 2-bed with a sleek new kitchen, moments from the station.", score: 81 },
    winner: "B" as const,
    reason: "B leads with sensory detail and a concrete location hook — stronger first impression.",
  },
  {
    a: { label: "Variant A", text: "Studio flat to let. Close to shops and transport links.", score: 72 },
    b: { label: "Variant B", text: "Compact studio near the shops. Available immediately.", score: 58 },
    winner: "A" as const,
    reason: "A signals more value and location benefit; B reads thin and generic.",
  },
]

type Phase = "scoring" | "result"

export function ABDemo() {
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>("scoring")
  const [fillA, setFillA] = useState(0)
  const [fillB, setFillB] = useState(0)

  const r = rounds[idx]

  useEffect(() => {
    let active = true
    setPhase("scoring")
    setFillA(0)
    setFillB(0)

    const t1 = setTimeout(() => {
      if (!active) return
      setFillA(r.a.score)
      setFillB(r.b.score)
    }, 400)

    const t2 = setTimeout(() => {
      if (!active) return
      setPhase("result")
    }, 1900)

    const t3 = setTimeout(() => {
      if (!active) return
      setIdx((i) => (i + 1) % rounds.length)
    }, 4600)

    return () => {
      active = false
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [idx, r.a.score, r.b.score])

  const card = (
    side: "A" | "B",
    data: { label: string; text: string; score: number },
    fill: number,
    accent: string
  ) => {
    const isWinner = phase === "result" && r.winner === side
    return (
      <div
        className={`flex-1 rounded-xl border p-4 transition-all duration-500 ${
          isWinner
            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-[1.02]"
            : phase === "result"
            ? "border-border bg-card/60 opacity-60"
            : "border-border bg-card/60"
        }`}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {data.label}
          </span>
          {isWinner && <Trophy className="h-4 w-4 text-primary animate-[tenancy-pop_0.4s_cubic-bezier(0.34,1.56,0.64,1)]" />}
        </div>
        <p className="mb-3 text-sm text-foreground leading-relaxed">{data.text}</p>
        <div className="flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${accent} transition-all duration-1000 ease-out`}
              style={{ width: `${fill}%` }}
            />
          </div>
          <span className="w-8 text-right text-sm font-bold text-foreground tabular-nums">
            {fill}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-border bg-card/80 p-5 shadow-xl shadow-primary/5 backdrop-blur">
      <div className="mb-4 flex items-center gap-2 text-sm font-medium">
        {phase === "scoring" ? (
          <span className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Comparing variants…
          </span>
        ) : (
          <span className="flex items-center gap-2 text-primary animate-[tenancy-rise_0.3s_ease-out]">
            <Trophy className="h-4 w-4" />
            Variant {r.winner} wins
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {card("A", r.a, fillA, "bg-primary")}
        {card("B", r.b, fillB, "bg-accent")}
      </div>

      <div className="mt-3 min-h-[2rem] text-xs text-muted-foreground">
        {phase === "result" && (
          <p className="animate-[tenancy-rise_0.3s_ease-out]">{r.reason}</p>
        )}
      </div>
    </div>
  )
}
