import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  belongsTo,
} from '@adonisjs/lucid/orm'

import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import Utilisateur from './utilisateur.js'

export default class AbonnementPremium extends BaseModel {
  public static table = 'abonnements_premium'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare utilisateurId: string

  @column()
  declare type: string

  @column()
  declare montant: number

  @column()
  declare devise: string

  @column.date()
  declare dateDebut: DateTime

  @column.date()
  declare dateFin: DateTime

  @column()
  declare renouvellementAuto: boolean

  @column()
  declare statut: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Utilisateur, {
    foreignKey: 'utilisateurId',
  })
  declare utilisateur: BelongsTo<typeof Utilisateur>
}