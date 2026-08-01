import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'candidatures_emplois'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))

      table.uuid('emploi_id')
        .references('id')
        .inTable('emplois')
        .onDelete('CASCADE')

      table.uuid('utilisateur_id')
        .references('id')
        .inTable('utilisateurs')
        .onDelete('CASCADE')

      table.string('cv_url', 500)

      table.string('lettre_motivation_url', 500)

      table.string('statut', 30).defaultTo('EN_ATTENTE')

      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}