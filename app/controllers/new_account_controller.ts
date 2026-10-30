import type { HttpContext } from '@adonisjs/core/http'
import Utilisateur from '#models/utilisateur'
import {
  personnelSignupValidator,
  entrepriseSignupValidator,
  administrationSignupValidator,
} from '#validators/utilisateur'

export default class NewAccountController {
  public async store({ request, response, auth }: HttpContext) {
    try {
      const typeCompte = request.input('type_compte')
      let payload: any

      switch (typeCompte) {
        case 'personnel':
          payload = await request.validateUsing(personnelSignupValidator)
          break
        case 'entreprise_agence':
          payload = await request.validateUsing(entrepriseSignupValidator)
          break
        case 'administration_publique':
          payload = await request.validateUsing(administrationSignupValidator)
          break
        default:
          return response.badRequest({
            type_compte: ['Le type de compte est invalide ou manquant.'],
          })
      }

      const utilisateur = new Utilisateur()
      utilisateur.typeCompte = payload.type_compte
      utilisateur.pays = payload.pays || null
      utilisateur.ville = payload.ville || null
      utilisateur.password = payload.password
      utilisateur.actif = true
      utilisateur.statutCompte = 'actif'

      if (payload.type_compte === 'personnel') {
        utilisateur.nom = payload.nom
        utilisateur.prenom = payload.prenom
        if (payload.contact && payload.contact.includes('@')) {
          utilisateur.email = payload.contact
        } else {
          utilisateur.telephone = payload.contact
        }
      } else if (payload.type_compte === 'entreprise_agence') {
        utilisateur.nom = payload.nom_entreprise
        utilisateur.nomEntreprise = payload.nom_entreprise
        utilisateur.typeStructure = payload.type_structure
        utilisateur.domaine = payload.domaine
        utilisateur.commune = payload.commune || null
        utilisateur.avenue = payload.avenue || null
        utilisateur.numero = payload.numero || null
        utilisateur.indicatifPays = payload.indicatif_pays
        utilisateur.telephone = payload.telephone
        utilisateur.email = payload.email
      } else if (payload.type_compte === 'administration_publique') {
        utilisateur.nom = payload.nom_institution
        utilisateur.nomInstitution = payload.nom_institution
        utilisateur.typeInstitution = payload.type_institution
        utilisateur.tutelle = payload.tutelle || null
        utilisateur.commune = payload.commune || null
        utilisateur.avenue = payload.avenue || null
        utilisateur.numero = payload.numero || null
        utilisateur.indicatifPays = payload.indicatif_pays
        utilisateur.telephone = payload.telephone
        utilisateur.email = payload.email
      }

      await utilisateur.save()
      await auth.use('web').login(utilisateur)

      if (request.accepts(['html', 'json']) === 'json') {
        return response.ok({
          message: 'Inscription réussie',
          utilisateur: {
            id: utilisateur.id,
            nom: utilisateur.nom,
            typeCompte: utilisateur.typeCompte,
          },
        })
      }
      
      return response.redirect().toRoute('web.accueil')

      return response.redirect().toRoute('web.accueil')
    } catch (error) {
      if (error.messages) {
        return response.badRequest(error.messages)
      }
      throw error
    }
  }
}