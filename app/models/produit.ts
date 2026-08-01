import { DateTime } from 'luxon'

import {
  BaseModel,
  column,
  belongsTo,
  hasMany,
} from '@adonisjs/lucid/orm'

import type {
  BelongsTo,
  HasMany,
} from '@adonisjs/lucid/types/relations'

import Etablissement from '#models/etablissement'
import CategorieProduit from '#models/categorie_produit'
import ImageProduit from '#models/image_produit'

export default class Produit extends BaseModel {
  public static table = 'produits'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare etablissementId: string

  @column()
  declare categorieId: number

  @column()
  declare nom: string

  @column()
  declare slug: string

  @column()
  declare description: string | null

  @column()
  declare reference: string | null

  @column()
  declare codeBarres: string | null

  @column()
  declare prix: number

  @column()
  declare devise: string

  @column()
  declare ancienPrix: number | null

  @column()
  declare stock: number

  @column()
  declare unite: string | null

  @column()
  declare poids: number | null

  @column()
  declare disponible: boolean

  @column()
  declare visible: boolean

  @column()
  declare promotion: boolean

  @column()
  declare noteMoyenne: number

  @column()
  declare nombreAvis: number

  @column()
  declare nombreVues: number

  @column()
  declare ordreAffichage: number

  @belongsTo(() => Etablissement, {
    foreignKey: 'etablissementId',
  })
  declare etablissement: BelongsTo<typeof Etablissement>

  @belongsTo(() => CategorieProduit, {
    foreignKey: 'categorieId',
  })
  declare categorie: BelongsTo<typeof CategorieProduit>

  @hasMany(() => ImageProduit, {
    foreignKey: 'produitId',
  })
  declare images: HasMany<typeof ImageProduit>

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