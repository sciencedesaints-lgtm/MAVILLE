import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Recherche from '#models/recherche'
import Notification from '#models/notification'

export default class RecherchesController {
  
  async executer({ request, response, auth }: HttpContext) {
    const user = auth.user! // L'utilisateur connecté

    // 1. Récupération des données du formulaire ou de l'API
    const {
      type_recherche, // 'TEXTE', 'AUDIO', 'IMAGE'
      texte,
      audio_url,
      image_url,
      scope_recherche, // 'AUTOUR_DE_MOI', 'VILLE', 'AUTRE_VILLE', 'MONDE'
      latitude,
      longitude,
      rayon_km = 1,    // Rayon par défaut de 1 km pour "Autour de moi"
    } = request.only([
      'type_recherche',
      'texte',
      'audio_url',
      'image_url',
      'scope_recherche',
      'latitude',
      'longitude',
      'rayon_km'
    ])

    // 2. Enregistrement de la recherche dans la table 'recherches'
    const recherche = new Recherche()
    recherche.utilisateurId = user.id
    recherche.typeRecherche = type_recherche
    recherche.texte = texte
    recherche.audioUrl = audio_url
    recherche.imageUrl = image_url
    recherche.scopeRecherche = scope_recherche
    recherche.latitude = latitude
    recherche.longitude = longitude
    recherche.rayon_km = rayon_km

    if (latitude && longitude) {
      recherche.position = db.raw(`ST_MakePoint(?, ?)::geography`, [longitude, latitude])
    }
    await recherche.save()

    // 3. Simulation/Recherche de la cible correspondante (Personne, Entreprise, Administration)
    // Ici, on cherche un utilisateur cible pertinent basé sur le texte ou la géolocalisation PostGIS
    let query = db.from('utilisateurs').whereNot('id', user.id)

    if (scope_recherche === 'AUTOUR_DE_MOI' && latitude && longitude) {
      // Filtrage PostGIS strict dans le rayon (ex: 1000 mètres)
      const rayonMetres = rayon_km * 1000
      query.whereRaw(
        `ST_DWithin(position, ST_MakePoint(?, ?)::geography, ?)`,
        [longitude, latitude, rayonMetres]
      )
    }

    const cibleTrouvee = await query.first()

    if (!cibleTrouvee) {
      return response.redirect().back() // Aucun résultat trouvé
    }

    // 4. Envoi de l'alerte / notification au compte sollicité
    await Notification.create({
      utilisateurId: cibleTrouvee.id,
      type: 'DEMANDE_MISE_EN_relation',
      titre: 'Nouvelle demande de mise en relation',
      message: `L'utilisateur ${user.nom} souhaite entrer en contact suite à une recherche (${type_recherche}).`,
      lien: `/profil/demande/${recherche.id}`
    })

    // 5. Redirection vers le profil de la personne, entreprise ou administration trouvée
    return response.redirect().toPath(`/profil/utilisateur/${cibleTrouvee.id}`)
  }
}