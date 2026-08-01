import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  belongsTo,
} from '@adonisjs/lucid/orm'

import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import Etablissement from './etablissement.js'

export default class AbonnementVisibilite extends BaseModel {
  public static table = 'abonnements_visibilite'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare etablissementId: string

  @column()
  declare niveau: string

  @column()
  declare priorite: number

  @column()
  declare montant: number

  @column()
  declare devise: string

  @column.date()
  declare dateDebut: DateTime

  @column.date()
  declare dateFin: DateTime

  @column()
  declare active: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Etablissement, {
    foreignKey: 'etablissementId',
  })
  declare etablissement: BelongsTo<typeof Etablissement>
}