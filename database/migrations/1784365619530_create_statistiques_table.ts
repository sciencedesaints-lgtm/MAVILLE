import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {

  protected tableName='statistiques'

  async up(){

    this.schema.createTable(this.tableName,(table)=>{

      table.uuid('id')
        .primary()
        .defaultTo(this.raw('uuid_generate_v4()'))

      table.string('categorie',100).notNullable()

      table.string('nom',255).notNullable()

      table.decimal('valeur',18,2).defaultTo(0)

      table.string('periode',30)

      table.timestamp('date_statistique')
        .defaultTo(this.now())

      table.timestamps(true,true)

      table.index(['categorie'])
      table.index(['nom'])
      table.index(['periode'])

    })

  }

  async down(){

    this.schema.dropTable(this.tableName)

  }

}