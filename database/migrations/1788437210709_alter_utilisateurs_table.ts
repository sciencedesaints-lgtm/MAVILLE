import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'utilisateurs'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('type_compte').defaultTo('personnel').notNullable()
      table.string('pays').nullable()
      table.string('ville').nullable()
      table.string('type_structure').nullable()
      table.string('nom_entreprise').nullable()
      table.string('domaine').nullable()
      table.string('avenue').nullable()
      table.string('numero').nullable()
      table.string('indicatif_pays').nullable()
      table.string('type_institution').nullable()
      table.string('nom_institution').nullable()
      table.string('tutelle').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns([
        'type_compte', 'pays', 'ville', 'type_structure', 
        'nom_entreprise', 'domaine', 'avenue', 'numero', 
        'indicatif_pays', 'type_institution', 'nom_institution', 'tutelle'
      ])
    })
  }
}