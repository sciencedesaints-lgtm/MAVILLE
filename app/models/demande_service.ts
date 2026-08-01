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
import CategorieService from '#models/categorie_service'
import ReponseDemandeService from '#models/reponse_demande_service'
import PositionTempsReel from '#models/position_temps_reel'

export default class DemandeService extends BaseModel {
  public static table = 'demandes_services'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare utilisateurId: string

  @column()
  declare categorieServiceId: number

  @column()
  declare description: string | null

  @column()
  declare typeRecherche: string

  @column()
  declare audioUrl: string | null

  @column()
  declare imageUrl: string | null

  @column()
  declare tempsMaxMinutes: number

  @column()
  declare urgence: boolean

  @column()
  declare statut: string

  @column()
  declare latitude: number | null

  @column()
  declare longitude: number | null

  @belongsTo(() => Utilisateur, {
    foreignKey: 'utilisateurId',
  })
  declare utilisateur: BelongsTo<typeof Utilisateur>

  @belongsTo(() => CategorieService, {
    foreignKey: 'categorieServiceId',
  })
  declare categorie: BelongsTo<typeof CategorieService>

  @hasMany(() => ReponseDemandeService, {
    foreignKey: 'demandeId',
  })
  declare reponses: HasMany<typeof ReponseDemandeService>

  @hasMany(() => PositionTempsReel, {
    foreignKey: 'demandeId',
  })
  declare positions: HasMany<typeof PositionTempsReel>

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