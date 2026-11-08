import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Utilisateur from '#models/utilisateur'
import Ville from '#models/ville'

export default class Annonce extends BaseModel {
  public static table = 'annonces'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare vendeurId: string

  @column()
  declare categorieId: number

  @column()
  declare villeId: string

  @column()
  declare titre: string

  @column()
  declare slug: string

  @column()
  declare description: string | null

  @column()
  declare typeOffre: 'vente' | 'location'

  @column()
  declare etat: string | null

  @column()
  declare prix: number | null

  @column()
  declare devise: string

  @column()
  declare prixNegociable: boolean

  @column()
  declare periodicite: string | null

  @column()
  declare telephone: string | null

  @column()
  declare whatsapp: string | null

  @column()
  declare quartier: string | null

  @column()
  declare commune: string | null

  @column()
  declare avenue: string | null

  @column()
  declare repere: string | null

  @column()
  declare disponible: boolean

  @column()
  declare visible: boolean

  @column()
  declare nombreVues: number

  @belongsTo(() => Utilisateur, { foreignKey: 'vendeurId' })
  declare vendeur: BelongsTo<typeof Utilisateur>

  @belongsTo(() => Ville, { foreignKey: 'villeId' })
  declare ville: BelongsTo<typeof Ville>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}