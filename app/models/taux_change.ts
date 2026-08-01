import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class TauxChange extends BaseModel {
  public static table = 'taux_change'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare deviseSource: string

  @column()
  declare deviseCible: string

  @column()
  declare taux: number

  @column.dateTime()
  declare dateMiseAJour: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}