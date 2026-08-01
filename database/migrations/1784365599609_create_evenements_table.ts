import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'evenements'

  async up() {
    this.schema.createTable(this.tableName, (table) => {

      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))

      table.uuid('organisateur_id')
        .references('id')
        .inTable('utilisateurs')

      table.string('titre', 255).notNullable()

      table.text('description')

      table.timestamp('date_debut')

      table.timestamp('date_fin')

      table.string('lieu', 255)

      table.specificType('position', 'GEOGRAPHY(POINT,4326)')

      table.boolean('public').defaultTo(true)

      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}