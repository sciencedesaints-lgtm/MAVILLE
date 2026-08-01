import { DateTime } from 'luxon'
import {
  BaseModel,
  belongsTo,
  column,
} from '@adonisjs/lucid/orm'

import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import Conversation from '#models/conversation'
import Utilisateur from '#models/utilisateur'
import Media from '#models/media'

export default class Message extends BaseModel {
  public static table = 'messages'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare conversationId: string

  @column()
  declare expediteurId: string

  @column()
  declare mediaId: string | null

  @column()
  declare contenu: string | null

  @column()
  declare lu: boolean

  @column()
  declare modifie: boolean

  @column()
  declare supprime: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
  })
  declare updatedAt: DateTime

  @belongsTo(() => Conversation, {
    foreignKey: 'conversationId',
  })
  declare conversation: BelongsTo<typeof Conversation>

  @belongsTo(() => Utilisateur, {
    foreignKey: 'expediteurId',
  })
  declare expediteur: BelongsTo<typeof Utilisateur>

  @belongsTo(() => Media, {
    foreignKey: 'mediaId',
  })
  declare media: BelongsTo<typeof Media>
}