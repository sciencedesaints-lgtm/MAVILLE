import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('lieux', (table) => {
      table.increments('id')
      table.uuid('ville_id').notNullable().references('id').inTable('villes').onDelete('CASCADE')
      table.string('nom', 150).notNullable()
      // commune | quartier | marche | site
      table.string('type', 20).notNullable().defaultTo('quartier')
      table.string('commune', 150).nullable()
      // autres écritures, séparées par ";" (ex : Kabulameshi;Kabulamenshi)
      table.text('alias').nullable()
      table.decimal('latitude', 10, 8).nullable()
      table.decimal('longitude', 11, 8).nullable()
      table.timestamps(true, true)
      table.unique(['ville_id', 'nom'])
    })
  }

  async down() {
    this.schema.dropTable('lieux')
  }
}