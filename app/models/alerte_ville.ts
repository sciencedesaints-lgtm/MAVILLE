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
import Utilisateur from '#models/utilisateur'

export default class AlerteVille extends BaseModel {
  public static table = 'alertes_ville'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare villeId: string

  @column()
  declare createurId: string | null

  @column()
  declare titre: string

  @column()
  declare description: string

  @column()
  declare type: string

  @column()
  declare niveau: string

  @column.dateTime()
  declare dateDebut: DateTime | null

  @column.dateTime()
  declare dateFin: DateTime | null

  @column()
  declare active: boolean

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

  @belongsTo(() => Utilisateur, {
    foreignKey: 'createurId',
  })
  declare createur: BelongsTo<typeof Utilisateur>
}