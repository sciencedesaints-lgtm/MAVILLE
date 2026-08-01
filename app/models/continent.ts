import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

import Pays from '#models/pays'

export default class Continent extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare nom: string

  @column()
  declare code: string

  @hasMany(() => Pays, {
    foreignKey: 'continentId',
  })
  declare pays: HasMany<typeof Pays>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
  })
  declare updatedAt: DateTime
}