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
import Ville from '#models/ville'
import CategorieEtablissement from '#models/categorie_etablissement'

import Produit from '#models/produit'

import AbonnementEtablissement from '#models/abonnement_etablissement'

import Commande from '#models/commande'
import Publicite from '#models/publicite'
import Emploi from '#models/emploi'

export default class Etablissement extends BaseModel {
  public static table = 'etablissements'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare proprietaireId: string

  @column()
  declare categorieId: number

  @column()
  declare villeId: string

  @column()
  declare nom: string

  @column()
  declare slug: string

  @column()
  declare description: string | null

  @column()
  declare telephone: string | null

  @column()
  declare email: string | null

  @column()
  declare siteWeb: string | null

  @column()
  declare adresse: string

  @column()
  declare quartier: string | null

  @column()
  declare commune: string | null

  @column()
  declare avenue: string | null

  @column()
  declare numero: string | null

  @column()
  declare repere: string | null

  @column()
  declare marche: string | null

  @column()
  declare emplacement: string | null

  @column()
  declare typeCommerce: string | null

  @column()
  declare horaires: string | null

  @column()
  declare whatsapp: string | null

  @column({
    prepare: (value: string[] | null) => (value ? `{${value.join(',')}}` : null),
  })
  declare mobileMoney: string[] | null

  @column()
  declare latitude: number | null

  @column()
  declare longitude: number | null

  @column()
  declare position: string | null

  @column()
  declare ouvert: boolean

  @column()
  declare verifie: boolean

  @column()
  declare livraison: boolean

  @column()
  declare retraitSurPlace: boolean

  @column()
  declare visible: boolean

  @column()
  declare noteMoyenne: number

  @column()
  declare nombreAvis: number

  /*
  |--------------------------------------------------------------------------
  | Relations
  |--------------------------------------------------------------------------
  */

  @belongsTo(() => Utilisateur, {
    foreignKey: 'proprietaireId',
  })
  declare proprietaire: BelongsTo<typeof Utilisateur>

  @belongsTo(() => Ville, {
    foreignKey: 'villeId',
  })
  declare ville: BelongsTo<typeof Ville>

  @belongsTo(() => CategorieEtablissement, {
    foreignKey: 'categorieId',
  })
  declare categorie: BelongsTo<typeof CategorieEtablissement>

  @hasMany(() => Produit, {
    foreignKey: 'etablissementId',
  })
  declare produits: HasMany<typeof Produit>

  @hasMany(() => AbonnementEtablissement, {
    foreignKey: 'etablissementId',
  })
  declare abonnements: HasMany<typeof AbonnementEtablissement>

  
  @hasMany(() => Commande, {
    foreignKey: 'etablissementId',
  })
  declare commandes: HasMany<typeof Commande>

  @hasMany(() => Publicite, {
    foreignKey: 'etablissementId',
  })
  declare publicites: HasMany<typeof Publicite>

  @hasMany(() => Emploi, {
    foreignKey: 'etablissementId',
  })
  declare emplois: HasMany<typeof Emploi>

  /*
  |--------------------------------------------------------------------------
  | Dates
  |--------------------------------------------------------------------------
  */

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