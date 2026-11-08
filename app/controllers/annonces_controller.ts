import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Annonce from '#models/annonce'

export default class AnnoncesController {
  async create({ view }: HttpContext) {
    const categories = await db
      .from('categories_produits')
      .where('active', true)
      .orderBy('ordre_affichage')

    return view.render('pages/annonces_creer', { categories })
  }

  async store({ request, response, auth, session }: HttpContext) {
    const user = auth.getUserOrFail()

    const texte = (champ: string) => String(request.input(champ) ?? '').trim() || null

    const titre = texte('titre')
    const categorieId = Number(request.input('categorie_id'))
    const typeOffre = request.input('type_offre') === 'location' ? 'location' : 'vente'
    const prix = request.input('prix')
    const periodicite = texte('periodicite')

    if (!titre || titre.length < 3 || !categorieId) {
      session.flash('erreur', 'Indiquez ce que vous proposez et choisissez une catégorie.')
      return response.redirect().back()
    }

    if (typeOffre === 'location' && !periodicite) {
      session.flash('erreur', 'Pour une location, précisez la durée (par jour, par mois...).')
      return response.redirect().back()
    }

    const ville = await db.from('villes').where('nom', user.ville ?? '').first()
    if (!ville) {
      session.flash('erreur', "Votre ville n'est pas reconnue. Impossible d'enregistrer l'annonce.")
      return response.redirect().back()
    }

    const slug =
      titre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now()

    await Annonce.create({
      vendeurId: user.id,
      categorieId,
      villeId: ville.id,
      titre,
      slug,
      description: texte('description'),
      typeOffre,
      etat: texte('etat'),
      prix: prix ? Number(prix) : null,
      devise: request.input('devise') || 'USD',
      prixNegociable: request.input('prix_negociable') === '1',
      periodicite: typeOffre === 'location' ? periodicite : null,
      telephone: texte('telephone'),
      whatsapp: texte('whatsapp'),
      quartier: texte('quartier'),
      commune: texte('commune'),
      avenue: texte('avenue'),
      repere: texte('repere'),
    })

    return response.redirect().toRoute('profil.personnel')
  }
}