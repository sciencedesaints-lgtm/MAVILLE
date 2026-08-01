import { DateTime } from 'luxon'
import {
  BaseModel,
  belongsTo,
  column,
} from '@adonisjs/lucid/orm'

import type {
  BelongsTo,
} from '@adonisjs/lucid/types/relations'

import Emploi from '#models/emploi'
import Utilisateur from '#models/utilisateur'

export default class CandidatureEmploi extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare emploiId: string

  @column()
  declare utilisateurId: string

  @column()
  declare cvUrl: string | null

  @column()
  declare lettreMotivationUrl: string | null

  @column()
  declare statut: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /*
  |--------------------------------------------------------------------------
  | Relations
  |--------------------------------------------------------------------------
  */

  @belongsTo(() => Emploi, {
    foreignKey: 'emploiId',
  })
  declare emploi: BelongsTo<typeof Emploi>

  @belongsTo(() => Utilisateur, {
    foreignKey: 'utilisateurId',
  })
  declare utilisateur: BelongsTo<typeof Utilisateur>
}