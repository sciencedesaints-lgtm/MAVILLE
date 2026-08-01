import { DateTime } from 'luxon'

import {
  BaseModel,
  column,
  hasMany,
} from '@adonisjs/lucid/orm'

import type {
  HasMany,
} from '@adonisjs/lucid/types/relations'

import Produit from '#models/produit'

import PrixProduitEssentiel from '#models/prix_produit_essentiel'

export default class CategorieProduit extends BaseModel {
  public static table = 'categories_produits'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nom: string

  @column()
  declare description: string | null

  @column()
  declare icone: string | null

  @column()
  declare active: boolean

  @column()
  declare slug: string

  @column()
  declare ordreAffichage: number

  @column()
  declare couleur: string | null

  @column()
  declare estPopulaire: boolean

  @hasMany(() => Produit, {
    foreignKey: 'categorieId',
  })
  declare produits: HasMany<typeof Produit>

  @hasMany(() => PrixProduitEssentiel, {
    foreignKey: 'categorieId',
  })
  declare prixProduitsEssentiels: HasMany<typeof PrixProduitEssentiel>

  @column.dateTime({
    autoCreate: true,
  })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
  })
  declare updatedAt: DateTime
}