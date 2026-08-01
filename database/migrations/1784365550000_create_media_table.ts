import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'medias'

  async up() {
    this.schema.createTable(this.tableName, (table) => {

      table.uuid('id')
        .primary()
        .defaultTo(this.raw('uuid_generate_v4()'))

      table.uuid('utilisateur_id')
        .references('id')
        .inTable('utilisateurs')
        .onDelete('SET NULL')

      table.string('type_media', 30).notNullable()
      // IMAGE | VIDEO | AUDIO | DOCUMENT

      table.string('nom_fichier', 255)

      table.string('url', 500).notNullable()

      table.string('miniature', 500)

      table.string('mime_type', 100)

      table.bigInteger('taille')

      table.integer('duree')

      table.timestamps(true, true)

      table.index(['utilisateur_id'])
      table.index(['type_media'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}