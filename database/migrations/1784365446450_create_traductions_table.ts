import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'traductions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(this.raw('uuid_generate_v4()'))

      table
        .integer('langue_source')
        .unsigned()
        .references('id')
        .inTable('langues')
        .onDelete('SET NULL')

      table
        .integer('langue_cible')
        .unsigned()
        .references('id')
        .inTable('langues')
        .onDelete('SET NULL')

      table.text('texte_source')

      table.text('texte_traduit')

      table.text('audio_source')

      table.text('audio_traduit')

      table.timestamp('created_at').defaultTo(this.now())

      table.timestamp('updated_at').defaultTo(this.now())

      table.index(['langue_source'])
      table.index(['langue_cible'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}