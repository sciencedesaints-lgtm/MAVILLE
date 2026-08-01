import { DateTime } from 'luxon'

import {
  BaseModel,
  column,
  belongsTo,
} from '@adonisjs/lucid/orm'

import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import Utilisateur from '#models/utilisateur'
import Role from '#models/role'

export default class UtilisateurRole extends BaseModel {
  public static table = 'utilisateur_roles'

  @column({ isPrimary: true })
  declare utilisateurId: string

  @column({ isPrimary: true })
  declare roleId: number

  @belongsTo(() => Utilisateur, {
    foreignKey: 'utilisateurId',
  })
  declare utilisateur: BelongsTo<typeof Utilisateur>

  @belongsTo(() => Role, {
    foreignKey: 'roleId',
  })
  declare role: BelongsTo<typeof Role>

  @column.dateTime({
    autoCreate: true,
  })
  declare createdAt: DateTime
}