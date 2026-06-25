import { differenceInDays, parseISO } from 'date-fns'

export function diasRestantesTrial(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0
  const diff = differenceInDays(parseISO(trialEndsAt), new Date())
  return Math.max(0, diff)
}

export function trialActivo(trialEndsAt: string | null): boolean {
  return diasRestantesTrial(trialEndsAt) > 0
}

export function trialEnDia(trialStartedAt: string | null): number {
  if (!trialStartedAt) return 0
  return differenceInDays(new Date(), parseISO(trialStartedAt)) + 1
}
