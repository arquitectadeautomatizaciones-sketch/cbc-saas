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
