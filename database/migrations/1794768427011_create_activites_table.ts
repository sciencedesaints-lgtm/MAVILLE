import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('activites', (table) => {
      table.increments('id')
      table.string('type_compte', 30).notNullable() // entreprise_agence | administration_publique
      table.string('nom', 150).notNullable()
      table.string('slug', 150).notNullable().unique()
      table.integer('ordre').defaultTo(0)
      table.timestamps(true, true)
    })

    this.schema.createTable('utilisateur_activites', (table) => {
      table.uuid('utilisateur_id').notNullable()
        .references('id').inTable('utilisateurs').onDelete('CASCADE')
      table.integer('activite_id').unsigned().notNullable()
        .references('id').inTable('activites').onDelete('CASCADE')
      table.primary(['utilisateur_id', 'activite_id'])
    })
  }

  async down() {
    this.schema.dropTable('utilisateur_activites')
    this.schema.dropTable('activites')
  }
}