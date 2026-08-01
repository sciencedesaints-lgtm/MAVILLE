import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'alertes_ville'

  async up() {
    this.schema.createTable(this.tableName, (table) => {

      table.uuid('id')
        .primary()
        .defaultTo(this.raw('uuid_generate_v4()'))

      table.uuid('ville_id')
        .notNullable()
        .references('id')
        .inTable('villes')
        .onDelete('CASCADE')

      table.uuid('createur_id')
        .references('id')
        .inTable('utilisateurs')
        .onDelete('SET NULL')

      table.string('titre',255).notNullable()

      table.text('description').notNullable()

      table.string('type',50).notNullable()
      // METEO
      // SECURITE
      // CIRCULATION
      // SANTE
      // CATASTROPHE
      // AUTRE

      table.string('niveau',20).defaultTo('MOYEN')
      // FAIBLE
      // MOYEN
      // ELEVE
      // CRITIQUE

      table.timestamp('date_debut')

      table.timestamp('date_fin')

      table.boolean('active').defaultTo(true)

      table.timestamps(true,true)

      table.index(['ville_id'])
      table.index(['type'])
      table.index(['niveau'])
      table.index(['active'])

    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}