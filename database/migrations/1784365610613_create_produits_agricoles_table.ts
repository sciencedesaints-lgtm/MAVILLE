import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'produits_agricoles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {

      table.uuid('id')
        .primary()
        .defaultTo(this.raw('uuid_generate_v4()'))

      table.uuid('producteur_id')
        .notNullable()
        .references('id')
        .inTable('utilisateurs')
        .onDelete('CASCADE')

      table.integer('categorie_id')
        .unsigned()
        .references('id')
        .inTable('categories_produits')
        .onDelete('SET NULL')

      table.uuid('ville_id')
        .notNullable()
        .references('id')
        .inTable('villes')
        .onDelete('RESTRICT')

      table.string('nom', 255).notNullable()

      table.text('description')

      table.decimal('prix', 15, 2).notNullable()

      table.string('devise', 10).defaultTo('USD')

      table.decimal('quantite', 12, 2).notNullable()

      table.string('unite', 30).notNullable()

      table.boolean('disponible').defaultTo(true)

      table.string('telephone', 30)

      table.decimal('latitude', 10, 8)

      table.decimal('longitude', 11, 8)

      table.specificType('position', 'GEOGRAPHY(POINT,4326)')

      table.timestamps(true, true)

      table.index(['producteur_id'])
      table.index(['categorie_id'])
      table.index(['ville_id'])
      table.index(['nom'])
      table.index(['disponible'])

    })

    this.defer(async (db) => {

      await db.rawQuery(`
        CREATE INDEX idx_produits_agricoles_position
        ON produits_agricoles
        USING GIST(position)
      `)

    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}