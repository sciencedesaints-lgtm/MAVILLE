import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Statistique extends BaseModel {
  public static table = 'statistiques'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare categorie: string

  @column()
  declare nom: string

  @column()
  declare valeur: number

  @column()
  declare periode: string | null

  @column.dateTime()
  declare dateStatistique: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
  })
  declare updatedAt: DateTime
}