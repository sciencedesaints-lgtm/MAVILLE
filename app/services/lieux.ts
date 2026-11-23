import db from '@adonisjs/lucid/services/db'
import { motsDe } from '#services/analyse_recherche'

const GENERIQUES = new Set(['quartier', 'commune', 'avenue', 'av', 'rue', 'marche', 'de', 'du', 'des', 'la', 'le', 'd'])

export const racine = (m: string) => (m.length > 3 ? m.replace(/[sx]$/, '') : m)

export type LieuTrouve = {
  nom: string
  type: string
  mots: string[]
  latitude: number | null
  longitude: number | null
}

/** Retourne les lieux connus de la ville qui sont cités dans la phrase. */
export async function detecterLieux(villeId: string, villeNom: string, phrase: string): Promise<LieuTrouve[]> {
  const texte = ` ${motsDe(phrase).join(' ')} `
  const villeNorm = motsDe(villeNom).join(' ')
  const lignes = await db.from('lieux').where('ville_id', villeId)
  const trouves: LieuTrouve[] = []

  for (const l of lignes) {
    const ecritures = [l.nom, ...String(l.alias ?? '').split(';')].map((x) => motsDe(x).join(' ')).filter(Boolean)
    // Le nom de la ville elle-même n'est pas un lieu précis
    if (ecritures.includes(villeNorm)) continue
    const cite = ecritures.find((e) => texte.includes(` ${e} `))
    if (!cite) continue

    const mots = [...new Set(ecritures.flatMap((e) => e.split(' ')))].filter((m) => m.length >= 2 && !GENERIQUES.has(m))
    trouves.push({
      nom: l.nom,
      type: l.type,
      mots,
      latitude: l.latitude === null ? null : Number(l.latitude),
      longitude: l.longitude === null ? null : Number(l.longitude),
    })
  }

  // Le lieu le plus précis d'abord : quartier ou marché avant commune
  const ordre: Record<string, number> = { site: 0, marche: 0, quartier: 1, commune: 2 }
  return trouves.sort((a, b) => (ordre[a.type] ?? 3) - (ordre[b.type] ?? 3))
}