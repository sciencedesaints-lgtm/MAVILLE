import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'utilisateurs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id')
        .primary()
        .defaultTo(this.raw('uuid_generate_v4()'))

      table
        .uuid('ville_id')
        .references('id')
        .inTable('villes')
        .onDelete('SET NULL')

      table.string('nom', 100).notNullable()

      table.string('prenom', 100).notNullable()

      table.string('pseudo', 80).unique()

      table.string('email', 255).unique()

      table.string('telephone', 30).unique()

      // Convention AdonisJS
      table.text('password').notNullable()

      table.text('photo_profil')

      table.string('sexe', 20)

      table.date('date_naissance')

      table.string('langue_preferee', 20)

      table.text('adresse')

      table.string('quartier', 120)

      table.string('commune', 120)

      table.decimal('latitude', 10, 8)

      table.decimal('longitude', 11, 8)

      // Position GPS (PostGIS)
      table.specificType('position', 'GEOGRAPHY(POINT,4326)')

      // Vérifications
      table.boolean('email_verifie').defaultTo(false)
      table.timestamp('email_verified_at').nullable()

      table.boolean('telephone_verifie').defaultTo(false)

      // Comptes externes
      table.boolean('compte_google').defaultTo(false)
      table.boolean('compte_telephone').defaultTo(false)

      // Statut du compte
      table
        .enu('statut_compte', [
          'actif',
          'en_attente',
          'suspendu',
          'bloque',
          'supprime',
        ])
        .defaultTo('actif')

      table.boolean('actif').defaultTo(true)

      // Token "Se souvenir de moi"
      table.string('remember_me_token', 255)

      // Dernière connexion
      table.timestamp('derniere_connexion')

      // Soft Delete
      table.timestamp('deleted_at').nullable()

      // Horodatage
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())

      // Index
      table.index(['ville_id'])
      table.index(['email'])
      table.index(['telephone'])
      table.index(['pseudo'])
      table.index(['statut_compte'])
      table.index(['deleted_at'])
    })

    // Index spatial PostGIS
    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE INDEX idx_utilisateurs_position
        ON utilisateurs
        USING GIST(position)
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}