import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import Commande from '#models/commande'

export default class Paiement extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare commandeId: string

  @column()
  declare montant: number

  @column()
  declare devise: string

  @column()
  declare mode: string | null

  @column()
  declare referenceTransaction: string | null

  @column()
  declare statut: string

  @belongsTo(() => Commande, {
    foreignKey: 'commandeId',
  })
  declare commande: BelongsTo<typeof Commande>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}