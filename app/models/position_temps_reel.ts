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
import DemandeService from '#models/demande_service'

export default class PositionTempsReel extends BaseModel {
  public static table = 'positions_temps_reel'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare utilisateurId: string

  @column()
  declare demandeId: string | null

  @column()
  declare latitude: number

  @column()
  declare longitude: number

  @column()
  declare vitesse: number | null

  @column()
  declare precision: number | null

  @column()
  declare cap: number | null

  @column.dateTime()
  declare datePosition: DateTime

  @belongsTo(() => Utilisateur, {
    foreignKey: 'utilisateurId',
  })
  declare utilisateur: BelongsTo<typeof Utilisateur>

  @belongsTo(() => DemandeService, {
    foreignKey: 'demandeId',
  })
  declare demande: BelongsTo<typeof DemandeService>

  @column.dateTime({
    autoCreate: true,
  })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
  })
  declare updatedAt: DateTime
}