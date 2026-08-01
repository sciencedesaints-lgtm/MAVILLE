import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  belongsTo,
} from '@adonisjs/lucid/orm'

import type {
  BelongsTo,
} from '@adonisjs/lucid/types/relations'

import Commande from '#models/commande'
import Utilisateur from '#models/utilisateur'

export default class Livraison extends BaseModel {
  public static table = 'livraisons'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare commandeId: string

  @column()
  declare livreurId: string | null

  @column()
  declare statut: string

  @column.dateTime()
  declare dateDepart: DateTime | null

  @column.dateTime()
  declare dateLivraison: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
  })
  declare updatedAt: DateTime

  @belongsTo(() => Commande, {
    foreignKey: 'commandeId',
  })
  declare commande: BelongsTo<typeof Commande>

  @belongsTo(() => Utilisateur, {
    foreignKey: 'livreurId',
  })
  declare livreur: BelongsTo<typeof Utilisateur>
}