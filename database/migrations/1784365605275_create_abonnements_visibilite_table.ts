import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {

  protected tableName = 'abonnements_visibilite'

  async up() {

    this.schema.createTable(this.tableName, (table) => {

      table.uuid('id')
        .primary()
        .defaultTo(this.raw('uuid_generate_v4()'))

      table.uuid('etablissement_id')
        .notNullable()
        .references('id')
        .inTable('etablissements')
        .onDelete('CASCADE')

      table.string('niveau', 50).notNullable()
      // STANDARD
      // ARGENT
      // OR
      // PLATINE

      table.integer('priorite')
        .defaultTo(1)

      table.decimal('montant', 15, 2)
        .notNullable()

      table.string('devise', 10)
        .defaultTo('USD')

      table.date('date_debut')
        .notNullable()

      table.date('date_fin')
        .notNullable()

      table.boolean('active')
        .defaultTo(true)

      table.timestamps(true, true)

      table.index(['etablissement_id'])
      table.index(['niveau'])
      table.index(['active'])

    })

  }

  async down() {
    this.schema.dropTable(this.tableName)
  }

}