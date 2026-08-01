import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class ProduitAgricole extends BaseModel {
  public static table = 'produits_agricoles'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare producteurId: string

  @column()
  declare categorieId: number | null

  @column()
  declare villeId: string

  @column()
  declare nom: string

  @column()
  declare description: string | null

  @column()
  declare prix: number

  @column()
  declare devise: string

  @column()
  declare quantite: number

  @column()
  declare unite: string

  @column()
  declare disponible: boolean

  @column()
  declare telephone: string | null

  @column()
  declare latitude: number | null

  @column()
  declare longitude: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}