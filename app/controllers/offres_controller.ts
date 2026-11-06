import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Service from '#models/service'

export default class OffresController {
  // Affiche le formulaire
  async create({ view }: HttpContext) {
    const categories = await db
      .from('categories_services')
      .where('active', true)
      .orderBy('ordre_affichage')

    return view.render('pages/offres_creer', { categories })
  }

  // Enregistre l'offre
  async store({ request, response, auth, session }: HttpContext) {
    const user = auth.getUserOrFail()

    const nom = request.input('nom')
    const categorieId = request.input('categorie_id')
    const description = request.input('description')
    const prixMin = request.input('prix_min')

    // On retrouve la ville de l'utilisateur dans la table villes
    const ville = await db.from('villes').where('nom', user.ville ?? '').first()

    if (!ville) {
      session.flash('erreur', "Votre ville n'est pas reconnue. Impossible d'enregistrer l'offre.")
      return response.redirect().back()
    }

    const slug =
      nom
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now()

    await Service.create({
      prestataireId: user.id,
      categorieId: Number(categorieId),
      villeId: ville.id,
      nom,
      slug,
      description: description || null,
      prixMin: prixMin ? Number(prixMin) : null,
    })

    return response.redirect().toRoute('profil.personnel')
  }
}