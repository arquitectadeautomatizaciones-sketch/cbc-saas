import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseCSV, normalizarEncabezado } from '@/lib/csv'

const LIMITE_FILAS = 500

// Encabezados esperados en la plantilla → clave interna del prospecto.
// Se aceptan variantes sin acentos/mayúsculas gracias a normalizarEncabezado.
const MAPA_COLUMNAS: Record<string, string> = {
  nombre: 'nombre',
  empresa: 'empresa',
  cargo: 'cargo',
  email: 'email',
  telefono: 'telefono',
  whatsapp: 'whatsapp',
  'valor estimado': 'valor_estimado',
  'dolor principal': 'dolor_principal',
  notas: 'notas',
}

interface ErrorFila {
  fila: number
  nombre: string
  motivo: string
}

function filaVacia(campos: string[]): boolean {
  return campos.every((c) => c.trim() === '')
}

function parsearValorEstimado(raw: string): { valor: number | null; error?: string } {
  const limpio = raw.trim()
  if (!limpio) return { valor: null }

  // Quita símbolos de moneda y espacios; conserva dígitos, coma, punto y signo
  const sinSimbolos = limpio.replace(/[^0-9.,-]/g, '')
  if (!/\d/.test(sinSimbolos)) return { valor: null, error: 'El valor estimado no es un número válido' }

  const tieneComa = sinSimbolos.includes(',')
  const tienePunto = sinSimbolos.includes('.')
  let normalizado = sinSimbolos

  if (tieneComa && tienePunto) {
    // El separador que aparece último es el decimal; el otro es de miles.
    // Cubre "5,000.50" (US) y "5.000,50" (LATAM/ES) por igual.
    const ultimaComa = sinSimbolos.lastIndexOf(',')
    const ultimoPunto = sinSimbolos.lastIndexOf('.')
    normalizado = ultimaComa > ultimoPunto
      ? sinSimbolos.replace(/\./g, '').replace(',', '.')
      : sinSimbolos.replace(/,/g, '')
  } else if (tieneComa || tienePunto) {
    // Un solo separador: si va seguido de exactamente 3 dígitos es de miles
    // ("5.000" = 5000, "5,000" = 5000); si no, es decimal ("5.50" = 5.5).
    const sep = tieneComa ? ',' : '.'
    const partes = sinSimbolos.split(sep)
    const ultimaParte = partes[partes.length - 1]
    const esDecimal = partes.length === 2 && ultimaParte.length !== 3
    normalizado = esDecimal ? partes.join('.') : partes.join('')
  }

  const num = Number(normalizado)
  if (!Number.isFinite(num)) return { valor: null, error: 'El valor estimado no es un número válido' }
  if (num < 0) return { valor: null, error: 'El valor estimado no puede ser negativo' }
  if (num > 9999999999.99) return { valor: null, error: 'El valor estimado es demasiado alto' }
  return { valor: num }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'No se pudo leer el archivo enviado' }, { status: 400 })
  }

  const archivo = formData.get('archivo')
  if (!(archivo instanceof File)) {
    return NextResponse.json({ error: 'Falta el archivo CSV' }, { status: 400 })
  }

  const texto = await archivo.text()
  const filas = parseCSV(texto).filter((f) => !(f.length === 1 && f[0].trim() === ''))

  if (filas.length === 0) {
    return NextResponse.json({ error: 'El archivo está vacío' }, { status: 400 })
  }

  // --- Mapear encabezados a columnas conocidas ---
  const encabezados = filas[0].map(normalizarEncabezado)
  const indice: Record<string, number> = {}
  encabezados.forEach((h, i) => {
    const clave = MAPA_COLUMNAS[h]
    if (clave) indice[clave] = i
  })

  if (indice.nombre === undefined) {
    return NextResponse.json(
      { error: 'El archivo debe tener una columna "Nombre". Descarga la plantilla para ver el formato correcto.' },
      { status: 400 }
    )
  }

  const filasDatos = filas.slice(1).filter((f) => !filaVacia(f))

  if (filasDatos.length > LIMITE_FILAS) {
    return NextResponse.json(
      { error: `El archivo tiene ${filasDatos.length} filas. El máximo por carga es ${LIMITE_FILAS}. Divide el archivo en partes más pequeñas.` },
      { status: 400 }
    )
  }

  // --- Prospectos existentes del usuario, para detectar duplicados ---
  const { data: existentes } = await supabase
    .from('prospectos')
    .select('nombre, empresa, email')
    .eq('user_id', profile.id)

  const emailsExistentes = new Set(
    (existentes ?? []).filter((p) => p.email).map((p) => p.email!.trim().toLowerCase())
  )
  const nombreEmpresaExistentes = new Set(
    (existentes ?? []).map((p) => `${p.nombre.trim().toLowerCase()}|${(p.empresa ?? '').trim().toLowerCase()}`)
  )

  const get = (fila: string[], clave: string) => (indice[clave] !== undefined ? (fila[indice[clave]] ?? '').trim() : '')

  const errores: ErrorFila[] = []
  const paraInsertar: Record<string, unknown>[] = []
  const emailsVistos = new Set<string>()
  const nombreEmpresaVistos = new Set<string>()

  filasDatos.forEach((fila, i) => {
    const numeroFila = i + 2 // +1 por encabezado, +1 porque las filas empiezan en 1
    const nombre = get(fila, 'nombre')
    const empresa = get(fila, 'empresa')
    const email = get(fila, 'email')

    if (!nombre) {
      errores.push({ fila: numeroFila, nombre: '(sin nombre)', motivo: 'Falta el nombre (obligatorio)' })
      return
    }

    if (email && !EMAIL_REGEX.test(email)) {
      errores.push({ fila: numeroFila, nombre, motivo: 'El email no tiene un formato válido' })
      return
    }

    const { valor, error: errorValor } = parsearValorEstimado(get(fila, 'valor_estimado'))
    if (errorValor) {
      errores.push({ fila: numeroFila, nombre, motivo: errorValor })
      return
    }

    // Duplicados: por email si lo hay, si no por nombre + empresa
    if (email) {
      const emailKey = email.toLowerCase()
      if (emailsExistentes.has(emailKey) || emailsVistos.has(emailKey)) {
        errores.push({ fila: numeroFila, nombre, motivo: 'Ya existe un prospecto con este email' })
        return
      }
      emailsVistos.add(emailKey)
    } else {
      const key = `${nombre.toLowerCase()}|${empresa.toLowerCase()}`
      if (nombreEmpresaExistentes.has(key) || nombreEmpresaVistos.has(key)) {
        errores.push({ fila: numeroFila, nombre, motivo: 'Ya existe un prospecto con este nombre y empresa' })
        return
      }
      nombreEmpresaVistos.add(key)
    }

    paraInsertar.push({
      user_id: profile.id,
      nombre,
      empresa: empresa || null,
      cargo: get(fila, 'cargo') || null,
      email: email || null,
      telefono: get(fila, 'telefono') || null,
      whatsapp: get(fila, 'whatsapp') || null,
      valor_estimado: valor,
      dolor_principal: get(fila, 'dolor_principal') || null,
      notas: get(fila, 'notas') || null,
    })
  })

  let importados = 0
  if (paraInsertar.length > 0) {
    const { data, error } = await supabase.from('prospectos').insert(paraInsertar).select('id')
    if (error) {
      return NextResponse.json(
        { error: `No se pudo guardar la importación: ${error.message}` },
        { status: 500 }
      )
    }
    importados = data?.length ?? 0
  }

  return NextResponse.json({
    importados,
    con_errores: errores.length,
    total_filas: filasDatos.length,
    errores,
  })
}
