import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'produits'

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

      table.integer('categorie_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('categories_produits')
        .onDelete('RESTRICT')

      table.string('nom', 255).notNullable()

      table.string('slug', 255).notNullable().unique()

      table.text('description')

      table.string('reference', 100)

      table.string('code_barres', 100)

      table.decimal('prix', 15, 2).notNullable()

      table.string('devise', 10).defaultTo('USD')

      table.decimal('ancien_prix', 15, 2)

      table.integer('stock').defaultTo(0)

      table.string('unite', 50)

      table.decimal('poids', 10, 2)

      table.boolean('disponible').defaultTo(true)

      table.boolean('visible').defaultTo(true)

      table.boolean('promotion').defaultTo(false)

      table.decimal('note_moyenne', 3, 2).defaultTo(0)

      table.integer('nombre_avis').defaultTo(0)

      table.integer('nombre_vues').defaultTo(0)

      table.integer('ordre_affichage').defaultTo(0)

      table.timestamps(true, true)

      table.index(['etablissement_id'])
      table.index(['categorie_id'])
      table.index(['nom'])
      table.index(['slug'])
      table.index(['reference'])
      table.index(['code_barres'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}