import { DateTime } from 'luxon'

import {
  BaseModel,
  column,
  belongsTo,
} from '@adonisjs/lucid/orm'

import type {
  BelongsTo,
} from '@adonisjs/lucid/types/relations'

import DemandeService from '#models/demande_service'
import Service from '#models/service'

export default class ReponseDemandeService extends BaseModel {
  public static table = 'reponses_demandes_services'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare demandeId: string

  @column()
  declare serviceId: string

  @column()
  declare disponible: boolean

  @column()
  declare tempsEstimeMinutes: number | null

  @column()
  declare distanceKm: number | null

  @column()
  declare prixEstime: number | null

  @column()
  declare devise: string

  @column()
  declare selectionne: boolean

  @belongsTo(() => DemandeService, {
    foreignKey: 'demandeId',
  })
  declare demande: BelongsTo<typeof DemandeService>

  @belongsTo(() => Service, {
    foreignKey: 'serviceId',
  })
  declare service: BelongsTo<typeof Service>

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