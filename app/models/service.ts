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
import Ville from '#models/ville'
import CategorieService from '#models/categorie_service'
import ReponseDemandeService from '#models/reponse_demande_service'

export default class Service extends BaseModel {
  public static table = 'services'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare prestataireId: string

  @column()
  declare categorieId: number

  @column()
  declare villeId: string

  @column()
  declare nom: string

  @column()
  declare slug: string

  @column()
  declare description: string | null

  @column()
  declare prixMin: number | null

  @column()
  declare prixMax: number | null

  @column()
  declare devise: string

  @column()
  declare prixNegociable: boolean

  @column()
  declare interventionDomicile: boolean

  @column()
  declare surRendezVous: boolean

  @column()
  declare urgence: boolean

  @column()
  declare disponible: boolean

  @column()
  declare visible: boolean

  @column()
  declare telephone: string | null

  @column()
  declare email: string | null

  @column()
  declare siteWeb: string | null

  @column()
  declare adresse: string | null

  @column()
  declare quartier: string | null

  @column()
  declare commune: string | null

  @column()
  declare latitude: number | null

  @column()
  declare longitude: number | null

  @column()
  declare noteMoyenne: number

  @column()
  declare nombreAvis: number

  @column()
  declare nombreVues: number

  @column()
  declare ordreAffichage: number

  @belongsTo(() => Utilisateur, {
    foreignKey: 'prestataireId',
  })
  declare prestataire: BelongsTo<typeof Utilisateur>

  @belongsTo(() => Ville, {
    foreignKey: 'villeId',
  })
  declare ville: BelongsTo<typeof Ville>

  @belongsTo(() => CategorieService, {
    foreignKey: 'categorieId',
  })
  declare categorie: BelongsTo<typeof CategorieService>

  @hasMany(() => ReponseDemandeService, {
    foreignKey: 'serviceId',
  })
  declare reponsesDemandes: HasMany<typeof ReponseDemandeService>

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