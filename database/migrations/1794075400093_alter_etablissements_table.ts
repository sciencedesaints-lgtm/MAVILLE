import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'etablissements'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Localisation en couches
      table.string('avenue', 150).nullable()
      table.string('numero', 30).nullable()
      table.string('repere', 255).nullable()
      table.string('marche', 150).nullable()
      table.string('emplacement', 150).nullable()

      // Type et fonctionnement du commerce
      table.string('type_commerce', 30).nullable()
      table.string('horaires', 255).nullable()
      table.string('whatsapp', 30).nullable()
      table.specificType('mobile_money', 'text[]').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('avenue')
      table.dropColumn('numero')
      table.dropColumn('repere')
      table.dropColumn('marche')
      table.dropColumn('emplacement')
      table.dropColumn('type_commerce')
      table.dropColumn('horaires')
      table.dropColumn('whatsapp')
      table.dropColumn('mobile_money')
    })
  }
}