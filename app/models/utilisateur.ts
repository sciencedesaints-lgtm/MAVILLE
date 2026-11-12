import { DateTime } from 'luxon'

import {
  BaseModel,
  column,
  belongsTo,
  manyToMany,
  hasMany,
  beforeSave,
} from '@adonisjs/lucid/orm'

import type {
  BelongsTo,
  ManyToMany,
  HasMany,
} from '@adonisjs/lucid/types/relations'

import hash from '@adonisjs/core/services/hash'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

import Ville from '#models/ville'
import Role from '#models/role'
import Etablissement from '#models/etablissement'
import AbonnementEtablissement from '#models/abonnement_etablissement'
import Favori from '#models/favori'
import Recherche from '#models/recherche'
import HistoriqueRecherche from '#models/historique_recherche'
import Commande from '#models/commande'
import Conversation from '#models/conversation'
import ConversationParticipant from '#models/conversation_participant'
import Message from '#models/message'
import Notification from '#models/notification'
import DemandeService from '#models/demande_service'
import Emploi from '#models/emploi'
import CandidatureEmploi from '#models/candidature_emploi'
import Evenement from '#models/evenement'
import AbonnementPremium from '#models/abonnement_premium'
import SignalementCitoyen from '#models/signalement_citoyen'
import ProduitAgricole from '#models/produit_agricole'
import Avis from '#models/avis'
import JournalActivite from '#models/journal_activite'
import Service from '#models/service'
import Livraison from '#models/livraison'

export default class Utilisateur extends BaseModel {
  // Configurer le provider d'access tokens pour l'auth API
  static accessTokens = DbAccessTokensProvider.forModel(Utilisateur)

  // Adaptez le type (number ou string/UUID) selon votre schéma de BD réel
  @column({ isPrimary: true })
  declare id: number 

  @column()
  declare villeId: string | null

  // --- NOUVELLES COLONNES AJOUTÉES POUR LES FORMULAIRES ---
  @column()
  declare typeCompte: 'personnel' | 'entreprise_agence' | 'administration_publique'

  @column()
  declare pays: string | null

  @column()
  declare ville: string | null

  @column()
  declare typeStructure: string | null

  @column()
  declare nomEntreprise: string | null

  @column()
  declare domaine: string | null

  @column()
  declare avenue: string | null

  @column()
  declare numero: string | null

  @column()
  declare indicatifPays: string | null

  @column()
  declare typeInstitution: string | null

  @column()
  declare nomInstitution: string | null

  @column()
  declare tutelle: string | null
  // -------------------------------------------------------

  @column()
  declare nom: string

  @column()
  declare prenom: string | null

  @column()
  declare pseudo: string | null

  @column()
  declare email: string | null

  @column()
  declare telephone: string | null

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare photoProfil: string | null

  @column()
  declare sexe: string | null

  @column.date()
  declare dateNaissance: DateTime | null

  @column()
  declare languePreferee: string | null

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

  /**
   * Colonne PostGIS : GEOGRAPHY(POINT,4326)
   */
  @column()
  declare position: unknown

  @column()
  declare emailVerifie: boolean

  @column.dateTime()
  declare emailVerifiedAt: DateTime | null

  @column()
  declare telephoneVerifie: boolean

  @column()
  declare compteGoogle: boolean

  @column()
  declare compteTelephone: boolean

  @column()
  declare statutCompte:
    | 'actif'
    | 'en_attente'
    | 'suspendu'
    | 'bloque'
    | 'supprime'

  @column()
  declare actif: boolean

  @column({ serializeAs: null })
  declare rememberMeToken: string | null

  @column.dateTime()
  declare derniereConnexion: DateTime | null

  @column.dateTime()
  declare deletedAt: DateTime | null

  @column()
  declare reponseAuto: boolean

  @column()
  declare profession: string | null

  @column()
  declare qualification: string | null

  /*
  |--------------------------------------------------------------------------
  | Relations
  |--------------------------------------------------------------------------
  */

  @belongsTo(() => Ville, {
    foreignKey: 'villeId',
  })
  declare villeRelation: BelongsTo<typeof Ville> // Renommé pour éviter le conflit avec la colonne textuelle `ville` si nécessaire

  @manyToMany(() => Role, {
    pivotTable: 'utilisateur_roles',
  })
  declare roles: ManyToMany<typeof Role>

  @hasMany(() => Etablissement, {
    foreignKey: 'utilisateurId',
  })
  declare etablissements: HasMany<typeof Etablissement>

  @hasMany(() => AbonnementEtablissement, {
    foreignKey: 'utilisateurId',
  })
  declare abonnementsEtablissements: HasMany<typeof AbonnementEtablissement>

  @hasMany(() => Favori, {
    foreignKey: 'utilisateurId',
  })
  declare favoris: HasMany<typeof Favori>

  @hasMany(() => Recherche, {
    foreignKey: 'utilisateurId',
  })
  declare recherches: HasMany<typeof Recherche>

  @hasMany(() => HistoriqueRecherche, {
    foreignKey: 'utilisateurId',
  })
  declare historiqueRecherches: HasMany<typeof HistoriqueRecherche>

  @hasMany(() => Commande, {
    foreignKey: 'clientId',
  })
  declare commandes: HasMany<typeof Commande>

  @hasMany(() => Conversation, {
    foreignKey: 'createurId',
  })
  declare conversations: HasMany<typeof Conversation>

  @hasMany(() => ConversationParticipant, {
    foreignKey: 'utilisateurId',
  })
  declare conversationsParticipees: HasMany<typeof ConversationParticipant>

  @hasMany(() => Message, {
    foreignKey: 'expediteurId',
  })
  declare messages: HasMany<typeof Message>

  @hasMany(() => Notification, {
    foreignKey: 'utilisateurId',
  })
  declare notifications: HasMany<typeof Notification>

  @hasMany(() => DemandeService, {
    foreignKey: 'utilisateurId',
  })
  declare demandesServices: HasMany<typeof DemandeService>

  @hasMany(() => Emploi, {
    foreignKey: 'createurId',
  })
  declare emplois: HasMany<typeof Emploi>

  @hasMany(() => CandidatureEmploi, {
    foreignKey: 'utilisateurId',
  })
  declare candidatures: HasMany<typeof CandidatureEmploi>

  @hasMany(() => Evenement, {
    foreignKey: 'organisateurId',
  })
  declare evenements: HasMany<typeof Evenement>

  @hasMany(() => AbonnementPremium, {
    foreignKey: 'utilisateurId',
  })
  declare abonnementsPremium: HasMany<typeof AbonnementPremium>

  @hasMany(() => SignalementCitoyen, {
    foreignKey: 'utilisateurId',
  })
  declare signalements: HasMany<typeof SignalementCitoyen>

  @hasMany(() => ProduitAgricole, {
    foreignKey: 'producteurId',
  })
  declare produitsAgricoles: HasMany<typeof ProduitAgricole>

  @hasMany(() => Avis, {
    foreignKey: 'utilisateurId',
  })
  declare avis: HasMany<typeof Avis>

  @hasMany(() => JournalActivite, {
    foreignKey: 'utilisateurId',
  })
  declare journalActivites: HasMany<typeof JournalActivite>

  @hasMany(() => Service, {
    foreignKey: 'prestataireId',
  })
  declare services: HasMany<typeof Service>

  @hasMany(() => Livraison, {
    foreignKey: 'livreurId',
  })
  declare livraisons: HasMany<typeof Livraison>

  /*
  |--------------------------------------------------------------------------
  | Méthodes d'authentification
  |--------------------------------------------------------------------------
  */

  public static async verifyCredentials(email: string, password: string) {
    const user = await this.findBy('email', email)
    if (!user) {
      return null
    }

    const isValid = await hash.verify(user.password, password)
    if (!isValid) {
      return null
    }

    return user
  }

  /*
  |--------------------------------------------------------------------------
  | Hooks
  |--------------------------------------------------------------------------
  */

  @beforeSave()
  static async hashPassword(utilisateur: Utilisateur) {
    if (utilisateur.$dirty.password) {
      utilisateur.password = await hash.make(utilisateur.password)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Timestamps
  |--------------------------------------------------------------------------
  */

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}