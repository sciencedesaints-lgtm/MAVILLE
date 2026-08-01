import { DateTime } from 'luxon'
import {
  BaseModel,
  belongsTo,
  column,
  hasMany,
} from '@adonisjs/lucid/orm'

import type {
  BelongsTo,
  HasMany,
} from '@adonisjs/lucid/types/relations'

import Etablissement from '#models/etablissement'
import CandidatureEmploi from '#models/candidature_emploi'

export default class Emploi extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare etablissementId: string

  @column()
  declare titre: string

  @column()
  declare description: string

  @column()
  declare typeContrat: string | null

  @column()
  declare salaireMin: number | null

  @column()
  declare salaireMax: number | null

  @column()
  declare devise: string

  @column.date()
  declare dateLimite: DateTime | null

  @column()
  declare active: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /*
  |--------------------------------------------------------------------------
  | Relations
  |--------------------------------------------------------------------------
  */

  @belongsTo(() => Etablissement, {
    foreignKey: 'etablissementId',
  })
  declare etablissement: BelongsTo<typeof Etablissement>

  @hasMany(() => CandidatureEmploi, {
    foreignKey: 'emploiId',
  })
  declare candidatures: HasMany<typeof CandidatureEmploi>
}