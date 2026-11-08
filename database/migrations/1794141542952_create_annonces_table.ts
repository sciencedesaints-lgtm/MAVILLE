import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'annonces'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))

      table.uuid('vendeur_id').notNullable()
        .references('id').inTable('utilisateurs').onDelete('CASCADE')
      table.integer('categorie_id').unsigned().notNullable()
        .references('id').inTable('categories_produits').onDelete('RESTRICT')
      table.uuid('ville_id').notNullable()
        .references('id').inTable('villes').onDelete('RESTRICT')

      table.string('titre', 255).notNullable()
      table.string('slug', 255).notNullable().unique()
      table.text('description')

      // 'vente' ou 'location'
      table.string('type_offre', 10).notNullable().defaultTo('vente')
      // 'neuf', 'occasion' ou 'bon_etat'
      table.string('etat', 20)

      table.decimal('prix', 15, 2)
      table.string('devise', 10).defaultTo('USD')
      table.boolean('prix_negociable').defaultTo(true)
      // Pour les locations : 'jour', 'semaine', 'mois', 'an'
      table.string('periodicite', 10)

      table.string('telephone', 30)
      table.string('whatsapp', 30)

      table.string('quartier', 120)
      table.string('commune', 120)
      table.string('avenue', 150)
      table.string('repere', 255)

      table.boolean('disponible').defaultTo(true)
      table.boolean('visible').defaultTo(true)
      table.integer('nombre_vues').defaultTo(0)

      table.timestamps(true, true)

      table.index(['vendeur_id'])
      table.index(['categorie_id'])
      table.index(['ville_id'])
      table.index(['titre'])
      table.index(['type_offre'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}