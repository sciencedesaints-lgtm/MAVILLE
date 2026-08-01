import { DateTime } from 'luxon'
import {
  BaseModel,
  belongsTo,
  column,
} from '@adonisjs/lucid/orm'

import type {
  BelongsTo,
} from '@adonisjs/lucid/types/relations'

import Utilisateur from '#models/utilisateur'

export default class Evenement extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare organisateurId: string | null

  @column()
  declare titre: string

  @column()
  declare description: string | null

  @column.dateTime()
  declare dateDebut: DateTime | null

  @column.dateTime()
  declare dateFin: DateTime | null

  @column()
  declare lieu: string | null

  @column()
  declare position: any

  @column()
  declare public: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
  })
  declare updatedAt: DateTime

  /*
  |--------------------------------------------------------------------------
  | Relations
  |--------------------------------------------------------------------------
  */

  @belongsTo(() => Utilisateur, {
    foreignKey: 'organisateurId',
  })
  declare organisateur: BelongsTo<typeof Utilisateur>
}