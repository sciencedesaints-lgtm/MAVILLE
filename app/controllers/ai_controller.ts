import { AiSearchService } from '#services/ai_search_service'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Recherche from '#models/recherche'
import Notification from '#models/notification'

export default class AiController {
  /**
   * POST /api/v1/ai/search
   * Endpoint de recherche intelligente et mise en relation
   */
  public async search({ request, response, auth }: HttpContext) {
    // 1. Récupération de l'utilisateur connecté (si l'auth est requise sur cette route)
    const user = auth?.user

    // 2. Récupération des paramètres (texte, vocal, image, localisation, etc.)
    const {
      query,
      type_recherche = 'TEXTE', // 'TEXTE' | 'AUDIO' | 'IMAGE'
      audio_url,
      image_url,
      scope_recherche = 'AUTOUR_DE_MOI', // 'AUTOUR_DE_MOI' | 'VILLE' | 'AUTRE_VILLE' | 'MONDE'
      latitude,
      longitude,
      rayonKm,
    } = request.only([
      'query',
      'type_recherche',
      'audio_url',
      'image_url',
      'scope_recherche',
      'latitude',
      'longitude',
      'rayonKm',
    ])

    if (!query && !audio_url && !image_url) {
      return response.badRequest({ message: 'Veuillez fournir un contenu de recherche (texte, vocal ou image).' })
    }

    const latNum = latitude ? Number.parseFloat(latitude) : undefined
    const lngNum = longitude ? Number.parseFloat(longitude) : undefined
    const rayonFinal = rayonKm ? Number(rayonKm) : 1 // Rayon par défaut de 1 km pour "Autour de moi"

    // 3. Enregistrement de la recherche dans la table 'recherches'
    if (user) {
      const recherche = new Recherche()
      recherche.utilisateurId = user.id
      recherche.typeRecherche = type_recherche
      recherche.texte = query
      recherche.audioUrl = audio_url
      recherche.imageUrl = image_url
      recherche.scopeRecherche = scope_recherche
      recherche.latitude = latNum
      recherche.longitude = lngNum
      recherche.rayon_km = rayonFinal

      if (latNum && lngNum) {
        recherche.position = db.raw(`ST_MakePoint(?, ?)::geography`, [lngNum, latNum])
      }
      await recherche.save()
    }

    // 4. Appel du service de recherche existant
    const searchResults = await AiSearchService.search({
      query,
      latitude: Number.isNaN(latNum) ? undefined : latNum,
      longitude: Number.isNaN(lngNum) ? undefined : lngNum,
      rayonKm: rayonFinal,
    })

    // 5. Recherche de la cible correspondante (Personne, Entreprise ou Administration) via PostGIS
    let queryCible = db.from('utilisateurs')
    if (user) {
      queryCible.whereNot('id', user.id)
    }

    if (scope_recherche === 'AUTOUR_DE_MOI' && latNum && lngNum) {
      const rayonMetres = rayonFinal * 1000
      queryCible.whereRaw(
        `ST_DWithin(position, ST_MakePoint(?, ?)::geography, ?)`,
        [lngNum, latNum, rayonMetres]
      )
    }

    const cibleTrouvee = await queryCible.first()

    // 6. Si une cible est trouvée, on lui envoie une notification d'alerte (Approuver / Décliner)
    if (cibleTrouvee && user) {
      await Notification.create({
        utilisateurId: cibleTrouvee.id,
        type: 'DEMANDE_MISE_EN_RELATION',
        titre: 'Nouvelle demande de mise en relation',
        message: `L'utilisateur ${user.nom || ''} souhaite entrer en contact suite à une recherche (${type_recherche}).`,
        lien: `/profil/demandes`,
      })
    }

    // 7. Retour de la réponse avec la redirection vers le profil cible
    return response.ok({
      reponseIa: `Voici les correspondances trouvées pour "${query || 'votre recherche'}" :`,
      data: searchResults,
      redirectUrl: cibleTrouvee ? `/profil/utilisateur/${cibleTrouvee.id}` : null,
    })
  }

  /**
   * PATCH /api/v1/notifications/:id/repondre
   * Permet à la cible d'approuver ou décliner la demande de mise en relation
   */
  public async repondreDemande({ request, response, params, auth }: HttpContext) {
    const user = auth.user!
    const { statut } = request.only(['statut']) // 'approuve' ou 'decline'

    if (!['approuve', 'decline'].includes(statut)) {
      return response.badRequest({ message: 'Statut invalide. Utilisez "approuve" ou "decline".' })
    }

    // Récupérer la notification destinée à cet utilisateur
    const notification = await Notification.query()
      .where('id', params.id)
      .where('utilisateurId', user.id)
      .first()

    if (!notification) {
      return response.notFound({ message: 'Notification introuvable ou non autorisée.' })
    }

    // Marquer la notification comme lue
    notification.lu = true
    await notification.save()

    // Si approuvé, on peut initier la mise en relation (ex: créer un accès ou une conversation)
    if (statut === 'approuve') {
      // TODO: Logique additionnelle (ex: création d'une ligne dans une table de relations acceptées)
    }

    return response.ok({
      message: `La demande a été ${statut === 'approuve' ? 'approuvée' : 'déclinée'} avec succès.`,
      statut,
    })
  }
}