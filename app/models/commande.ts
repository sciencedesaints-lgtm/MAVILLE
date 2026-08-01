import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  belongsTo,
  hasMany,
  hasOne,
} from '@adonisjs/lucid/orm'

import type {
  BelongsTo,
  HasMany,
  HasOne,
} from '@adonisjs/lucid/types/relations'

import Utilisateur from '#models/utilisateur'
import Etablissement from '#models/etablissement'
import CommandeArticle from '#models/commande_article'
import Livraison from '#models/livraison'
import Facture from '#models/facture'
import Paiement from '#models/paiement'

export default class Commande extends BaseModel {
  public static table = 'commandes'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare clientId: string

  @column()
  declare etablissementId: string

  @column()
  declare numero: string

  @column()
  declare montantTotal: number

  @column()
  declare devise: string

  @column()
  declare statut: string

  @column()
  declare modeLivraison: string | null

  @column()
  declare modePaiement: string | null

  @column()
  declare adresseLivraison: string | null

  @column()
  declare latitude: number | null

  @column()
  declare longitude: number | null

  @column()
  declare position: any

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
  })
  declare updatedAt: DateTime

  @belongsTo(() => Utilisateur, {
    foreignKey: 'clientId',
  })
  declare client: BelongsTo<typeof Utilisateur>

  @belongsTo(() => Etablissement, {
    foreignKey: 'etablissementId',
  })
  declare etablissement: BelongsTo<typeof Etablissement>

  @hasMany(() => CommandeArticle, {
    foreignKey: 'commandeId',
  })
  declare articles: HasMany<typeof CommandeArticle>

  @hasOne(() => Livraison, {
    foreignKey: 'commandeId',
  })
  declare livraison: HasOne<typeof Livraison>

  @hasOne(() => Facture, {
    foreignKey: 'commandeId',
  })
  declare facture: HasOne<typeof Facture>

  @hasOne(() => Paiement, {
    foreignKey: 'commandeId',
  })
  declare paiement: HasOne<typeof Paiement>
}