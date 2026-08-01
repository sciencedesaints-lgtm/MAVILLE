import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  belongsTo,
} from '@adonisjs/lucid/orm'

import type {
  BelongsTo,
} from '@adonisjs/lucid/types/relations'

import Commande from '#models/commande'
import Produit from '#models/produit'

export default class CommandeArticle extends BaseModel {
  public static table = 'commande_articles'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare commandeId: string

  @column()
  declare produitId: string

  @column()
  declare quantite: number

  @column()
  declare prixUnitaire: number

  @column()
  declare montant: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
  })
  declare updatedAt: DateTime

  @belongsTo(() => Commande, {
    foreignKey: 'commandeId',
  })
  declare commande: BelongsTo<typeof Commande>

  @belongsTo(() => Produit, {
    foreignKey: 'produitId',
  })
  declare produit: BelongsTo<typeof Produit>
}