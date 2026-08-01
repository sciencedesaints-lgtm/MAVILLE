import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {

  protected tableName = 'publicites'

  async up() {

    this.schema.createTable(this.tableName, (table) => {

      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))

      table.uuid('etablissement_id')
        .references('id')
        .inTable('etablissements')

      table.string('titre',255)

      table.text('description')

      table.string('media_url',500)

      table.enum('type_media',['IMAGE','VIDEO'])

      table.integer('duree_video').defaultTo(240)

      table.timestamp('debut_diffusion')

      table.timestamp('fin_diffusion')

      table.boolean('active').defaultTo(true)

      table.timestamps(true,true)

    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}