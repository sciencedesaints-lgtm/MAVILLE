import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {

  protected tableName = 'prix_produits_essentiels'

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

      table.integer('categorie_id')
        .unsigned()
        .references('id')
        .inTable('categories_produits')
        .onDelete('SET NULL')

      table.string('produit', 255).notNullable()

      table.decimal('prix_min', 15, 2)

      table.decimal('prix_moyen', 15, 2)

      table.decimal('prix_max', 15, 2)

      table.string('devise', 10).defaultTo('USD')

      table.string('unite', 30)

      table.date('date_releve').notNullable()

      table.timestamps(true, true)

      table.index(['ville_id'])
      table.index(['categorie_id'])
      table.index(['produit'])
      table.index(['date_releve'])

    })

  }

  async down() {
    this.schema.dropTable(this.tableName)
  }

}