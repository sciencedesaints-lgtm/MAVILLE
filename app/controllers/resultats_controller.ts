import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { MOTS_VIDES, normaliser, conditionFloue } from '#services/analyse_recherche'
import { detecterLieux, racine } from '#services/lieux'

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
  articles?: { nom: string; prix: string; description: string | null; photo: string | null }[]
  medias?: { url: string; type: string }[]
  nbArticles?: number
  voirPlus?: string | null
  statut: string | null
  distanceKm: number | null
  distanceTexte: string | null
  entete: string | null
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MOTS_VENTE = new Set(['vendre', 'vente', 'vend', 'vends', 'acheter', 'achat', 'achete', 'acquerir'])
const MOTS_LOCATION = new Set(['louer', 'location', 'loue', 'loyer', 'locat', 'louez'])
const MARQUEURS_LIEU = new Set(['quartier', 'commune', 'avenue', 'av', 'rue', 'marche'])

const RAYON_KM = 2

const coupe = (t: string | null) => (t && t.length > 180 ? t.slice(0, 177) + '…' : t || null)

export default class ResultatsController {
  async index({ request, view, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const q = String(request.input('q') ?? '').trim()
    const type = String(request.input('type') ?? 'tous')
    const rechercheId = String(request.input('r') ?? '')

    // ---------- Position de celui qui cherche ----------
    const nb = (v: unknown) => {
      const n = Number(String(v ?? '').replace(',', '.'))
      return String(v ?? '').trim() !== '' && Number.isFinite(n) ? n : null
    }
    let maLat = nb(request.input('lat'))
    let maLng = nb(request.input('lng'))
    let positionConnue =
      maLat !== null && maLng !== null && Math.abs(maLat) <= 90 && Math.abs(maLng) <= 180
    // Distance en km (formule de haversine) ; null si l'offre n'a pas de position
    const distance = (lat: unknown, lng: unknown): number | null => {
      if (!positionConnue || lat === null || lat === undefined || lng === null || lng === undefined) return null
      const la = Number(lat)
      const ln = Number(lng)
      if (!Number.isFinite(la) || !Number.isFinite(ln) || (la === 0 && ln === 0)) return null
      const rad = (d: number) => (d * Math.PI) / 180
      const dLat = rad(la - maLat!)
      const dLng = rad(ln - maLng!)
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(rad(maLat!)) * Math.cos(rad(la)) * Math.sin(dLng / 2) ** 2
      return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    }

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

    let motsUniques = [...new Set(mots)]
    let lieuxUniques = [...new Set(lieux)]

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
        // ---------- Lieux connus cités dans la phrase (« maison au golf ») ----------
        let lieuReference: string | null = null
        if (ville) {
          const trouves = await detecterLieux(ville.id, ville.nom, q)
          if (trouves.length) {
            const motsDuLieu = new Set(trouves.flatMap((l) => l.mots.map(racine)))
            // ces mots désignent le lieu : on ne les cherche plus comme des mots ordinaires
            motsUniques = motsUniques.filter((m) => !motsDuLieu.has(m))
            lieuxUniques = [...new Set([...lieuxUniques, ...motsDuLieu])]
    
            // Si le lieu a des coordonnées, les distances sont mesurées depuis ce lieu
            const precis = trouves.find((l) => l.latitude !== null && l.longitude !== null)
            if (precis) {
              maLat = precis.latitude
              maLng = precis.longitude
              positionConnue = true
              lieuReference = precis.nom
            }
          }
        }
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
                // Service itinérant : position valable seulement si envoyée il y a moins de 10 minutes
                const enDirect =
                r.itinerant && r.position_maj_at && Date.now() - new Date(r.position_maj_at).getTime() < 10 * 60 * 1000
        const details: string[] = []
        if (r.intervention_domicile) details.push('🏠 À domicile')
        if (r.urgence) details.push('⚡ Urgences')
        if (r.sur_rendez_vous) details.push('📅 Sur rendez-vous')
        if (r.prix_negociable) details.push('🤝 Prix négociable')
        if (r.delai) details.push(`⏱ ${r.delai}`)
        if (r.itinerant) details.push(enDirect ? '🟢 En service, position en direct' : '⚪ Itinérant : hors service pour le moment')
        resultats.push({
          id: r.id,
          genre: 'service',
          titre: r.nom,
          proprietaireId: r.prestataire_id,
          proprietaire: nomComplet(r.u_prenom, r.u_nom),
          categorie: r.categorie_nom,
          lieu: lieu(r.adresse, r.quartier, r.commune),
          telephone: r.telephone,
          prix: r.prix_min ? `dès ${Number(r.prix_min)} ${r.devise}` : null,
          description: coupe(r.description),
          details,
          statut: null,
          distanceKm: r.itinerant ? (enDirect ? distance(r.latitude, r.longitude) : null) : distance(r.latitude, r.longitude),
          distanceTexte: null,
          entete: null,
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
          distanceKm: distance(r.latitude, r.longitude),
          distanceTexte: null,
          entete: null,
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
          lieu: lieu(
            r.avenue ? `Avenue ${r.avenue}` : null,
            r.quartier,
            r.commune,
            r.repere ? `Repère : ${r.repere}` : null
          ),
          telephone: r.telephone || r.whatsapp,
          prix: r.prix
            ? `${Number(r.prix)} ${r.devise}${r.type_offre === 'location' ? ' / ' + r.periodicite : ''}`
            : null,
          description: coupe(r.description),
          details,
          statut: null,
          distanceKm: distance(r.latitude, r.longitude),
          distanceTexte: null,
          entete: null,
        })
      }
    }

    // Entreprises et administrations : nom, domaine ET activités cochées
    const EXPR_ACTIVITES = `(SELECT string_agg(a2.nom, ' | ' ORDER BY a2.ordre, a2.nom)
      FROM utilisateur_activites ua2
      JOIN activites a2 ON a2.id = ua2.activite_id
      WHERE ua2.utilisateur_id = u.id)`

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
        .select('u.*', db.raw(`${EXPR_ACTIVITES} as activites_noms`))
        .limit(50)
      appliquer(
        query,
        ['u.nom', 'u.domaine', 'u.type_structure', 'u.type_institution', EXPR_ACTIVITES],
        ['u.tutelle'],
        ['u.commune', 'u.avenue']
      )
      for (const r of await query) {
        const details: string[] = []
        if (r.activites_noms) details.push(`🏷️ ${String(r.activites_noms).split(' | ').join(' · ')}`)
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
          details,
          statut: null,
          distanceKm: distance(r.latitude, r.longitude),
          distanceTexte: null,
          entete: null,
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
          distanceKm: distance(r.latitude, r.longitude),
          distanceTexte: null,
          entete: null,
        })
      }
    }

    // Articles des commerces : le résultat est le commerce, avec les articles trouvés
    const aTermes = motsUniques.length || lieuxUniques.length || expressions.length
    if (ville && veut('commerce') && aTermes) {
      const query = db
        .from('produits as p')
        .join('etablissements as e', 'e.id', 'p.etablissement_id')
        .leftJoin('categories_produits as c', 'c.id', 'p.categorie_id')
        .where('e.ville_id', ville.id)
        .where('e.visible', true)
        .where('e.ouvert', true)
        .where('p.visible', true)
        .where('p.disponible', true)
        .whereNot('e.proprietaire_id', user.id)
        .select(
          'p.*',
          'c.nom as categorie_nom',
          'e.id as e_id',
          'e.nom as e_nom',
          'e.proprietaire_id as e_proprietaire',
          'e.adresse as e_adresse',
          'e.telephone as e_tel',
          'e.whatsapp as e_wa',
          'e.horaires as e_horaires',
          'e.livraison as e_livraison',
          'e.latitude as e_lat',
          'e.longitude as e_lng'
        )
        .limit(100)
      appliquer(
        query,
        ['p.nom', 'c.nom'],
        ['p.description'],
        ['e.adresse', 'e.marche', 'e.quartier', 'e.commune', 'e.avenue']
      )
      const lignes = await query

      if (lignes.length) {
        const idsArticles = lignes.map((l: any) => l.id)
        const idsCommerces = [...new Set(lignes.map((l: any) => l.e_id))] as string[]

        const images = await db.from('images_produits').whereIn('produit_id', idsArticles).orderBy('ordre')
        const totaux = await db
          .from('produits')
          .whereIn('etablissement_id', idsCommerces)
          .where('visible', true)
          .where('disponible', true)
          .groupBy('etablissement_id')
          .select('etablissement_id')
          .count('* as n')
        const nbParCommerce = new Map(totaux.map((t: any) => [t.etablissement_id, Number(t.n)]))

        for (const idCommerce of idsCommerces) {
          const siens = lignes.filter((l: any) => l.e_id === idCommerce)
          const premier = siens[0]

          const articles = siens.slice(0, 3).map((l: any) => ({
            nom: l.nom,
            prix: Number(l.prix) > 0
              ? `${Number(l.prix)} ${l.devise}${l.unite ? ' / ' + l.unite : ''}`
              : 'Prix à discuter',
            description: coupe(l.description),
            photo: images.find((i: any) => i.produit_id === l.id)?.url ?? null,
          }))

          const details: string[] = []
          if (premier.e_horaires) details.push(`🕒 ${premier.e_horaires}`)
          if (premier.e_livraison) details.push('🚚 Livraison')

          const existant = resultats.find((r) => r.genre === 'commerce' && r.id === idCommerce)
          if (existant) {
            existant.articles = articles
            existant.nbArticles = nbParCommerce.get(idCommerce) ?? articles.length
            existant.voirPlus = `/commerce/${idCommerce}/catalogue`
          } else {
            resultats.push({
              id: idCommerce,
              genre: 'commerce',
              titre: premier.e_nom,
              proprietaireId: premier.e_proprietaire,
              proprietaire: null,
              categorie: premier.categorie_nom,
              lieu: premier.e_adresse,
              telephone: premier.e_tel || premier.e_wa,
              prix: null,
              description: null,
              details,
              statut: null,
              articles,
              nbArticles: nbParCommerce.get(idCommerce) ?? articles.length,
              voirPlus: `/commerce/${idCommerce}/catalogue`,
              distanceKm: distance(premier.e_lat, premier.e_lng),
              distanceTexte: null,
              entete: null,
            })
          }
        }
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

    // ---------- Corbeille ----------
    const masques = await db.from('resultats_masques').where('utilisateur_id', user.id)
    const caches = new Set(masques.map((m: any) => `${m.genre}:${m.offre_id}`))
    const visibles = resultats.filter((r) => !caches.has(`${r.genre}:${r.id}`))

        // Photos et vidéos des offres
        const idsOffres = visibles
        .filter((r) => ['service', 'commerce', 'annonce'].includes(r.genre))
        .map((r) => r.id)
      const medias = idsOffres.length
        ? await db.from('offres_medias').whereIn('offre_id', idsOffres).orderBy('ordre')
        : []
      for (const r of visibles) {
        r.medias = medias
          .filter((m: any) => m.offre_id === r.id && m.type_offre === r.genre)
          .map((m: any) => ({ url: m.url, type: m.type }))
      }

        // ---------- Texte de la distance ----------
        const depuis = lieuReference ? lieuReference : 'vous'
        for (const r of visibles) {
          if (r.distanceKm !== null) {
            r.distanceTexte =
              r.distanceKm < 1
                ? `à ${Math.round(r.distanceKm * 100) * 10} m de ${depuis}`
                : `à ${r.distanceKm.toFixed(1)} km de ${depuis}`
          }
        }
    
        // ---------- Organisation en blocs ----------
        const rang = (s: string | null) =>
          s === 'disponible' ? 0 : s === 'en_attente' ? 1 : s === 'indisponible' ? 3 : 2
    
        let liste: Resultat[] = []
        let nbProches = 0
        let messageProche: string | null = null
    
        if (lieuxUniques.length && !lieuReference) {
          // Lieu cité sans coordonnées connues : recherche par le texte seulement
          visibles.sort((a, b) => rang(a.statut) - rang(b.statut))
          if (visibles.length) visibles[0].entete = '📌 Résultats pour le lieu demandé'
          liste = visibles
        } else {
          const proches = visibles
            .filter((r) => r.distanceKm !== null && r.distanceKm <= RAYON_KM)
            .sort((a, b) => (a.distanceKm as number) - (b.distanceKm as number))
          const autres = visibles
            .filter((r) => !(r.distanceKm !== null && r.distanceKm <= RAYON_KM))
            .sort((a, b) => rang(a.statut) - rang(b.statut) || (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
    
          nbProches = proches.length
          if (positionConnue) {
            const ou = lieuReference ? `de ${lieuReference}` : 'de vous'
            if (proches.length) {
              proches[0].entete = `📍 Près ${ou} (moins de ${RAYON_KM} km)`
            } else {
              messageProche = `Aucun résultat dans un rayon de ${RAYON_KM} km autour ${ou}.`
            }
            if (autres.length) autres[0].entete = '🏙️ Dans toute la ville'
          }
          liste = [...proches, ...autres]
        }
    
        response.header('Cache-Control', 'no-store')
    
        return view.render('pages/resultats', {
          resultats: liste,
          q,
          type,
          portee: 'ville',
          rechercheId: UUID.test(rechercheId) ? rechercheId : '',
          villeConnue: !!ville,
          villeNom: user.ville,
          nbCorbeille: masques.length,
          lat: positionConnue && !lieuReference ? String(maLat) : '',
          lng: positionConnue && !lieuReference ? String(maLng) : '',
          positionConnue,
          nbProches,
          messageProche,
          lieuCite: lieuxUniques.length > 0,
        })
  }
}