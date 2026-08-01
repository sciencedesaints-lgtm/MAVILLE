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
import ConversationParticipant from '#models/conversation_participant'
import Message from '#models/message'

export default class Conversation extends BaseModel {
  public static table = 'conversations'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare type: string

  @column()
  declare nom: string | null

  @column()
  declare description: string | null

  @column()
  declare createurId: string

  @column()
  declare active: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
  })
  declare updatedAt: DateTime

  @belongsTo(() => Utilisateur, {
    foreignKey: 'createurId',
  })
  declare createur: BelongsTo<typeof Utilisateur>

  @hasMany(() => ConversationParticipant, {
    foreignKey: 'conversationId',
  })
  declare participants: HasMany<typeof ConversationParticipant>

  @hasMany(() => Message, {
    foreignKey: 'conversationId',
  })
  declare messages: HasMany<typeof Message>
}