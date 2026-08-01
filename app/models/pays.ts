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

import Continent from '#models/continent'
import Ville from '#models/ville'

export default class Pays extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare continentId: string

  @column()
  declare nom: string

  @column()
  declare codeIso2: string

  @column()
  declare codeIso3: string | null

  @column()
  declare devise: string | null

  @column()
  declare symboleDevise: string | null

  @column()
  declare indicatifTelephonique: string | null

  @column()
  declare languePrincipale: string | null

  @column()
  declare fuseauHoraire: string | null

  @belongsTo(() => Continent, {
    foreignKey: 'continentId',
  })
  declare continent: BelongsTo<typeof Continent>

  @hasMany(() => Ville, {
    foreignKey: 'paysId',
  })
  declare villes: HasMany<typeof Ville>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
  })
  declare updatedAt: DateTime
}