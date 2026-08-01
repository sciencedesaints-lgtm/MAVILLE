import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pays'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id')
        .primary()
        .defaultTo(this.raw('uuid_generate_v4()'))

      table
        .uuid('continent_id')
        .notNullable()
        .references('id')
        .inTable('continents')
        .onDelete('RESTRICT')

      table.string('nom', 100).notNullable()

      table.string('code_iso2', 2).notNullable().unique()

      table.string('code_iso3', 3).unique()

      table.string('devise', 20)

      table.string('symbole_devise', 10)

      table.string('indicatif_telephonique', 10)

      table.string('langue_principale', 50)

      table.string('fuseau_horaire', 50)

      table.timestamp('created_at').defaultTo(this.now())

      table.timestamp('updated_at').defaultTo(this.now())

      table.index(['continent_id'])
      table.index(['nom'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}