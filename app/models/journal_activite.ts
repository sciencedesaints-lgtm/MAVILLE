import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  belongsTo,
} from '@adonisjs/lucid/orm'

import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import Utilisateur from '#models/utilisateur'

export default class JournalActivite extends BaseModel {
  public static table = 'journal_activites'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare utilisateurId: string | null

  @column()
  declare action: string

  @column()
  declare tableCible: string | null

  @column()
  declare elementId: string | null

  @column()
  declare adresseIp: string | null

  @column()
  declare navigateur: string | null

  @column()
  declare systeme: string | null

  @column()
  declare appareil: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
  })
  declare updatedAt: DateTime

  @belongsTo(() => Utilisateur, {
    foreignKey: 'utilisateurId',
  })
  declare utilisateur: BelongsTo<typeof Utilisateur>
}