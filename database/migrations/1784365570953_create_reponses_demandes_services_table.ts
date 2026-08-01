import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'reponses_demandes_services'

  async up() {
    this.schema.createTable(this.tableName, (table) => {

      table.uuid('id')
        .primary()
        .defaultTo(this.raw('uuid_generate_v4()'))

      table.uuid('demande_id')
        .notNullable()
        .references('id')
        .inTable('demandes_services')
        .onDelete('CASCADE')

      table.uuid('service_id')
        .notNullable()
        .references('id')
        .inTable('services')
        .onDelete('CASCADE')

      table.boolean('disponible').defaultTo(true)

      table.integer('temps_estime_minutes')

      table.decimal('distance_km', 8, 2)

      table.decimal('prix_estime', 15, 2)

      table.string('devise', 10).defaultTo('USD')

      table.boolean('selectionne').defaultTo(false)

      table.timestamps(true, true)

      table.index(['demande_id'])
      table.index(['service_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}