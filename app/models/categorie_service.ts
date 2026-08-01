import { DateTime } from 'luxon'

import {
  BaseModel,
  column,
  hasMany,
} from '@adonisjs/lucid/orm'

import type {
  HasMany,
} from '@adonisjs/lucid/types/relations'

import Service from '#models/service'

export default class CategorieService extends BaseModel {
  public static table = 'categories_services'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nom: string

  @column()
  declare description: string | null

  @column()
  declare icone: string | null

  @column()
  declare active: boolean

  @column()
  declare slug: string

  @column()
  declare ordreAffichage: number

  @column()
  declare couleur: string | null

  @column()
  declare estPopulaire: boolean

  @hasMany(() => Service, {
    foreignKey: 'categorieId',
  })
  declare services: HasMany<typeof Service>

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