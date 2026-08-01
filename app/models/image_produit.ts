import { DateTime } from 'luxon'

import {
  BaseModel,
  column,
  belongsTo,
} from '@adonisjs/lucid/orm'

import type {
  BelongsTo,
} from '@adonisjs/lucid/types/relations'

import Produit from '#models/produit'

export default class ImageProduit extends BaseModel {
  public static table = 'images_produits'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare produitId: string

  @column()
  declare url: string

  @column()
  declare miniature: string | null

  @column()
  declare principale: boolean

  @column()
  declare ordre: number

  @column()
  declare texteAlternatif: string | null

  @belongsTo(() => Produit, {
    foreignKey: 'produitId',
  })
  declare produit: BelongsTo<typeof Produit>

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