import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  manyToMany,
} from '@adonisjs/lucid/orm'

import type { ManyToMany } from '@adonisjs/lucid/types/relations'

import Utilisateur from '#models/utilisateur'

export default class Role extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nom: string

  @column()
  declare description: string | null

  @manyToMany(() => Utilisateur, {
    pivotTable: 'utilisateur_roles',
  })
  declare utilisateurs: ManyToMany<typeof Utilisateur>

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