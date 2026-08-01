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

import Pays from '#models/pays'
import Utilisateur from '#models/utilisateur'
import Etablissement from '#models/etablissement'
import Service from '#models/service'

import PrixProduitEssentiel from '#models/prix_produit_essentiel'
import AlerteVille from '#models/alerte_ville'

export default class Ville extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare paysId: string

  @column()
  declare nom: string

  @column()
  declare provinceEtat: string | null

  @column()
  declare codePostal: string | null

  @column()
  declare population: number | null

  @column()
  declare superficie: number | null

  @column()
  declare latitude: number | null

  @column()
  declare longitude: number | null

  @column()
  declare position: unknown

  @belongsTo(() => Pays, {
    foreignKey: 'paysId',
  })
  declare pays: BelongsTo<typeof Pays>

  @hasMany(() => Utilisateur, {
    foreignKey: 'villeId',
  })
  declare utilisateurs: HasMany<typeof Utilisateur>

  @hasMany(() => Etablissement, {
    foreignKey: 'villeId',
  })
  declare etablissements: HasMany<typeof Etablissement>

  @hasMany(() => Service, {
    foreignKey: 'villeId',
  })
  declare services: HasMany<typeof Service>

  @hasMany(() => PrixProduitEssentiel, {
    foreignKey: 'villeId',
  })
  declare prixProduitsEssentiels: HasMany<typeof PrixProduitEssentiel>
  
  @hasMany(() => AlerteVille, {
    foreignKey: 'villeId',
  })
  declare alertes: HasMany<typeof AlerteVille>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
  })
  declare updatedAt: DateTime
}