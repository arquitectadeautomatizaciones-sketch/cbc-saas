// Parser CSV mínimo (RFC 4180): soporta campos entre comillas con comas,
// saltos de línea y comillas escapadas (""). Sin dependencias externas.
export function parseCSV(texto: string): string[][] {
  // Quita BOM UTF-8 si viene de Excel
  const limpio = texto.charCodeAt(0) === 0xfeff ? texto.slice(1) : texto

  const filas: string[][] = []
  let fila: string[] = []
  let campo = ''
  let dentroComillas = false

  for (let i = 0; i < limpio.length; i++) {
    const c = limpio[i]
    const siguiente = limpio[i + 1]

    if (dentroComillas) {
      if (c === '"' && siguiente === '"') {
        campo += '"'
        i++
      } else if (c === '"') {
        dentroComillas = false
      } else {
        campo += c
      }
    } else {
      if (c === '"') {
        dentroComillas = true
      } else if (c === ',') {
        fila.push(campo)
        campo = ''
      } else if (c === '\r') {
        // ignorar, \n cierra la fila
      } else if (c === '\n') {
        fila.push(campo)
        filas.push(fila)
        fila = []
        campo = ''
      } else {
        campo += c
      }
    }
  }

  // última fila si el archivo no termina en salto de línea
  if (campo.length > 0 || fila.length > 0) {
    fila.push(campo)
    filas.push(fila)
  }

  return filas
}

// Quita acentos y pasa a minúsculas para poder emparejar encabezados
// aunque el usuario los escriba distinto ("Teléfono" == "telefono" == "TELEFONO").
const RANGO_DIACRITICOS = new RegExp('[̀-ͯ]', 'g')

export function normalizarEncabezado(s: string): string {
  return s.trim().toLowerCase().normalize('NFD').replace(RANGO_DIACRITICOS, '')
}

// --- Mapeo de columnas para la carga masiva ---
// Campos que CBC entiende y con qué palabras suele nombrarlos cada CRM.
export interface CampoCBC {
  key: string
  label: string
  obligatorio?: boolean
  sinonimos: string[]
}

export const CAMPOS_CBC: CampoCBC[] = [
  { key: 'nombre', label: 'Nombre', obligatorio: true, sinonimos: ['nombre', 'name', 'contacto', 'cliente', 'prospecto', 'lead'] },
  { key: 'empresa', label: 'Empresa', sinonimos: ['empresa', 'company', 'compañía', 'organización', 'razón social', 'negocio'] },
  { key: 'cargo', label: 'Cargo', sinonimos: ['cargo', 'puesto', 'título', 'position', 'role', 'job title'] },
  { key: 'email', label: 'Email', sinonimos: ['email', 'correo', 'mail', 'e-mail'] },
  { key: 'telefono', label: 'Teléfono', sinonimos: ['teléfono', 'telefono', 'phone', 'tel', 'celular', 'móvil', 'movil'] },
  { key: 'whatsapp', label: 'WhatsApp', sinonimos: ['whatsapp', 'ws', 'wapp', 'wa', 'celular whatsapp'] },
  { key: 'valor_estimado', label: 'Valor estimado', sinonimos: ['valor', 'monto', 'importe', 'precio', 'value', 'amount', 'deal value'] },
  { key: 'dolor_principal', label: 'Dolor principal', sinonimos: ['dolor', 'problema', 'pain', 'necesidad', 'challenge'] },
  { key: 'notas', label: 'Notas', sinonimos: ['notas', 'notes', 'comentarios', 'observaciones', 'descripción'] },
]

// Intenta emparejar automáticamente cada columna del CSV con un campo de CBC.
// Primero busca coincidencia exacta con un sinónimo, luego coincidencia parcial
// (ej. "Correo electrónico" contiene "correo"). Cada columna se usa una sola vez.
export function detectarMapeoAutomatico(encabezados: string[]): Record<string, number> {
  const normalizados = encabezados.map(normalizarEncabezado)
  const usados = new Set<number>()
  const mapeo: Record<string, number> = {}

  for (const campo of CAMPOS_CBC) {
    const sinonimosNorm = campo.sinonimos.map(normalizarEncabezado)
    for (let i = 0; i < normalizados.length; i++) {
      if (usados.has(i)) continue
      if (sinonimosNorm.includes(normalizados[i])) {
        mapeo[campo.key] = i
        usados.add(i)
        break
      }
    }
  }

  for (const campo of CAMPOS_CBC) {
    if (mapeo[campo.key] !== undefined) continue
    const sinonimosNorm = campo.sinonimos.map(normalizarEncabezado)
    for (let i = 0; i < normalizados.length; i++) {
      if (usados.has(i)) continue
      if (sinonimosNorm.some((s) => normalizados[i].includes(s))) {
        mapeo[campo.key] = i
        usados.add(i)
        break
      }
    }
  }

  return mapeo
}
