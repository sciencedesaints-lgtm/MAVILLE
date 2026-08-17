import { AiSearchService } from '#services/ai_search_service'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Recherche from '#models/recherche'
import Notification from '#models/notification'
import DemandeService from '#models/demande_service'
import Etablissement from '#models/etablissement'

export default class AiController {
  
  public async index({ view }: HttpContext) {
    return view.render('pages/recherche')
  }

  public async notifications({ view, auth }: HttpContext) {
    const user = auth.user!
    const notifications = await Notification.query()
      .where('utilisateurId', String(user.id))
      .orderBy('createdAt', 'desc')

    return view.render('pages/notifications', { notifications })
  }

  public async repondreDemande({ request, response, params }: HttpContext) {
    const { statut } = request.only(['statut'])
    const notificationId = params.id

    return response.ok({
      success: true,
      message: `Réponse '${statut}' enregistrée pour la notification ${notificationId}`,
    })
  }

  public async search({ request, response, auth }: HttpContext) {
    const user = auth?.user

    const {
      query,
      type_recherche = 'TEXTE',
      audio_url,
      image_url,
      scope_recherche = 'AUTOUR_DE_MOI',
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

    const latNum = latitude ? Number.parseFloat(latitude) : null
    const lngNum = longitude ? Number.parseFloat(longitude) : null
    const rayonFinal = rayonKm ? Number(rayonKm) : 5

    if (user) {
      const recherche = new Recherche()
      recherche.utilisateurId = String(user.id)
      recherche.typeRecherche = type_recherche
      recherche.texte = query || null
      recherche.audioUrl = audio_url || null
      recherche.imageUrl = image_url || null
      recherche.scopeRecherche = scope_recherche
      recherche.latitude = latNum
      recherche.longitude = lngNum
      recherche.rayonKm = rayonFinal

      if (latNum !== null && lngNum !== null) {
        recherche.position = db.raw(`ST_MakePoint(?, ?)::geography`, [lngNum, latNum])
      }
      await recherche.save()
    }

    let demandeServiceId = null
    if (user && query) {
      const demande = await DemandeService.create({
        utilisateurId: String(user.id),
        description: query,
        statut: 'EN_ATTENTE',
      })
      demandeServiceId = demande.id
    }

    let queryEtablissements = Etablissement.query()

    if (scope_recherche === 'AUTOUR_DE_MOI' && latNum !== null && lngNum !== null) {
      const rayonMetres = rayonFinal * 1000
      queryEtablissements.whereRaw(
        `ST_DWithin(position, ST_MakePoint(?, ?)::geography, ?)`,
        [lngNum, latNum, rayonMetres]
      )
    }

    if (query) {
      const motsCles = query.toLowerCase()
      queryEtablissements.where((builder) => {
        builder.whereILike('nom', `%${motsCles}%`)
      })
    }

    const professionnelsCibles = await queryEtablissements.exec()

    let countNotifications = 0
    for (const pro of professionnelsCibles) {
      const proUserId = (pro as any).utilisateurId
      if (proUserId && user && String(proUserId) !== String(user.id)) {
        await Notification.create({
          utilisateurId: String(proUserId),
          type: 'DEMANDE_MISE_EN_RELATION',
          titre: '🔔 Nouveau besoin client dans la ville !',
          message: `Un habitant recherche : "${query}". Consultez et proposez vos offres dès maintenant.`,
          lien: demandeServiceId ? `/demandes-services/${demandeServiceId}` : `/profil/demandes`,
        })
        countNotifications++
      }
    }

    const searchResults = await AiSearchService.search({
      query,
      latitude: latNum === null ? undefined : latNum,
      longitude: lngNum === null ? undefined : lngNum,
      rayonKm: rayonFinal,
    })

    return response.ok({
      success: true,
      reponseIa: `Recherche enregistrée avec succès. ${countNotifications} professionnel(s) qualifié(s) ont été notifiés.`,
      data: searchResults,
      professionnelsNotifies: countNotifications,
      demandeId: demandeServiceId,
      redirectUrl: demandeServiceId ? `/demandes-services/${demandeServiceId}` : null,
    })
  }
}