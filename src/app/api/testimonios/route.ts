import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { nombre, cargo, empresa, ciudad, testimonio } = await req.json()

    if (!nombre?.trim() || !testimonio?.trim()) {
      return NextResponse.json({ error: "Nombre y testimonio son requeridos." }, { status: 400 })
    }
    if (testimonio.length < 20) {
      return NextResponse.json({ error: "El testimonio es muy corto." }, { status: 400 })
    }

    const { error } = await supabase.from("testimonios").insert({
      nombre: nombre.trim(),
      cargo: cargo?.trim() || null,
      empresa: empresa?.trim() || null,
      ciudad: ciudad?.trim() || null,
      testimonio: testimonio.trim(),
      estrellas: 5,
    })

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Testimonio error:", e)
    return NextResponse.json({ error: "No se pudo guardar. Intenta de nuevo." }, { status: 500 })
  }
}
