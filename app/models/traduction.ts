import { DateTime } from 'luxon'

import {
  BaseModel,
  column,
  belongsTo,
} from '@adonisjs/lucid/orm'

import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import Langue from '#models/langue'

export default class Traduction extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare langueSource: number | null

  @column()
  declare langueCible: number | null

  @column()
  declare texteSource: string | null

  @column()
  declare texteTraduit: string | null

  @column()
  declare audioSource: string | null

  @column()
  declare audioTraduit: string | null

  @belongsTo(() => Langue, {
    foreignKey: 'langueSource',
  })
  declare source: BelongsTo<typeof Langue>

  @belongsTo(() => Langue, {
    foreignKey: 'langueCible',
  })
  declare cible: BelongsTo<typeof Langue>

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