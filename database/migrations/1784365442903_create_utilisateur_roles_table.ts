import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'utilisateur_roles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .uuid('utilisateur_id')
        .notNullable()
        .references('id')
        .inTable('utilisateurs')
        .onDelete('CASCADE')

      table
        .integer('role_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('roles')
        .onDelete('CASCADE')

      table.timestamp('created_at').defaultTo(this.now())

      table.primary(['utilisateur_id', 'role_id'])

      table.index(['utilisateur_id'])
      table.index(['role_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}