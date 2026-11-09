import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class MembresController {
  async show({ params, view, response }: HttpContext) {
    // Un identifiant invalide (pas un UUID) ferait planter PostgreSQL
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuid.test(params.id)) {
      return response.notFound('Profil introuvable')
    }

    const membre = await db.from('utilisateurs').where('id', params.id).where('actif', true).first()
    if (!membre) {
      return response.notFound('Profil introuvable')
    }

    const services = await db
      .from('services as s')
      .leftJoin('categories_services as c', 'c.id', 's.categorie_id')
      .where('s.prestataire_id', membre.id)
      .where('s.visible', true)
      .select('s.*', 'c.nom as categorie_nom')

    const commerces = await db
      .from('etablissements as e')
      .leftJoin('categories_etablissements as c', 'c.id', 'e.categorie_id')
      .where('e.proprietaire_id', membre.id)
      .where('e.visible', true)
      .select('e.*', 'c.nom as categorie_nom')

    const annonces = await db
      .from('annonces as a')
      .leftJoin('categories_produits as c', 'c.id', 'a.categorie_id')
      .where('a.vendeur_id', membre.id)
      .where('a.visible', true)
      .select('a.*', 'c.nom as categorie_nom')

          // Photos et vidéos de toutes les offres de ce membre
    const toutes = [...services, ...commerces, ...annonces]
    const ids = toutes.map((o: any) => o.id)
    const medias = ids.length
      ? await db.from('offres_medias').whereIn('offre_id', ids).orderBy('ordre')
      : []

    for (const offre of toutes as any[]) {
      offre.medias = medias.filter((m: any) => m.offre_id === offre.id)
    }

    const nomComplet = [membre.prenom, membre.nom].filter(Boolean).join(' ')
    const initiales = nomComplet
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((m: string) => m[0].toUpperCase())
      .join('')

    return view.render('pages/membre', {
      membre,
      nomComplet,
      initiales,
      services,
      commerces,
      annonces,
    })
  }
}