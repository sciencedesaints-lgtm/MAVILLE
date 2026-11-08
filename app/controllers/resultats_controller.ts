import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

type Resultat = {
    genre: 'service' | 'commerce' | 'annonce' | 'entreprise' | 'administration'
    titre: string
    proprietaireId: string
    proprietaire: string | null
    categorie: string | null
    lieu: string
    telephone: string | null
    prix: string | null
  }

export default class ResultatsController {
  async index({ request, view, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const q = String(request.input('q') ?? '').trim()
    const type = String(request.input('type') ?? 'tous')

    // "canes corso" -> ["cane", "corso"] (retire le s final, ignore les mots trop courts)
    const mots = q
      .toLowerCase()
      .split(/\s+/)
      .map((m) => (m.length > 3 ? m.replace(/s$/, '') : m))
      .filter((m) => m.length >= 2)

    // Applique "chaque mot doit apparaître dans au moins une des colonnes"
    const filtrer = (query: any, colonnes: string[]) => {
      for (const mot of mots) {
        query.where((groupe: any) => {
          for (const col of colonnes) groupe.orWhereILike(col, `%${mot}%`)
        })
      }
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
      filtrer(query, ['s.nom', 's.description', 'c.nom'])
      for (const r of await query) {
        resultats.push({
            genre: 'service',
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
        .where('e.visible', true)
        .whereNot('e.proprietaire_id', user.id)
        .select('e.*', 'c.nom as categorie_nom')
        .limit(50)
      filtrer(query, ['e.nom', 'e.description', 'e.adresse', 'e.marche', 'c.nom'])
      for (const r of await query) {
        resultats.push({
            genre: 'commerce',
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
      filtrer(query, ['a.titre', 'a.description', 'c.nom'])
      for (const r of await query) {
        resultats.push({
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
      filtrer(query, [
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

    return view.render('pages/resultats', {
      resultats,
      q,
      type,
      villeConnue: !!ville,
      villeNom: user.ville,
    })
  }
}