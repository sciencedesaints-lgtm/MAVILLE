import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { lireCsv } from '#services/csv'
import { normaliser } from '#services/analyse_recherche'

export default class extends BaseSeeder {
  async run() {
    const ville = await db.from('villes').where('nom', 'Lubumbashi').first()
    if (!ville) {
      console.log('Ville Lubumbashi introuvable : lance d\'abord le seeder des villes.')
      return
    }

    // 1. Les sept communes de Lubumbashi (sans coordonnées)
    const communes = ['Lubumbashi', 'Kampemba', 'Kamalondo', 'Kenya', 'Katuba', 'Ruashi', 'Annexe']
    await db
      .table('lieux')
      .insert(communes.map((nom) => ({ ville_id: ville.id, nom, type: 'commune', commune: nom })))
      .onConflict(['ville_id', 'nom'])
      .ignore()

    // 2. Tes quartiers, marchés et sites : database/lieux.csv
    // colonnes : nom;type;commune;alias;latitude;longitude
    const chemin = 'database/lieux.csv'
    if (!existsSync(chemin)) {
      console.log('Pas de fichier database/lieux.csv : seules les communes sont ajoutées.')
      return
    }

    const tampon = await readFile(chemin)
    let contenu = tampon.toString('utf8')
    if (contenu.includes('\uFFFD')) contenu = tampon.toString('latin1')

    const lignes = lireCsv(contenu)
    const entetes = lignes[0].map((h) => normaliser(h).trim())
    const col = (n: string) => entetes.indexOf(n)
    const [iNom, iType, iCommune, iAlias, iLat, iLng] = ['nom', 'type', 'commune', 'alias', 'latitude', 'longitude'].map(col)
    if (iNom < 0) {
      console.log('Colonne « nom » introuvable dans database/lieux.csv')
      return
    }

    const nb = (v: unknown) => {
      const n = Number(String(v ?? '').replace(',', '.').trim())
      return String(v ?? '').trim() !== '' && Number.isFinite(n) ? n : null
    }

    let ajoutes = 0
    for (const l of lignes.slice(1)) {
      const nom = String(l[iNom] ?? '').trim()
      if (nom.length < 2) continue
      const type = ['commune', 'quartier', 'marche', 'site'].includes(String(l[iType] ?? '').trim())
        ? String(l[iType]).trim()
        : 'quartier'
      await db
        .table('lieux')
        .insert({
          ville_id: ville.id,
          nom,
          type,
          commune: iCommune >= 0 ? String(l[iCommune] ?? '').trim() || null : null,
          alias: iAlias >= 0 ? String(l[iAlias] ?? '').trim() || null : null,
          latitude: iLat >= 0 ? nb(l[iLat]) : null,
          longitude: iLng >= 0 ? nb(l[iLng]) : null,
        })
        .onConflict(['ville_id', 'nom'])
        .merge()
      ajoutes++
    }
    console.log(`${ajoutes} lieu(x) importé(s) depuis database/lieux.csv`)
  }
}