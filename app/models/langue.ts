import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  hasMany,
} from '@adonisjs/lucid/orm'

import type { HasMany } from '@adonisjs/lucid/types/relations'

import Traduction from '#models/traduction'

export default class Langue extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare code: string

  @column()
  declare nom: string

  @column()
  declare nativeName: string | null

  @column()
  declare active: boolean

  @hasMany(() => Traduction, {
    foreignKey: 'langueSource',
  })
  declare traductionsSource: HasMany<typeof Traduction>

  @hasMany(() => Traduction, {
    foreignKey: 'langueCible',
  })
  declare traductionsCible: HasMany<typeof Traduction>

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