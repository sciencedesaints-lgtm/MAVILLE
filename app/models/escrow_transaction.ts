import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import Paiement from '#models/paiement'

export default class EscrowTransaction extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare paiementId: string

  @column()
  declare montant: number

  @column()
  declare statut: string

  @column.dateTime()
  declare dateLiberation: DateTime | null

  @belongsTo(() => Paiement, {
    foreignKey: 'paiementId',
  })
  declare paiement: BelongsTo<typeof Paiement>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}