import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { readFile } from 'node:fs/promises'
import { normaliser } from '#services/analyse_recherche'
import { lireCsv } from '#services/csv'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_IMPORT = 500

const texte = (v: unknown) => String(v ?? '').trim() || null

const fairSlug = (nom: string, suffixe: string) =>
  nom
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') +
  '-' +
  suffixe

// Tarif : vide = non précisé, 0 = gratuit
const lireTarif = (v: unknown): number | null | undefined => {
  const brut = String(v ?? '').replace(/\s/g, '').replace(',', '.')
  if (brut === '') return null
  const n = Number(brut)
  return Number.isNaN(n) || n < 0 ? undefined : n
}

export default class PrestationsController {
  private reserve(user: any) {
    return user.typeCompte === 'administration_publique'
  }

  async index({ view, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!this.reserve(user)) return response.redirect().toRoute('publications.index')

    const categories = await db.from('categories_services').where('active', true).orderBy('ordre_affichage')
    const lignes = await db
      .from('services as s')
      .leftJoin('categories_services as c', 'c.id', 's.categorie_id')
      .where('s.prestataire_id', user.id)
      .select('s.*', 'c.nom as categorie_nom')
      .orderBy('s.created_at', 'desc')

    const prestations = lignes.map((l: any) => ({
      id: l.id,
      nom: l.nom,
      description: l.description,
      categorie: l.categorie_nom,
      delai: l.delai,
      pieces: l.pieces_requises,
      tarif:
        l.prix_min === null ? 'Tarif non précisé' : Number(l.prix_min) === 0 ? 'Gratuit' : `${Number(l.prix_min)} ${l.devise}`,
    }))

    return view.render('pages/prestations', { categories, prestations })
  }

  async store({ request, response, auth, session }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!this.reserve(user)) return response.redirect().toRoute('publications.index')

    const nom = texte(request.input('nom'))
    const categorieId = Number(request.input('categorie_id'))
    if (!nom || nom.length < 3 || !categorieId) {
      session.flash('erreur', 'Indiquez le nom de la prestation et sa catégorie.')
      return response.redirect().back()
    }
    const tarif = lireTarif(request.input('tarif'))
    if (tarif === undefined) {
      session.flash('erreur', 'Le tarif doit être un nombre positif (ou vide, ou 0 si gratuit).')
      return response.redirect().back()
    }

    const ville = await db.from('villes').where('nom', user.ville ?? '').first()
    if (!ville) {
      session.flash('erreur', "Votre ville n'est pas reconnue : impossible d'enregistrer la prestation.")
      return response.redirect().back()
    }

    await db.table('services').insert({
      prestataire_id: user.id,
      categorie_id: categorieId,
      ville_id: ville.id,
      nom: nom.slice(0, 255),
      slug: fairSlug(nom, String(Date.now())),
      description: texte(request.input('description')),
      prix_min: tarif,
      devise: ['USD', 'CDF', 'EUR'].includes(String(request.input('devise'))) ? String(request.input('devise')) : 'CDF',
      delai: texte(request.input('delai'))?.slice(0, 150) ?? null,
      pieces_requises: texte(request.input('pieces')),
      telephone: user.telephone ? `${user.indicatifPays ?? ''} ${user.telephone}`.trim().slice(0, 30) : null,
      email: user.email,
      commune: user.commune,
      adresse: [user.avenue, user.commune].filter(Boolean).join(', ').slice(0, 255) || null,
    })

    session.flash('succes', `« ${nom} » a été ajoutée.`)
    return response.redirect().back()
  }

  // Import CSV : nom;categorie;tarif;devise;delai;pieces;description
  async importer({ request, response, auth, session }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!this.reserve(user)) return response.redirect().toRoute('publications.index')

    const fichier = request.file('fichier', { size: '2mb', extnames: ['csv', 'txt'] })
    if (!fichier || !fichier.clientName) {
      session.flash('erreur', 'Choisissez un fichier CSV.')
      return response.redirect().back()
    }
    if (!fichier.isValid || !fichier.tmpPath) {
      session.flash('erreur', 'Fichier refusé : format CSV, 2 Mo maximum.')
      return response.redirect().back()
    }

    const ville = await db.from('villes').where('nom', user.ville ?? '').first()
    if (!ville) {
      session.flash('erreur', "Votre ville n'est pas reconnue : import impossible.")
      return response.redirect().back()
    }

    const tampon = await readFile(fichier.tmpPath)
    let contenu = tampon.toString('utf8')
    if (contenu.includes('\uFFFD')) contenu = tampon.toString('latin1')

    const lignes = lireCsv(contenu)
    if (lignes.length < 2) {
      session.flash('erreur', 'Le fichier est vide : ajoutez au moins une ligne sous les titres.')
      return response.redirect().back()
    }

    const entetes = lignes[0].map((h) => normaliser(h).trim())
    const col = (n: string) => entetes.indexOf(n)
    const iNom = col('nom')
    if (iNom < 0) {
      session.flash('erreur', 'Colonne « nom » introuvable. Téléchargez le modèle pour voir le format attendu.')
      return response.redirect().back()
    }
    const iCat = col('categorie')
    const iTarif = col('tarif')
    const iDevise = col('devise')
    const iDelai = col('delai')
    const iPieces = col('pieces')
    const iDesc = col('description')

    const categories = await db.from('categories_services').where('active', true)
    const parNom = new Map(categories.map((c: any) => [normaliser(c.nom).trim(), c.id]))
    const parDefaut = categories.find((c: any) => c.slug === 'autres-services')?.id ?? categories[0]?.id
    if (!parDefaut) {
      session.flash('erreur', 'Aucune catégorie disponible.')
      return response.redirect().back()
    }

    const telephone = user.telephone ? `${user.indicatifPays ?? ''} ${user.telephone}`.trim().slice(0, 30) : null
    const adresse = [user.avenue, user.commune].filter(Boolean).join(', ').slice(0, 255) || null
    const base = Date.now()
    const lot: any[] = []
    let ignorees = 0

    lignes.slice(1, MAX_IMPORT + 1).forEach((l, i) => {
      const nom = String(l[iNom] ?? '').trim()
      const tarif = iTarif >= 0 ? lireTarif(l[iTarif]) : null
      if (nom.length < 3 || tarif === undefined) {
        ignorees++
        return
      }
      const devise = iDevise >= 0 ? String(l[iDevise] ?? '').trim().toUpperCase() : ''
      const cat = iCat >= 0 ? parNom.get(normaliser(String(l[iCat] ?? '')).trim()) : undefined

      lot.push({
        prestataire_id: user.id,
        categorie_id: cat ?? parDefaut,
        ville_id: ville.id,
        nom: nom.slice(0, 255),
        slug: fairSlug(nom, `${base}-${i}`),
        description: iDesc >= 0 ? texte(l[iDesc]) : null,
        prix_min: tarif,
        devise: ['USD', 'CDF', 'EUR'].includes(devise) ? devise : 'CDF',
        delai: iDelai >= 0 ? (texte(l[iDelai])?.slice(0, 150) ?? null) : null,
        pieces_requises: iPieces >= 0 ? texte(l[iPieces]) : null,
        telephone,
        email: user.email,
        commune: user.commune,
        adresse,
      })
    })

    for (let i = 0; i < lot.length; i += 100) {
      await db.table('services').insert(lot.slice(i, i + 100))
    }

    let message = `${lot.length} prestation(s) importée(s).`
    if (ignorees) message += ` ${ignorees} ligne(s) ignorée(s) (nom trop court ou tarif invalide).`
    if (lignes.length - 1 > MAX_IMPORT) message += ` Seules les ${MAX_IMPORT} premières lignes ont été lues.`
    session.flash('succes', message)
    return response.redirect().back()
  }

  async modele({ response }: HttpContext) {
    const csv =
      '\uFEFFnom;categorie;tarif;devise;delai;pieces;description\r\n' +
      'Acte de naissance;Autres services;5000;CDF;48 heures;Déclaration de naissance, pièce du déclarant;Délivrance de la copie intégrale\r\n' +
      'Légalisation de documents;Autres services;2000;CDF;24 heures;Original et photocopie;Légalisation des copies\r\n' +
      "Information du public;Autres services;0;CDF;Immédiat;;Renseignements gratuits\r\n"
    response.header('Content-Type', 'text/csv; charset=utf-8')
    response.header('Content-Disposition', 'attachment; filename="modele-prestations.csv"')
    return response.send(csv)
  }

  async supprimer({ params, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!UUID.test(params.id)) return response.notFound('Introuvable')
    await db.from('services').where('id', params.id).where('prestataire_id', user.id).delete()
    return response.redirect().back()
  }
}