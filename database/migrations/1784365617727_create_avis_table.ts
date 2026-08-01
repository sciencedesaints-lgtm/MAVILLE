import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {

  protected tableName = 'avis'

  async up() {

    this.schema.createTable(this.tableName,(table)=>{

      table.uuid('id')
        .primary()
        .defaultTo(this.raw('uuid_generate_v4()'))

      table.uuid('utilisateur_id')
        .notNullable()
        .references('id')
        .inTable('utilisateurs')
        .onDelete('CASCADE')

      table.string('type_element',30).notNullable()
      // ETABLISSEMENT
      // PRODUIT
      // SERVICE
      // LIVREUR

      table.uuid('element_id').notNullable()

      table.integer('note').notNullable()

      table.text('commentaire')

      table.boolean('visible').defaultTo(true)

      table.timestamps(true,true)

      table.index(['utilisateur_id'])
      table.index(['type_element'])
      table.index(['element_id'])

    })

  }

  async down() {
    this.schema.dropTable(this.tableName)
  }

}