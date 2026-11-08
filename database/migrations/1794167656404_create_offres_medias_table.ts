import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'offres_medias'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))

      // À quelle offre appartient le fichier : 'service', 'commerce' ou 'annonce'
      table.string('type_offre', 20).notNullable()
      table.uuid('offre_id').notNullable()

      // 'image' ou 'video'
      table.string('type', 10).notNullable()
      table.string('url', 255).notNullable()
      table.integer('ordre').defaultTo(0)

      table.timestamps(true, true)

      table.index(['type_offre', 'offre_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}