import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  belongsTo,
  hasMany,
} from '@adonisjs/lucid/orm'

import type {
  BelongsTo,
  HasMany,
} from '@adonisjs/lucid/types/relations'

import Utilisateur from '#models/utilisateur'
import Ville from '#models/ville'
import Pays from '#models/pays'
import HistoriqueRecherche from '#models/historique_recherche'

export default class Recherche extends BaseModel {
  public static table = 'recherches'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare utilisateurId: string | null

  @column()
  declare typeRecherche: string

  @column()
  declare texte: string | null

  @column()
  declare audioUrl: string | null

  @column()
  declare imageUrl: string | null

  @column()
  declare scopeRecherche: string

  @column()
  declare villeId: string | null

  @column()
  declare paysId: string | null

  @column()
  declare latitude: number | null

  @column()
  declare longitude: number | null

  @column()
  declare position: any

  @column()
  declare rayonKm: number | null

  @column()
  declare nombreResultats: number

  @column()
  declare tempsExecutionMs: number | null

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

  @belongsTo(() => Ville, {
    foreignKey: 'villeId',
  })
  declare ville: BelongsTo<typeof Ville>

  @belongsTo(() => Pays, {
    foreignKey: 'paysId',
  })
  declare pays: BelongsTo<typeof Pays>

  @hasMany(() => HistoriqueRecherche, {
    foreignKey: 'rechercheId',
  })
  declare historiques: HasMany<typeof HistoriqueRecherche>
}