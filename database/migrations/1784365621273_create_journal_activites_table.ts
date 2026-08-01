import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {

  protected tableName='journal_activites'

  async up(){

    this.schema.createTable(this.tableName,(table)=>{

      table.uuid('id')
        .primary()
        .defaultTo(this.raw('uuid_generate_v4()'))

      table.uuid('utilisateur_id')
        .references('id')
        .inTable('utilisateurs')
        .onDelete('SET NULL')

      table.string('action',255).notNullable()

      table.string('table_cible',100)

      table.uuid('element_id')

      table.string('adresse_ip',100)

      table.string('navigateur',255)

      table.string('systeme',100)

      table.string('appareil',100)

      table.timestamps(true,true)

      table.index(['utilisateur_id'])
      table.index(['action'])
      table.index(['table_cible'])

    })

  }

  async down(){

    this.schema.dropTable(this.tableName)

  }

}