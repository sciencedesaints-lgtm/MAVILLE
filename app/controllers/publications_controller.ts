import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import app from '@adonisjs/core/services/app'
import { unlink } from 'node:fs/promises'

// type dans l'adresse -> table, colonne du propriétaire et colonne de disponibilité
const TABLES: Record<string, { table: string; proprietaire: string; dispo: string }> = {
  service: { table: 'services', proprietaire: 'prestataire_id', dispo: 'disponible' },
  commerce: { table: 'etablissements', proprietaire: 'proprietaire_id', dispo: 'ouvert' },
  annonce: { table: 'annonces', proprietaire: 'vendeur_id', dispo: 'disponible' },
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default class PublicationsController {
  async index({ view, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    const services = await db.from('services as s')
      .leftJoin('categories_services as c', 'c.id', 's.categorie_id')
      .where('s.prestataire_id', user.id)
      .select('s.id', 's.nom as titre', 's.disponible as en_ligne', 's.created_at', 'c.nom as categorie')

    const commerces = await db.from('etablissements as e')
      .leftJoin('categories_etablissements as c', 'c.id', 'e.categorie_id')
      .where('e.proprietaire_id', user.id)
      .select('e.id', 'e.nom as titre', 'e.ouvert as en_ligne', 'e.created_at', 'c.nom as categorie')

    const annonces = await db.from('annonces as a')
      .leftJoin('categories_produits as c', 'c.id', 'a.categorie_id')
      .where('a.vendeur_id', user.id)
      .select('a.id', 'a.titre', 'a.disponible as en_ligne', 'a.created_at', 'a.type_offre', 'c.nom as categorie')

    const publications = [
      ...services.map((r: any) => ({ ...r, genre: 'service', etiquette: '🔧 Service' })),
      ...commerces.map((r: any) => ({ ...r, genre: 'commerce', etiquette: '🏪 Commerce' })),
      ...annonces.map((r: any) => ({
        ...r,
        genre: 'annonce',
        etiquette: r.type_offre === 'location' ? '🛍️ À louer' : '🛍️ À vendre',
      })),
    ].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return view.render('pages/publications', { publications })
  }

  // Marquer indisponible ou remettre en ligne
  async basculer({ params, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const cible = TABLES[params.type]
    if (!cible || !UUID.test(params.id)) return response.notFound('Introuvable')

    const ligne = await db.from(cible.table)
      .where('id', params.id).where(cible.proprietaire, user.id).first()
    if (!ligne) return response.notFound('Introuvable')

    await db.from(cible.table).where('id', params.id).update({ [cible.dispo]: !ligne[cible.dispo] })
    return response.redirect().back()
  }

  // Supprimer définitivement, avec ses photos et vidéos
  async supprimer({ params, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const cible = TABLES[params.type]
    if (!cible || !UUID.test(params.id)) return response.notFound('Introuvable')

    const ligne = await db.from(cible.table)
      .where('id', params.id).where(cible.proprietaire, user.id).first()
    if (!ligne) return response.notFound('Introuvable')

    const medias = await db.from('offres_medias')
      .where('type_offre', params.type).where('offre_id', params.id)
    for (const m of medias) {
      try {
        await unlink(app.makePath('public' + m.url))
      } catch {
        // fichier déjà absent : on continue
      }
    }
    await db.from('offres_medias').where('type_offre', params.type).where('offre_id', params.id).delete()
    await db.from(cible.table).where('id', params.id).delete()

    return response.redirect().back()
  }
}