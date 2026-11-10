import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

type Resultat = {
  genre: 'service' | 'commerce' | 'annonce' | 'entreprise' | 'administration'
  id: string
  titre: string
  proprietaireId: string
  proprietaire: string | null
  categorie: string | null
  lieu: string
  telephone: string | null
  prix: string | null
}

// Mots qui n'aident pas à trouver une offre
const MOTS_VIDES = new Set([
  'je', 'j', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'me', 'moi', 'mon', 'ma', 'mes',
  'le', 'la', 'les', 'l', 'un', 'une', 'des', 'du', 'de', 'd', 'au', 'aux', 'en', 'dans', 'sur',
  'sous', 'avec', 'sans', 'pour', 'par', 'chez', 'et', 'ou', 'a', 'y', 'ce', 'cet', 'cette',
  'ces', 'qui', 'que', 'quoi', 'est', 'sont', 'suis', 'es', 'svp', 'stp', 'plait', 'merci',
  'bonjour', 'salut', 'bonsoir', 's', 'si', 'cherche', 'cherches', 'chercher', 'cherchons',
  'cherchez', 'recherche', 'rechercher', 'besoin', 'voudrais', 'voulais', 'veux', 'veut',
  'souhaite', 'trouver', 'trouve', 'aimerais', 'quelqu', 'quelquun', 'dispose', 'avez',
  'avoir', 'faut', 'il', 'y', 'ai', 'ville', 'proche', 'pres', 'ici', 'disponible',
])

const MOTS_VENTE = new Set(['vendre', 'vente', 'vend', 'vends', 'acheter', 'achat', 'achete', 'acquerir'])
const MOTS_LOCATION = new Set(['louer', 'location', 'loue', 'loyer', 'locat', 'louez'])
const MARQUEURS_LIEU = new Set(['quartier', 'commune', 'avenue', 'av', 'rue', 'marche'])

// minuscules, sans accents
const normaliser = (texte: string) =>
  texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

// Même normalisation côté SQL
const norm = (col: string) =>
  `translate(lower(coalesce(${col}, '')), 'àâäáãéèêëíìîïóòôöõúùûüçñ', 'aaaaaeeeeiiiiooooouuuucn')`

export default class ResultatsController {
  async index({ request, view, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const q = String(request.input('q') ?? '').trim()
    const type = String(request.input('type') ?? 'tous')

    let texteNorm = normaliser(q)

    // Détails du type "3 chambres", "2 pieces", "2 salons" : gardés comme une expression
    const expressions: string[] = []
    texteNorm = texteNorm.replace(/(\d+)\s*(chambres?|pieces?|salons?|douches?)/g, (_m, n, mot) => {
      expressions.push(`${n} ${String(mot).replace(/s$/, '')}`)
      return ' '
    })

    const bruts = texteNorm.split(/[^a-z0-9]+/).filter(Boolean)

    let intention: 'vente' | 'location' | null = null
    const mots: string[] = []
    const lieux: string[] = []

    for (let i = 0; i < bruts.length; i++) {
      const mot = bruts[i]

      // "quartier kalubwe" -> lieu = kalubwe
      if (MARQUEURS_LIEU.has(mot)) {
        let suivant = bruts[i + 1]
        if (suivant && ['de', 'du', 'des', 'la', 'le', 'd'].includes(suivant)) suivant = bruts[i + 2]
        if (suivant && !MOTS_VIDES.has(suivant)) {
          lieux.push(suivant.length > 3 ? suivant.replace(/[sx]$/, '') : suivant)
          i = bruts.indexOf(suivant, i)
        }
        continue
      }
      if (MOTS_VENTE.has(mot)) {
        intention = intention ?? 'vente'
        continue
      }
      if (MOTS_LOCATION.has(mot)) {
        intention = 'location'
        continue
      }
      if (MOTS_VIDES.has(mot) || mot.length < 2) continue
      mots.push(mot.length > 3 ? mot.replace(/[sx]$/, '') : mot)
    }

    const motsUniques = [...new Set(mots)]
    const lieuxUniques = [...new Set(lieux)]

    // Au moins un mot doit correspondre ; tri par nombre de mots trouvés
    const appliquer = (query: any, colonnes: string[]) => {
      if (!motsUniques.length) return
      const morceaux: string[] = []
      const valeurs: string[] = []
      for (const mot of motsUniques) {
        const conditions = colonnes.map((c) => `${norm(c)} LIKE ?`).join(' OR ')
        morceaux.push(`(CASE WHEN ${conditions} THEN 1 ELSE 0 END)`)
        for (let i = 0; i < colonnes.length; i++) valeurs.push(`%${mot}%`)
      }
      const score = morceaux.join(' + ')
      query.whereRaw(`(${score}) > 0`, valeurs)
      query.orderByRaw(`(${score}) DESC`, valeurs)
    }

    const ville = await db.from('villes').where('nom', user.ville ?? '').first()
    const resultats: Resultat[] = []
    const veut = (genre: string) => type === 'tous' || type === genre
    const lieu = (...parties: (string | null)[]) => parties.filter(Boolean).join(', ')

    if (ville && veut('service')) {
      const query = db
        .from('services as s')
        .leftJoin('categories_services as c', 'c.id', 's.categorie_id')
        .join('utilisateurs as u', 'u.id', 's.prestataire_id')
        .where('s.ville_id', ville.id)
        .where('s.visible', true)
        .where('s.disponible', true)
        .whereNot('s.prestataire_id', user.id)
        .select('s.*', 'c.nom as categorie_nom', 'u.nom as u_nom', 'u.prenom as u_prenom')
        .limit(50)
      appliquer(query, ['s.nom', 's.description', 'c.nom'])
      for (const r of await query) {
        resultats.push({
          genre: 'service',
          id: r.id,
          titre: r.nom,
          proprietaireId: r.prestataire_id,
          proprietaire: [r.u_prenom, r.u_nom].filter(Boolean).join(' '),
          categorie: r.categorie_nom,
          lieu: lieu(r.quartier, r.commune),
          telephone: r.telephone,
          prix: r.prix_min ? `dès ${Number(r.prix_min)} ${r.devise}` : null,
        })
      }
    }

    if (ville && veut('commerce')) {
      const query = db
        .from('etablissements as e')
        .leftJoin('categories_etablissements as c', 'c.id', 'e.categorie_id')
        .where('e.ville_id', ville.id)
        .where('e.ouvert', true)
        .whereNot('e.proprietaire_id', user.id)
        .select('e.*', 'c.nom as categorie_nom')
        .limit(50)
      appliquer(query, ['e.nom', 'e.description', 'e.adresse', 'e.marche', 'c.nom'])
      for (const r of await query) {
        resultats.push({
          genre: 'commerce',
          id: r.id,
          titre: r.nom,
          proprietaireId: r.proprietaire_id,
          proprietaire: null,
          categorie: r.categorie_nom,
          lieu: r.adresse,
          telephone: r.telephone || r.whatsapp,
          prix: null,
        })
      }
    }

    if (ville && veut('annonce')) {
      const query = db
        .from('annonces as a')
        .leftJoin('categories_produits as c', 'c.id', 'a.categorie_id')
        .join('utilisateurs as u', 'u.id', 'a.vendeur_id')
        .where('a.ville_id', ville.id)
        .where('a.visible', true)
        .where('a.disponible', true)
        .whereNot('a.vendeur_id', user.id)
        .select('a.*', 'c.nom as categorie_nom', 'u.nom as u_nom', 'u.prenom as u_prenom')
        .limit(50)
      if (intention) query.where('a.type_offre', intention)
      appliquer(query, ['a.titre', 'a.description', 'c.nom'])
      for (const r of await query) {
        resultats.push({
          genre: 'annonce',
          id: r.id,
          titre: r.titre,
          proprietaireId: r.vendeur_id,
          proprietaire: [r.u_prenom, r.u_nom].filter(Boolean).join(' '),
          categorie: r.categorie_nom,
          lieu: lieu(r.quartier, r.commune),
          telephone: r.telephone || r.whatsapp,
          prix: r.prix
            ? `${Number(r.prix)} ${r.devise}${r.type_offre === 'location' ? ' / ' + r.periodicite : ''}`
            : null,
        })
      }
    }

    // Comptes entreprise et administration (profils de la même ville)
    for (const [genre, typeCompte] of [
      ['entreprise', 'entreprise_agence'],
      ['administration', 'administration_publique'],
    ] as const) {
      if (!veut(genre)) continue
      const query = db
        .from('utilisateurs as u')
        .where('u.type_compte', typeCompte)
        .where('u.ville', user.ville ?? '')
        .where('u.actif', true)
        .whereNot('u.id', user.id)
        .limit(50)
      appliquer(query, [
        'u.nom',
        'u.domaine',
        'u.type_structure',
        'u.type_institution',
        'u.tutelle',
        'u.commune',
        'u.avenue',
      ])
      for (const r of await query) {
        resultats.push({
          genre,
          id: r.id,
          titre: r.nom,
          proprietaireId: r.id,
          proprietaire: null,
          categorie: r.domaine || r.type_institution || r.type_structure,
          lieu: lieu(r.avenue, r.commune, r.ville),
          telephone: r.telephone ? `${r.indicatif_pays ?? ''} ${r.telephone}`.trim() : null,
          prix: null,
        })
      }
    }

        // Retire les résultats que cet utilisateur a mis à la corbeille
        const masques = await db.from('resultats_masques').where('utilisateur_id', user.id)
        const caches = new Set(masques.map((m: any) => `${m.genre}:${m.offre_id}`))
        const visibles = resultats.filter((r) => !caches.has(`${r.genre}:${r.id}`))
    
        return view.render('pages/resultats', {
          resultats: visibles,
          q,
          type,
          portee: 'ville',
          villeConnue: !!ville,
          villeNom: user.ville,
          nbCorbeille: masques.length,
        })   
  }
}