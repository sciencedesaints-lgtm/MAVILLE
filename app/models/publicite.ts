import { DateTime } from 'luxon'
import {
  BaseModel,
  belongsTo,
  column,
} from '@adonisjs/lucid/orm'

import type {
  BelongsTo,
} from '@adonisjs/lucid/types/relations'

import Etablissement from '#models/etablissement'

export default class Publicite extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare etablissementId: string | null

  @column()
  declare titre: string | null

  @column()
  declare description: string | null

  @column()
  declare mediaUrl: string | null

  @column()
  declare typeMedia: 'IMAGE' | 'VIDEO'

  @column()
  declare dureeVideo: number

  @column.dateTime()
  declare debutDiffusion: DateTime | null

  @column.dateTime()
  declare finDiffusion: DateTime | null

  @column()
  declare active: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
  })
  declare updatedAt: DateTime

  /*
  |--------------------------------------------------------------------------
  | Relations
  |--------------------------------------------------------------------------
  */

  @belongsTo(() => Etablissement, {
    foreignKey: 'etablissementId',
  })
  declare etablissement: BelongsTo<typeof Etablissement>
}