import vine from '@vinejs/vine'

/**
 * Ouverture de conversation
 */
export const createConversationValidator = vine.compile(
  vine.object({
    type: vine.enum(['direct', 'groupe', 'support']),
    nom: vine.string().trim().maxLength(100).optional(),
    participantIds: vine.array(vine.string().uuid()).minLength(1),
  })
)

/**
 * Envoi de message
 */
export const sendMessageValidator = vine.compile(
  vine.object({
    conversationId: vine.string().uuid(),
    contenu: vine.string().trim().optional(),
    mediaId: vine.string().uuid().optional(),
  })
)