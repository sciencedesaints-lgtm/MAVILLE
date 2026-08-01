import { DateTime } from 'luxon'
import {
  BaseModel,
  belongsTo,
  column,
} from '@adonisjs/lucid/orm'

import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import Utilisateur from '#models/utilisateur'

export default class Notification extends BaseModel {
  public static table = 'notifications'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare utilisateurId: string

  @column()
  declare type: string

  @column()
  declare titre: string

  @column()
  declare message: string

  @column()
  declare lien: string | null

  @column()
  declare lu: boolean

  @column.dateTime()
  declare dateLecture: DateTime | null

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