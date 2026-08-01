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
import Message from '#models/message'

export default class Media extends BaseModel {
  public static table = 'medias'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare utilisateurId: string | null

  @column()
  declare typeMedia: string

  @column()
  declare nomFichier: string | null

  @column()
  declare url: string

  @column()
  declare miniature: string | null

  @column()
  declare mimeType: string | null

  @column()
  declare taille: number | null

  @column()
  declare duree: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
  })
  declare updatedAt: DateTime

  @belongsTo(() => Utilisateur, {
    foreignKey: 'utilisateurId',
  })
  declare utilisateur: BelongsTo<typeof Utilisateur>

  @hasMany(() => Message, {
    foreignKey: 'mediaId',
  })
  declare messages: HasMany<typeof Message>
}