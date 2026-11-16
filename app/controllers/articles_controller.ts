import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import app from '@adonisjs/core/services/app'
import { readFile, unlink } from 'node:fs/promises'
import { MediaService } from '#services/media_service'
import { assurerCommerce } from '#services/commerce_auto'
import { normaliser } from '#services/analyse_recherche'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const IMAGES = ['jpg', 'jpeg', 'png', 'webp']
const MAX_PHOTOS = 3
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

// Lecture d'un CSV : séparateur ; ou , détecté, guillemets gérés
function lireCsv(contenu: string): string[][] {
  const t = contenu.replace(/^\uFEFF/, '')
  const premiere = t.split(/\r?\n/)[0] ?? ''
  const sep = (premiere.match(/;/g) ?? []).length >= (premiere.match(/,/g) ?? []).length ? ';' : ','
  const lignes: string[][] = []
  let ligne: string[] = []
  let champ = ''
  let guillemets = false

  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (guillemets) {
      if (c === '"') {
        if (t[i + 1] === '"') {
          champ += '"'
          i++
        } else {
          guillemets = false
        }
      } else {
        champ += c
      }
    } else if (c === '"') {
      guillemets = true
    } else if (c === sep) {
      ligne.push(champ)
      champ = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++
      ligne.push(champ)
      champ = ''
      if (ligne.some((x) => x.trim() !== '')) lignes.push(ligne)
      ligne = []
    } else {
      champ += c
    }
  }
  ligne.push(champ)
  if (ligne.some((x) => x.trim() !== '')) lignes.push(ligne)
  return lignes
}

export default class ArticlesController {
  // Vérifie que le commerce appartient à l'utilisateur connecté
  private async commerceDe(id: string, userId: string | number) {
    if (!UUID.test(id)) return null
    return db.from('etablissements').where('id', id).where('proprietaire_id', userId).first()
  }

  // Raccourci « Mon catalogue » : crée le commerce de l'entreprise si besoin
  async monCatalogue({ response, auth, session }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.typeCompte !== 'entreprise_agence') {
      return response.redirect().toRoute('publications.index')
    }
    const commerce = await assurerCommerce(String(user.id))
    if (!commerce) {
      session.flash('erreur', "Votre ville n'est pas reconnue : impossible de créer votre catalogue.")
      return response.redirect().toRoute('commerces.create')
    }
    return response.redirect(`/commerces/${commerce.id}/articles`)
  }

  async index({ params, view, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const commerce = await this.commerceDe(params.id, user.id)
    if (!commerce) return response.notFound('Commerce introuvable')

    const categories = await db
      .from('categories_produits')
      .where('active', true)
      .orderBy('ordre_affichage')

    const lignes = await db
      .from('produits as p')
      .leftJoin('categories_produits as c', 'c.id', 'p.categorie_id')
      .where('p.etablissement_id', commerce.id)
      .select('p.*', 'c.nom as categorie_nom')
      .orderBy('p.created_at', 'desc')

    const ids = lignes.map((l: any) => l.id)
    const images = ids.length
      ? await db.from('images_produits').whereIn('produit_id', ids).orderBy('ordre')
      : []

    const articles = lignes.map((l: any) => ({
      id: l.id,
      nom: l.nom,
      description: l.description,
      categorie: l.categorie_nom,
      prix: Number(l.prix) > 0 ? `${Number(l.prix)} ${l.devise}` : 'Prix à discuter',
      photos: images.filter((i: any) => i.produit_id === l.id).map((i: any) => i.url),
    }))

    return view.render('pages/articles', { commerce, categories, articles })
  }

  async store({ params, request, response, auth, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const commerce = await this.commerceDe(params.id, user.id)
    if (!commerce) return response.notFound('Commerce introuvable')

    const nom = texte(request.input('nom'))
    const categorieId = Number(request.input('categorie_id'))
    if (!nom || nom.length < 2 || !categorieId) {
      session.flash('erreur', "Indiquez le nom de l'article et sa catégorie.")
      return response.redirect().back()
    }

    const brut = String(request.input('prix') ?? '').replace(/\s/g, '').replace(',', '.')
    const prix = brut === '' ? 0 : Number(brut)
    if (Number.isNaN(prix) || prix < 0) {
      session.flash('erreur', 'Le prix doit être un nombre positif.')
      return response.redirect().back()
    }

    const fichiers = request.files('photos', { size: '5mb', extnames: IMAGES })
    if (fichiers.some((f) => f.clientName && !f.isValid)) {
      session.flash('erreur', 'Une photo est refusée : jpg, png ou webp, 5 Mo maximum.')
      return response.redirect().back()
    }

    const [ligne] = await db
      .table('produits')
      .insert({
        etablissement_id: commerce.id,
        categorie_id: categorieId,
        nom: nom.slice(0, 255),
        slug: fairSlug(nom, String(Date.now())),
        description: texte(request.input('description')),
        prix,
        devise: ['USD', 'CDF', 'EUR'].includes(String(request.input('devise')))
          ? String(request.input('devise'))
          : 'USD',
        unite: texte(request.input('unite'))?.slice(0, 50) ?? null,
        disponible: true,
        visible: true,
      })
      .returning('id')
    const produitId = typeof ligne === 'object' ? ligne.id : ligne

    let ordre = 0
    for (const f of fichiers.filter((x) => x.clientName).slice(0, MAX_PHOTOS)) {
      const url = await MediaService.uploadImage(f, 'produits')
      await db.table('images_produits').insert({
        produit_id: produitId,
        url,
        principale: ordre === 0,
        ordre: ordre++,
      })
    }

    session.flash('succes', `« ${nom} » a été ajouté.`)
    return response.redirect().back()
  }

  // Import d'un fichier CSV : nom;categorie;prix;devise;unite;description
  async importer({ params, request, response, auth, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const commerce = await this.commerceDe(params.id, user.id)
    if (!commerce) return response.notFound('Commerce introuvable')

    const fichier = request.file('fichier', { size: '2mb', extnames: ['csv', 'txt'] })
    if (!fichier || !fichier.clientName) {
      session.flash('erreur', 'Choisissez un fichier CSV.')
      return response.redirect().back()
    }
    if (!fichier.isValid || !fichier.tmpPath) {
      session.flash('erreur', 'Fichier refusé : format CSV, 2 Mo maximum.')
      return response.redirect().back()
    }

    // UTF-8, ou Windows-1252 si Excel a enregistré en "CSV" classique
    const tampon = await readFile(fichier.tmpPath)
    let contenu = tampon.toString('utf8')
    if (contenu.includes('\uFFFD')) contenu = tampon.toString('latin1')

    const lignes = lireCsv(contenu)
    if (lignes.length < 2) {
      session.flash('erreur', 'Le fichier est vide : ajoutez au moins une ligne sous les titres.')
      return response.redirect().back()
    }

    const entetes = lignes[0].map((h) => normaliser(h).trim())
    const col = (nom: string) => entetes.indexOf(nom)
    const iNom = col('nom')
    if (iNom < 0) {
      session.flash('erreur', 'Colonne « nom » introuvable. Téléchargez le modèle pour voir le format attendu.')
      return response.redirect().back()
    }
    const iCat = col('categorie')
    const iPrix = col('prix')
    const iDevise = col('devise')
    const iUnite = col('unite')
    const iDesc = col('description')

    const categories = await db.from('categories_produits').where('active', true)
    const parNom = new Map(categories.map((c: any) => [normaliser(c.nom).trim(), c.id]))
    const parDefaut =
      categories.find((c: any) => c.slug === 'autres-annonces')?.id ?? categories[0]?.id
    if (!parDefaut) {
      session.flash('erreur', 'Aucune catégorie disponible.')
      return response.redirect().back()
    }

    const donnees = lignes.slice(1, MAX_IMPORT + 1)
    const lot: any[] = []
    let ignorees = 0
    const base = Date.now()

    donnees.forEach((l, i) => {
      const nom = String(l[iNom] ?? '').trim()
      if (nom.length < 2) {
        ignorees++
        return
      }
      const brut = iPrix >= 0 ? String(l[iPrix] ?? '').replace(/\s/g, '').replace(',', '.') : ''
      const prix = brut === '' ? 0 : Number(brut)
      if (Number.isNaN(prix) || prix < 0) {
        ignorees++
        return
      }
      const devise = iDevise >= 0 ? String(l[iDevise] ?? '').trim().toUpperCase() : ''
      const cat = iCat >= 0 ? parNom.get(normaliser(String(l[iCat] ?? '')).trim()) : undefined

      lot.push({
        etablissement_id: commerce.id,
        categorie_id: cat ?? parDefaut,
        nom: nom.slice(0, 255),
        slug: fairSlug(nom, `${base}-${i}`),
        description: iDesc >= 0 ? texte(l[iDesc]) : null,
        prix,
        devise: ['USD', 'CDF', 'EUR'].includes(devise) ? devise : 'USD',
        unite: iUnite >= 0 ? (texte(l[iUnite])?.slice(0, 50) ?? null) : null,
        disponible: true,
        visible: true,
      })
    })

    for (let i = 0; i < lot.length; i += 100) {
      await db.table('produits').insert(lot.slice(i, i + 100))
    }

    let message = `${lot.length} article(s) importé(s).`
    if (ignorees) message += ` ${ignorees} ligne(s) ignorée(s) (nom trop court ou prix invalide).`
    if (lignes.length - 1 > MAX_IMPORT) message += ` Seules les ${MAX_IMPORT} premières lignes ont été lues.`
    session.flash('succes', message)
    return response.redirect().back()
  }

  // Modèle de fichier à télécharger
  async modele({ response }: HttpContext) {
    const csv =
      '\uFEFFnom;categorie;prix;devise;unite;description\r\n' +
      'Sucre 1 kg;Autres;2500;CDF;kg;Sucre blanc en sachet\r\n' +
      'Chemise homme;Vêtements et chaussures;15;USD;pièce;Taille M à XL\r\n' +
      'Réparation sur devis;Autres;;USD;;Prix à discuter\r\n'
    response.header('Content-Type', 'text/csv; charset=utf-8')
    response.header('Content-Disposition', 'attachment; filename="modele-catalogue.csv"')
    return response.send(csv)
  }

  // Catalogue public d'un commerce (visible par tout utilisateur connecté)
  async catalogue({ params, view, response }: HttpContext) {
    if (!UUID.test(params.id)) return response.notFound('Commerce introuvable')

    const commerce = await db
      .from('etablissements')
      .where('id', params.id)
      .where('visible', true)
      .first()
    if (!commerce) return response.notFound('Commerce introuvable')

    const lignes = await db
      .from('produits as p')
      .leftJoin('categories_produits as c', 'c.id', 'p.categorie_id')
      .where('p.etablissement_id', commerce.id)
      .where('p.visible', true)
      .where('p.disponible', true)
      .select('p.*', 'c.nom as categorie_nom')
      .orderBy('p.created_at', 'desc')

    const ids = lignes.map((l: any) => l.id)
    const images = ids.length
      ? await db.from('images_produits').whereIn('produit_id', ids).orderBy('ordre')
      : []

    const articles = lignes.map((l: any) => ({
      nom: l.nom,
      description: l.description,
      categorie: l.categorie_nom,
      prix:
        Number(l.prix) > 0
          ? `${Number(l.prix)} ${l.devise}${l.unite ? ' / ' + l.unite : ''}`
          : 'Prix à discuter',
      photos: images.filter((i: any) => i.produit_id === l.id).map((i: any) => i.url),
    }))

    return view.render('pages/catalogue', { commerce, articles })
  }

  async supprimer({ params, response, auth, session }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!UUID.test(params.id)) return response.notFound('Introuvable')

    const article = await db
      .from('produits as p')
      .join('etablissements as e', 'e.id', 'p.etablissement_id')
      .where('p.id', params.id)
      .where('e.proprietaire_id', user.id)
      .select('p.id')
      .first()
    if (!article) return response.notFound('Introuvable')

    const images = await db.from('images_produits').where('produit_id', article.id)

    try {
      await db.from('produits').where('id', article.id).delete()
    } catch {
      session.flash('erreur', 'Cet article est lié à une commande : il ne peut pas être supprimé.')
      return response.redirect().back()
    }

    for (const i of images) {
      try {
        await unlink(app.makePath('public' + i.url))
      } catch {
        // fichier déjà absent
      }
    }
    return response.redirect().back()
  }
}