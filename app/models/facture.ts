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

export default class Facture extends BaseModel {
  public static table = 'factures'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare commandeId: string

  @column()
  declare numero: string

  @column()
  declare montant: number

  @column()
  declare devise: string | null

  @column()
 declare pdfUrl: string | null

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
}