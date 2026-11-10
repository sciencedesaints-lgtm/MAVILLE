import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'resultats_masques'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.uuid('utilisateur_id').notNullable()
        .references('id').inTable('utilisateurs').onDelete('CASCADE')
      table.string('genre', 20).notNullable()
      table.uuid('offre_id').notNullable()
      // Copie du titre pour l'afficher dans la corbeille même si l'offre est supprimée
      table.string('titre', 255).notNullable()
      table.string('categorie', 150)
      table.timestamps(true, true)

      table.unique(['utilisateur_id', 'genre', 'offre_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}