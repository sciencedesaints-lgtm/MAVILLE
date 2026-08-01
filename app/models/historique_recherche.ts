import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  belongsTo,
} from '@adonisjs/lucid/orm'

import type {
  BelongsTo,
} from '@adonisjs/lucid/types/relations'

import Utilisateur from '#models/utilisateur'
import Recherche from '#models/recherche'

export default class HistoriqueRecherche extends BaseModel {
  public static table = 'historique_recherche'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare utilisateurId: string

  @column()
  declare rechercheId: string

  @column.dateTime()
  declare dateRecherche: DateTime

  @column()
  declare nombreResultats: number

  @column()
  declare aDonneSuite: boolean

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
    foreignKey: 'utilisateurId',
  })
  declare utilisateur: BelongsTo<typeof Utilisateur>

  @belongsTo(() => Recherche, {
    foreignKey: 'rechercheId',
  })
  declare recherche: BelongsTo<typeof Recherche>
}