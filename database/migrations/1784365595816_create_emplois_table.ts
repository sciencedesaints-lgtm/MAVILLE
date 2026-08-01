import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'emplois'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))

      table.uuid('etablissement_id')
        .notNullable()
        .references('id')
        .inTable('etablissements')
        .onDelete('CASCADE')

      table.string('titre', 255).notNullable()

      table.text('description').notNullable()

      table.string('type_contrat', 50)

      table.decimal('salaire_min', 15, 2)

      table.decimal('salaire_max', 15, 2)

      table.string('devise', 10).defaultTo('USD')

      table.date('date_limite')

      table.boolean('active').defaultTo(true)

      table.timestamps(true, true)

      table.index(['etablissement_id'])
      table.index(['active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}