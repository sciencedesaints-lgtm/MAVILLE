import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { MOTS_VIDES, normaliser, conditionFloue } from '#services/analyse_recherche'

type Resultat = {
  id: string
  genre: 'service' | 'commerce' | 'annonce' | 'entreprise' | 'administration' | 'professionnel'
  titre: string
  proprietaireId: string
  proprietaire: string | null
  categorie: string | null
  lieu: string
  telephone: string | null
  prix: string | null
  description: string | null
  details: string[]
  statut: string | null
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MOTS_VENTE = new Set(['vendre', 'vente', 'vend', 'vends', 'acheter', 'achat', 'achete', 'acquerir'])
const MOTS_LOCATION = new Set(['louer', 'location', 'loue', 'loyer', 'locat', 'louez'])
const MARQUEURS_LIEU = new Set(['quartier', 'commune', 'avenue', 'av', 'rue', 'marche'])

const coupe = (t: string | null) => (t && t.length > 180 ? t.slice(0, 177) + '…' : t || null)

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

    // Nom/titre/catégorie = 2 points, description = 1 point, lieu cité = 3 points. Minimum : 2 points.
    const appliquer = (
      query: any,
      principales: string[],
      secondaires: string[],
      colonnesLieu: string[]
    ) => {
      type Terme = { valeur: string; p: string[]; s: string[]; poidsP: number; poidsS: number }
      const termes: Terme[] = []
      for (const m of motsUniques) {
        termes.push({ valeur: m, p: principales, s: [...secondaires, ...colonnesLieu], poidsP: 2, poidsS: 1 })
      }
      for (const l of lieuxUniques) {
        termes.push({ valeur: l, p: colonnesLieu, s: [...principales, ...secondaires], poidsP: 3, poidsS: 1 })
      }
      for (const e of expressions) {
        termes.push({ valeur: e, p: [...principales, ...secondaires], s: [], poidsP: 2, poidsS: 0 })
      }
      if (!termes.length) return

      const morceaux: string[] = []
      const valeurs: string[] = []
      for (const t of termes) {
        const pp = conditionFloue(t.p, t.valeur)
        let sql = `CASE WHEN ${pp.sql} THEN ${t.poidsP}`
        valeurs.push(...pp.params)
        if (t.s.length) {
          const ss = conditionFloue(t.s, t.valeur)
          sql += ` WHEN ${ss.sql} THEN ${t.poidsS}`
          valeurs.push(...ss.params)
        }
        sql += ' ELSE 0 END'
        morceaux.push(`(${sql})`)
      }
      const score = morceaux.join(' + ')
      query.whereRaw(`(${score}) >= 2`, valeurs)
      query.orderByRaw(`(${score}) DESC`, valeurs)
    }
    // ---------- Requêtes ----------
    const ville = await db.from('villes').where('nom', user.ville ?? '').first()
    const resultats: Resultat[] = []
    const veut = (genre: string) => type === 'tous' || type === genre
    const lieu = (...parties: (string | null)[]) => parties.filter(Boolean).join(', ')
    const nomComplet = (p: string | null, n: string | null) => [p, n].filter(Boolean).join(' ')

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
      appliquer(query, ['s.nom', 'c.nom'], ['s.description'], ['s.quartier', 's.commune', 's.adresse'])
      for (const r of await query) {
        const details: string[] = []
        if (r.intervention_domicile) details.push('🏠 À domicile')
        if (r.urgence) details.push('⚡ Urgences')
        if (r.sur_rendez_vous) details.push('📅 Sur rendez-vous')
        if (r.prix_negociable) details.push('🤝 Prix négociable')
        resultats.push({
          id: r.id,
          genre: 'service',
          titre: r.nom,
          proprietaireId: r.prestataire_id,
          proprietaire: nomComplet(r.u_prenom, r.u_nom),
          categorie: r.categorie_nom,
          lieu: lieu(r.quartier, r.commune),
          telephone: r.telephone,
          prix: r.prix_min ? `dès ${Number(r.prix_min)} ${r.devise}` : null,
          description: coupe(r.description),
          details,
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
        ['e.nom', 'c.nom'],
        ['e.description'],
        ['e.adresse', 'e.marche', 'e.quartier', 'e.commune', 'e.avenue', 'e.repere', 'e.emplacement']
      )
      for (const r of await query) {
        const details: string[] = []
        if (r.horaires) details.push(`🕒 ${r.horaires}`)
        if (r.livraison) details.push('🚚 Livraison')
        if (Array.isArray(r.mobile_money) && r.mobile_money.length) {
          details.push(`💸 ${r.mobile_money.join(', ')}`)
        }
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
          description: coupe(r.description),
          details,
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
      appliquer(query, ['a.titre', 'c.nom'], ['a.description'], ['a.quartier', 'a.commune', 'a.avenue', 'a.repere'])
      const etats: Record<string, string> = { neuf: 'Neuf', bon_etat: 'Bon état', occasion: 'Occasion' }
      for (const r of await query) {
        const details: string[] = [r.type_offre === 'location' ? '🔑 À louer' : '💰 À vendre']
        if (r.etat && etats[r.etat]) details.push(etats[r.etat])
        if (r.prix_negociable) details.push('🤝 Prix négociable')
        resultats.push({
          id: r.id,
          genre: 'annonce',
          titre: r.titre,
          proprietaireId: r.vendeur_id,
          proprietaire: nomComplet(r.u_prenom, r.u_nom),
          categorie: r.categorie_nom,
          lieu: lieu(r.quartier, r.commune),
          telephone: r.telephone || r.whatsapp,
          prix: r.prix
            ? `${Number(r.prix)} ${r.devise}${r.type_offre === 'location' ? ' / ' + r.periodicite : ''}`
            : null,
          description: coupe(r.description),
          details,
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
        ['u.nom', 'u.domaine', 'u.type_structure', 'u.type_institution'],
        ['u.tutelle'],
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
          description: r.tutelle ? `Tutelle : ${r.tutelle}` : null,
          details: [],
          statut: null,
        })
      }
    }

        // Particuliers trouvés par leur profession ou leur qualification (fautes tolérées)
        if (veut('professionnel') && (motsUniques.length || type === 'professionnel')) {
          const query = db
            .from('utilisateurs as u')
            .where('u.type_compte', 'personnel')
            .where('u.ville', user.ville ?? '')
            .where('u.actif', true)
            .whereNotNull('u.profession')
            .whereNot('u.id', user.id)
            .limit(50)
    
          // "plomberie" et "plombier" partagent le radical "plomb"
          const radicaux = [...new Set(motsUniques.map((m) => (m.length >= 7 ? m.slice(0, 5) : m)))]
          if (radicaux.length) {
            const morceaux: string[] = []
            const valeurs: string[] = []
            for (const rad of radicaux) {
              const c = conditionFloue(['u.profession', 'u.qualification'], rad)
              morceaux.push(`(${c.sql})`)
              valeurs.push(...c.params)
            }
            query.whereRaw(`(${morceaux.join(' OR ')})`, valeurs)
          }
    
          for (const r of await query) {
            resultats.push({
              id: r.id,
              genre: 'professionnel',
              titre: nomComplet(r.prenom, r.nom),
              proprietaireId: r.id,
              proprietaire: null,
              categorie: r.profession,
              lieu: lieu(r.quartier, r.commune, r.ville),
              telephone: r.telephone,
              prix: null,
              description: coupe(r.qualification),
              details: [],
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