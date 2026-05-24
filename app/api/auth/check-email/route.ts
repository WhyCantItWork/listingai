import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    // Use admin client to look up by email
    const admin = getSupabaseAdmin()
    const { data, error } = await admin.auth.admin.listUsers()

    if (error) {
      console.error("Email check error:", error)
      return NextResponse.json({ exists: false }, { status: 200 })
    }

    const exists = data.users.some(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    )

    return NextResponse.json({ exists })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    console.error("Email check error:", msg)
    return NextResponse.json({ exists: false }, { status: 200 })
  }
}
