import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // Minimal validation
    const required = ["name", "email", "phone", "locationId", "date", "time"]
    for (const k of required) {
      if (!body?.[k]) {
        return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 })
      }
    }
    // Debug log only. In production, connect DB or email service.
    console.log("[v0] Registration received:", body)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 })
  }
}
