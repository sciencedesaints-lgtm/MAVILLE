import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { MOTS_VIDES, normaliser, norm } from '#services/analyse_recherche'

type Resultat = {
  id: string
  genre: 'service' | 'commerce' | 'annonce' | 'entreprise' | 'administration'
  titre: string
  proprietaireId: string
  proprietaire: string | null
  categorie: string | null
  lieu: string
  telephone: string | null
  prix: string | null
  statut: string | null
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MOTS_VENTE = new Set(['vendre', 'vente', 'vend', 'vends', 'acheter', 'achat', 'achete', 'acquerir'])
const MOTS_LOCATION = new Set(['louer', 'location', 'loue', 'loyer', 'locat', 'louez'])
const MARQUEURS_LIEU = new Set(['quartier', 'commune', 'avenue', 'av', 'rue', 'marche'])

export default class ResultatsController {
  async index({ request, view, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const q = String(request.input('q') ?? '').trim()
    const type = String(request.input('type') ?? 'tous')
    const rechercheId = String(request.input('r') ?? '')

    // ---------- Analyse de la phrase ----------
    let texteNorm = normaliser(q)

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

    const appliquer = (query: any, colonnesTexte: string[], colonnesLieu: string[]) => {
      const termes: { valeur: string; poids: number; colonnes: string[] }[] = []
      for (const m of motsUniques) {
        termes.push({ valeur: m, poids: 1, colonnes: [...colonnesTexte, ...colonnesLieu] })
      }
      for (const l of lieuxUniques) {
        termes.push({ valeur: l, poids: 3, colonnes: [...colonnesLieu, ...colonnesTexte] })
      }
      for (const e of expressions) {
        termes.push({ valeur: e, poids: 2, colonnes: colonnesTexte })
      }
      if (!termes.length) return

      const morceaux: string[] = []
      const valeurs: string[] = []
      for (const t of termes) {
        const conditions = t.colonnes.map((c) => `${norm(c)} LIKE ?`).join(' OR ')
        morceaux.push(`(CASE WHEN ${conditions} THEN ${t.poids} ELSE 0 END)`)
        for (let i = 0; i < t.colonnes.length; i++) valeurs.push(`%${normaliser(t.valeur)}%`)
      }
      const score = morceaux.join(' + ')
      query.whereRaw(`(${score}) > 0`, valeurs)
      query.orderByRaw(`(${score}) DESC`, valeurs)
    }

    // ---------- Requêtes ----------
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
      appliquer(query, ['s.nom', 's.description', 'c.nom'], ['s.quartier', 's.commune', 's.adresse'])
      for (const r of await query) {
        resultats.push({
          id: r.id,
          genre: 'service',
          titre: r.nom,
          proprietaireId: r.prestataire_id,
          proprietaire: [r.u_prenom, r.u_nom].filter(Boolean).join(' '),
          categorie: r.categorie_nom,
          lieu: lieu(r.quartier, r.commune),
          telephone: r.telephone,
          prix: r.prix_min ? `dès ${Number(r.prix_min)} ${r.devise}` : null,
          statut: null,
        })
      }
    }

    if (ville && veut('commerce')) {
      const query = db
        .from('etablissements as e')
        .leftJoin('categories_etablissements as c', 'c.id', 'e.categorie_id')
        .where('e.ville_id', ville.id)
        .where('e.visible', true)
        .where('e.ouvert', true)
        .whereNot('e.proprietaire_id', user.id)
        .select('e.*', 'c.nom as categorie_nom')
        .limit(50)
      appliquer(
        query,
        ['e.nom', 'e.description', 'c.nom'],
        ['e.adresse', 'e.marche', 'e.quartier', 'e.commune', 'e.avenue', 'e.repere', 'e.emplacement']
      )
      for (const r of await query) {
        resultats.push({
          id: r.id,
          genre: 'commerce',
          titre: r.nom,
          proprietaireId: r.proprietaire_id,
          proprietaire: null,
          categorie: r.categorie_nom,
          lieu: r.adresse,
          telephone: r.telephone || r.whatsapp,
          prix: null,
          statut: null,
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
      appliquer(query, ['a.titre', 'a.description', 'c.nom'], ['a.quartier', 'a.commune', 'a.avenue', 'a.repere'])
      for (const r of await query) {
        resultats.push({
          id: r.id,
          genre: 'annonce',
          titre: r.titre,
          proprietaireId: r.vendeur_id,
          proprietaire: [r.u_prenom, r.u_nom].filter(Boolean).join(' '),
          categorie: r.categorie_nom,
          lieu: lieu(r.quartier, r.commune),
          telephone: r.telephone || r.whatsapp,
          prix: r.prix
            ? `${Number(r.prix)} ${r.devise}${r.type_offre === 'location' ? ' / ' + r.periodicite : ''}`
            : null,
          statut: null,
        })
      }
    }

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
      appliquer(
        query,
        ['u.nom', 'u.domaine', 'u.type_structure', 'u.type_institution', 'u.tutelle'],
        ['u.commune', 'u.avenue']
      )
      for (const r of await query) {
        resultats.push({
          id: r.id,
          genre,
          titre: r.nom,
          proprietaireId: r.id,
          proprietaire: null,
          categorie: r.domaine || r.type_institution || r.type_structure,
          lieu: lieu(r.avenue, r.commune, r.ville),
          telephone: r.telephone ? `${r.indicatif_pays ?? ''} ${r.telephone}`.trim() : null,
          prix: null,
          statut: null,
        })
      }
    }

    // ---------- Réponses des vendeurs à CETTE recherche ----------
    if (UUID.test(rechercheId)) {
      const reponses = await db
        .from('reponses_recherche as rr')
        .join('recherches as r', 'r.id', 'rr.recherche_id')
        .where('rr.recherche_id', rechercheId)
        .where('r.utilisateur_id', user.id)
        .select('rr.genre', 'rr.offre_id', 'rr.statut')
      const parOffre = new Map(reponses.map((x: any) => [`${x.genre}:${x.offre_id}`, x.statut]))
      for (const r of resultats) {
        r.statut = parOffre.get(`${r.genre}:${r.id}`) ?? null
      }
    }

    // Confirmés d'abord, puis en attente, puis sans réponse, puis indisponibles
    const rang = (s: string | null) =>
      s === 'disponible' ? 0 : s === 'en_attente' ? 1 : s === 'indisponible' ? 3 : 2
    resultats.sort((a, b) => rang(a.statut) - rang(b.statut))

    // ---------- Corbeille ----------
    const masques = await db.from('resultats_masques').where('utilisateur_id', user.id)
    const caches = new Set(masques.map((m: any) => `${m.genre}:${m.offre_id}`))
    const visibles = resultats.filter((r) => !caches.has(`${r.genre}:${r.id}`))

    return view.render('pages/resultats', {
      resultats: visibles,
      q,
      type,
      portee: 'ville',
      rechercheId: UUID.test(rechercheId) ? rechercheId : '',
      villeConnue: !!ville,
      villeNom: user.ville,
      nbCorbeille: masques.length,
    })
  }
}