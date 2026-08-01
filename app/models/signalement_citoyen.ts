import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class SignalementCitoyen extends BaseModel {
  public static table = 'signalements_citoyens'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare utilisateurId: string

  @column()
  declare categorieId: number | null

  @column()
  declare titre: string

  @column()
  declare description: string

  @column()
  declare photoUrl: string | null

  @column()
  declare videoUrl: string | null

  @column()
  declare audioUrl: string | null

  @column()
  declare latitude: number | null

  @column()
  declare longitude: number | null

  @column()
  declare statut: string

  @column()
  declare priorite: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}