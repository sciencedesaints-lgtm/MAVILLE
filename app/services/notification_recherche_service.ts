import db from '@adonisjs/lucid/services/db'
import { analyser, motsDe, normaliser, conditionFloue } from '#services/analyse_recherche'

type Auteur = {
  id: string | number
  ville: string | null
  prenom?: string | null
  nom?: string | null
}
type Candidat = {
  proprietaire: string
  genre: 'service' | 'commerce' | 'annonce'
  offreId: string
  offre: string
}

export class NotificationRechercheService {
  /** Retourne le nombre de vendeurs notifiés */
  static async notifier(auteur: Auteur, q: string, rechercheId: string): Promise<number> {
    const ville = await db.from('villes').where('nom', auteur.ville ?? '').first()
    if (!ville) return 0

    // Si la phrase cite une autre ville, on ne notifie pas les vendeurs de la sienne
    const phrase = ` ${motsDe(q).join(' ')} `
    const villes = await db.from('villes').select('nom')
    const autreVille = villes.some(
      (v: any) =>
        normaliser(v.nom) !== normaliser(ville.nom) && phrase.includes(` ${motsDe(v.nom).join(' ')} `)
    )
    if (autreVille) return 0

    const { mots, expressions, intention } = analyser(q)
    const termes = [...mots, ...expressions]
    if (!termes.length) return 0

    // Il faut au moins la moitié des termes de la recherche
    const seuil = Math.ceil(termes.length / 2)

    const filtrer = (query: any, colonnes: string[]) => {
      const morceaux: string[] = []
      const valeurs: string[] = []
      for (const t of termes) {
        const c = conditionFloue(colonnes, t)
        morceaux.push(`(CASE WHEN ${c.sql} THEN 1 ELSE 0 END)`)
        valeurs.push(...c.params)
      }
      const score = morceaux.join(' + ')
      query.whereRaw(`(${score}) >= ${seuil}`, valeurs)
      query.orderByRaw(`(${score}) DESC`, valeurs)
    }

    const auteurId = String(auteur.id)
    const candidats: Candidat[] = []

    const services = db
      .from('services as s')
      .leftJoin('categories_services as c', 'c.id', 's.categorie_id')
      .where('s.ville_id', ville.id)
      .where('s.visible', true)
      .where('s.disponible', true)
      .whereNot('s.prestataire_id', auteurId)
      .select('s.prestataire_id as proprietaire', 's.id as offre_id', 's.nom as offre')
    filtrer(services, ['s.nom', 's.description', 'c.nom'])
    for (const r of await services) {
      candidats.push({ proprietaire: r.proprietaire, genre: 'service', offreId: r.offre_id, offre: r.offre })
    }

    const commerces = db
      .from('etablissements as e')
      .leftJoin('categories_etablissements as c', 'c.id', 'e.categorie_id')
      .where('e.ville_id', ville.id)
      .where('e.visible', true)
      .where('e.ouvert', true)
      .whereNot('e.proprietaire_id', auteurId)
      .select('e.proprietaire_id as proprietaire', 'e.id as offre_id', 'e.nom as offre')
    filtrer(commerces, ['e.nom', 'e.description', 'c.nom', 'e.marche'])
    for (const r of await commerces) {
      candidats.push({ proprietaire: r.proprietaire, genre: 'commerce', offreId: r.offre_id, offre: r.offre })
    }

    const annonces = db
      .from('annonces as a')
      .leftJoin('categories_produits as c', 'c.id', 'a.categorie_id')
      .where('a.ville_id', ville.id)
      .where('a.visible', true)
      .where('a.disponible', true)
      .whereNot('a.vendeur_id', auteurId)
      .select('a.vendeur_id as proprietaire', 'a.id as offre_id', 'a.titre as offre')
    if (intention) annonces.where('a.type_offre', intention)
    filtrer(annonces, ['a.titre', 'a.description', 'c.nom'])
    for (const r of await annonces) {
      candidats.push({ proprietaire: r.proprietaire, genre: 'annonce', offreId: r.offre_id, offre: r.offre })
    }

    // Une seule ligne par vendeur (sa première offre = la mieux classée)
    const parVendeur = new Map<string, Candidat>()
    for (const c of candidats) {
      if (!parVendeur.has(c.proprietaire)) parVendeur.set(c.proprietaire, c)
    }
    if (!parVendeur.size) return 0

    const ids = [...parVendeur.keys()]
    const reglages = await db.from('utilisateurs').whereIn('id', ids).select('id', 'reponse_auto')
    const auto = new Set(reglages.filter((u: any) => u.reponse_auto).map((u: any) => u.id))

    const nomChercheur = [auteur.prenom, auteur.nom].filter(Boolean).join(' ') || 'Un habitant'

    const reponses: any[] = []
    const notifications: any[] = []

    for (const [vendeurId, c] of parVendeur) {
      const estAuto = auto.has(vendeurId)

      reponses.push({
        recherche_id: rechercheId,
        vendeur_id: vendeurId,
        genre: c.genre,
        offre_id: c.offreId,
        offre_titre: c.offre,
        statut: estAuto ? 'disponible' : 'en_attente',
        mode: estAuto ? 'auto' : null,
        repondu_at: estAuto ? new Date() : null,
      })

      notifications.push({
        utilisateur_id: vendeurId,
        type: 'DEMANDE_RECHERCHE',
        titre: estAuto ? '✅ Réponse automatique envoyée' : '🔔 Une personne sollicite vos services',
        message: estAuto
          ? `${nomChercheur} recherche : « ${q} ». Votre offre « ${c.offre} » a été confirmée disponible automatiquement.`
          : `${nomChercheur} souhaite savoir si vous pouvez répondre à sa recherche : « ${q} ». Cela correspond à votre offre « ${c.offre} ».`,
        lien: '/profil/demandes',
      })
    }

    await db.table('reponses_recherche').insert(reponses).onConflict(['recherche_id', 'vendeur_id']).ignore()
    await db.table('notifications').insert(notifications)

    // Le chercheur est prévenu une seule fois des confirmations automatiques
    const nbAuto = reponses.filter((r) => r.statut === 'disponible').length
    if (nbAuto > 0) {
      await db.table('notifications').insert({
        utilisateur_id: auteurId,
        type: 'REPONSE_VENDEUR',
        titre: '✅ Des vendeurs ont confirmé leur disponibilité',
        message: `${nbAuto} vendeur(s) ont confirmé qu'ils peuvent répondre à votre recherche : « ${q} ».`,
        lien: `/resultats?q=${encodeURIComponent(q)}&r=${rechercheId}`,
      })
    }

    return notifications.length
  }
}