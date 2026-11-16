import db from '@adonisjs/lucid/services/db'

/**
 * Retourne le commerce d'une entreprise, en le créant s'il n'existe pas.
 * Retourne null si la création est impossible (ville ou catégorie inconnue).
 */
export async function assurerCommerce(utilisateurId: string) {
  const existant = await db
    .from('etablissements')
    .where('proprietaire_id', utilisateurId)
    .orderBy('created_at')
    .first()
  if (existant) return existant

  const u = await db.from('utilisateurs').where('id', utilisateurId).first()
  if (!u || u.type_compte !== 'entreprise_agence') return null

  const ville = await db.from('villes').where('nom', u.ville ?? '').first()
  const categorie = await db.from('categories_etablissements').where('slug', 'autre-commerce').first()
  if (!ville || !categorie) return null

  const adresse =
    [
      u.avenue ? `Avenue/Rue ${u.avenue}${u.numero ? ' n°' + u.numero : ''}` : null,
      u.commune,
      u.ville,
    ]
      .filter(Boolean)
      .join(', ') || String(u.ville)

  const slug =
    String(u.nom_entreprise || u.nom)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') +
    '-' +
    Date.now()

  const [commerce] = await db
    .table('etablissements')
    .insert({
      proprietaire_id: u.id,
      categorie_id: categorie.id,
      ville_id: ville.id,
      nom: String(u.nom_entreprise || u.nom).slice(0, 200),
      slug,
      description: u.domaine || null,
      telephone: u.telephone ? `${u.indicatif_pays ?? ''} ${u.telephone}`.trim().slice(0, 30) : null,
      email: u.email,
      adresse: adresse.slice(0, 255),
      quartier: u.commune,
      commune: u.commune,
      avenue: u.avenue,
      numero: u.numero,
      type_commerce: 'boutique',
    })
    .returning('*')
  return commerce
}