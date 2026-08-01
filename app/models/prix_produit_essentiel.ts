import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  belongsTo,
} from '@adonisjs/lucid/orm'

import type {
  BelongsTo,
} from '@adonisjs/lucid/types/relations'

import Ville from '#models/ville'
import CategorieProduit from '#models/categorie_produit'

export default class PrixProduitEssentiel extends BaseModel {
  public static table = 'prix_produits_essentiels'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare villeId: string

  @column()
  declare categorieId: number | null

  @column()
  declare produit: string

  @column()
  declare prixMin: number | null

  @column()
  declare prixMoyen: number | null

  @column()
  declare prixMax: number | null

  @column()
  declare devise: string

  @column()
  declare unite: string | null

  @column.date()
  declare dateReleve: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
  })
  declare updatedAt: DateTime

  @belongsTo(() => Ville, {
    foreignKey: 'villeId',
  })
  declare ville: BelongsTo<typeof Ville>

  @belongsTo(() => CategorieProduit, {
    foreignKey: 'categorieId',
  })
  declare categorie: BelongsTo<typeof CategorieProduit>
}