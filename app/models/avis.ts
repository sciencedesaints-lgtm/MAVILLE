import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  belongsTo,
} from '@adonisjs/lucid/orm'

import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import Utilisateur from '#models/utilisateur'

export default class Avis extends BaseModel {
  public static table = 'avis'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare utilisateurId: string

  @column()
  declare typeElement: string

  @column()
  declare elementId: string

  @column()
  declare note: number

  @column()
  declare commentaire: string | null

  @column()
  declare visible: boolean

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