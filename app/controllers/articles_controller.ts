import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import app from '@adonisjs/core/services/app'
import { unlink } from 'node:fs/promises'
import { MediaService } from '#services/media_service'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const IMAGES = ['jpg', 'jpeg', 'png', 'webp']
const MAX_PHOTOS = 3

const texte = (v: unknown) => String(v ?? '').trim() || null

export default class ArticlesController {
  // Vérifie que le commerce appartient à l'utilisateur connecté
  private async commerceDe(id: string, userId: string | number) {
    if (!UUID.test(id)) return null
    return db.from('etablissements').where('id', id).where('proprietaire_id', userId).first()
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

    // Prix : "2 500", "12,50" ou vide (= prix à discuter)
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

    const slug =
      nom
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now()

    const [ligne] = await db
      .table('produits')
      .insert({
        etablissement_id: commerce.id,
        categorie_id: categorieId,
        nom: nom.slice(0, 255),
        slug,
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

    return response.redirect().back()
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
          prix: Number(l.prix) > 0
            ? `${Number(l.prix)} ${l.devise}${l.unite ? ' / ' + l.unite : ''}`
            : 'Prix à discuter',
          photos: images.filter((i: any) => i.produit_id === l.id).map((i: any) => i.url),
        }))
    
        return view.render('pages/catalogue', { commerce, articles })
      }

  async supprimer({ params, response, auth, session }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!UUID.test(params.id)) return response.notFound('Introuvable')

    // Seul le propriétaire du commerce peut supprimer
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