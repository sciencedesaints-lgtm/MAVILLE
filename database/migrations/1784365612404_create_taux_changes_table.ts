import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {

  protected tableName = 'taux_change'

  async up() {

    this.schema.createTable(this.tableName, (table) => {

      table.uuid('id')
        .primary()
        .defaultTo(this.raw('uuid_generate_v4()'))

      table.string('devise_source', 10).notNullable()

      table.string('devise_cible', 10).notNullable()

      table.decimal('taux', 18, 8).notNullable()

      table.timestamp('date_mise_a_jour').defaultTo(this.now())

      table.timestamps(true, true)

      table.unique([
        'devise_source',
        'devise_cible'
      ])

      table.index(['devise_source'])
      table.index(['devise_cible'])

    })

  }

  async down() {
    this.schema.dropTable(this.tableName)
  }

}