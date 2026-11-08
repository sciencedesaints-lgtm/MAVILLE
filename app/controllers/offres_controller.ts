import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Service from '#models/service'

export default class OffresController {

    // Écran de choix : service, produit ou commerce
    async choisir({ view }: HttpContext) {
      return view.render('pages/offres_choisir')
    }
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

    const nom = String(request.input('nom') ?? '').trim()
    const categorieId = Number(request.input('categorie_id'))
    const prixMin = request.input('prix_min')
    const prixMax = request.input('prix_max')

    if (nom.length < 3 || !categorieId) {
      session.flash('erreur', 'Indiquez ce que vous proposez et choisissez une catégorie.')
      return response.redirect().back()
    }

    if (prixMin && prixMax && Number(prixMax) < Number(prixMin)) {
      session.flash('erreur', 'Le prix maximum doit être supérieur au prix minimum.')
      return response.redirect().back()
    }

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

    // Une case à cocher n'envoie sa valeur que si elle est cochée
    const coche = (champ: string) => request.input(champ) === '1'
    const texte = (champ: string) => String(request.input(champ) ?? '').trim() || null

    await Service.create({
      prestataireId: user.id,
      categorieId,
      villeId: ville.id,
      nom,
      slug,
      description: texte('description'),
      prixMin: prixMin ? Number(prixMin) : null,
      prixMax: prixMax ? Number(prixMax) : null,
      devise: request.input('devise', 'USD'),
      prixNegociable: coche('prix_negociable'),
      interventionDomicile: coche('intervention_domicile'),
      surRendezVous: coche('sur_rendez_vous'),
      urgence: coche('urgence'),
      telephone: texte('telephone'),
      email: texte('email'),
      siteWeb: texte('site_web'),
      adresse: texte('adresse'),
      quartier: texte('quartier'),
      commune: texte('commune'),
    })

    return response.redirect().toRoute('profil.personnel')
  }
}  