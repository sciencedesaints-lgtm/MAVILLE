import { DateTime } from 'luxon'
import {
  BaseModel,
  belongsTo,
  column,
} from '@adonisjs/lucid/orm'

import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import Conversation from '#models/conversation'
import Utilisateur from '#models/utilisateur'

export default class ConversationParticipant extends BaseModel {
  public static table = 'conversation_participants'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare conversationId: string

  @column()
  declare utilisateurId: string

  @column()
  declare admin: boolean

  @column.dateTime()
  declare dernierMessageLu: DateTime | null

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
    foreignKey: 'utilisateurId',
  })
  declare utilisateur: BelongsTo<typeof Utilisateur>
}