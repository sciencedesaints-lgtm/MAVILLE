import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Etablissement from '#models/etablissement'

export default class CommercesController {
  async create({ view }: HttpContext) {
    const categories = await db
      .from('categories_etablissements')
      .where('active', true)
      .orderBy('ordre_affichage')

    return view.render('pages/commerces_creer', { categories })
  }

  async store({ request, response, auth, session }: HttpContext) {
    const user = auth.getUserOrFail()

    const texte = (champ: string) => String(request.input(champ) ?? '').trim() || null
    
    const nom = texte('nom')
    const categorieId = Number(request.input('categorie_id'))
    const typeCommerce = texte('type_commerce')

    if (!nom || nom.length < 3 || !categorieId || !typeCommerce) {
      session.flash('erreur', 'Indiquez le nom, le type et la catégorie de votre commerce.')
      return response.redirect().back()
    }

    const marche = texte('marche')
    const emplacement = texte('emplacement')
    const quartier = texte('quartier')
    const commune = texte('commune')
    const avenue = texte('avenue')
    const numero = texte('numero')
    const repere = texte('repere')

    // Il faut au moins un indice de localisation
    if (!marche && !quartier && !avenue && !repere) {
      session.flash('erreur', 'Indiquez où se trouve votre commerce (marché, quartier, avenue ou repère).')
      return response.redirect().back()
    }

    const ville = await db.from('villes').where('nom', user.ville ?? '').first()
    if (!ville) {
      session.flash('erreur', "Votre ville n'est pas reconnue. Impossible d'enregistrer le commerce.")
      return response.redirect().back()
    }

    // Le champ obligatoire "adresse" est fabriqué à partir des morceaux renseignés
    const adresse = [
      marche ? `Marché ${marche}` : null,
      emplacement,
      avenue ? `Avenue/Rue ${avenue}${numero ? ' n°' + numero : ''}` : null,
      quartier,
      commune,
      repere,
    ]
      .filter(Boolean)
      .join(', ')

    const slug =
      nom
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now()

    const operateurs = request.input('mobile_money', [])
    const mobileMoney = Array.isArray(operateurs) ? operateurs : [operateurs]

    await Etablissement.create({
      proprietaireId: user.id,
      categorieId,
      villeId: ville.id,
      nom,
      slug,
      description: texte('description'),
      adresse,
      marche,
      emplacement,
      quartier,
      commune,
      avenue,
      numero,
      repere,
      typeCommerce,
      horaires: texte('horaires'),
      telephone: texte('telephone'),
      whatsapp: texte('whatsapp'),
      mobileMoney: mobileMoney.length ? mobileMoney : null,
      livraison: request.input('livraison') === '1',
    })

    return response.redirect().toRoute('profil.personnel')
  }
}