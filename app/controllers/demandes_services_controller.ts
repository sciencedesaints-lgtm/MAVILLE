import DemandeService from '#models/demande_service'
import {
  createDemandeServiceValidator,
  updateDemandeServiceStatusValidator,
} from '#validators/service'
import type { HttpContext } from '@adonisjs/core/http'
import Utilisateur from '#models/utilisateur'

export default class DemandesServicesController {
  /**
   * Liste les demandes de service de l'utilisateur
   * GET /api/demandes-services
   */
  public async index({ auth, response }: HttpContext) {
    const user = auth.user!

    const demandes = await DemandeService.query()
      .where('utilisateurId', user.id)
      .preload('categorie')
      .orderBy('createdAt', 'desc')

    return response.ok(demandes)
  }

  /**
   * Créer une demande de service
   * POST /api/demandes-services
   */
  public async store({ request, response, auth }: HttpContext) {
    const user = auth.user! as Utilisateur
    const payload = await request.validateUsing(createDemandeServiceValidator)

    const demande = await DemandeService.create({
      ...payload,
      utilisateurId: String(user.id),
      statut: 'en_attente',
    })

    return response.created(demande)
  }

  /**
   * Changer le statut d'une demande de service
   * PATCH /api/demandes-services/:id/statut
   */
  public async updateStatus({ params, request, response }: HttpContext) {
    const { statut } = await request.validateUsing(
      updateDemandeServiceStatusValidator
    )
    const demande = await DemandeService.find(params.id)

    if (!demande) {
      return response.notFound({ message: 'Demande de service introuvable' })
    }

    demande.statut = statut
    await demande.save()

    return response.ok(demande)
  }
}