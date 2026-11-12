import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('reponses_recherche', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.uuid('recherche_id').notNullable()
        .references('id').inTable('recherches').onDelete('CASCADE')
      table.uuid('vendeur_id').notNullable()
        .references('id').inTable('utilisateurs').onDelete('CASCADE')
      table.string('genre', 20).notNullable()
      table.uuid('offre_id').notNullable()
      table.string('offre_titre', 255).notNullable()
      // en_attente | disponible | indisponible
      table.string('statut', 20).notNullable().defaultTo('en_attente')
      // manuel | auto
      table.string('mode', 10)
      table.timestamp('repondu_at', { useTz: true })
      table.timestamps(true, true)

      table.unique(['recherche_id', 'vendeur_id'])
    })

    this.schema.alterTable('utilisateurs', (table) => {
      table.boolean('reponse_auto').notNullable().defaultTo(false)
    })
  }

  async down() {
    this.schema.alterTable('utilisateurs', (table) => {
      table.dropColumn('reponse_auto')
    })
    this.schema.dropTable('reponses_recherche')
  }
}