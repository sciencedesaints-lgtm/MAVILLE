import app from '@adonisjs/core/services/app'
import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: 'pg',

  prettyPrintDebugQueries: true,

  connections: {
    pg: {
      client: 'pg',

      connection: {
        host: env.get('PG_HOST'),
        port: Number(env.get('PG_PORT')),
        user: env.get('PG_USER'),
        password: env.get('PG_PASSWORD'),
        database: env.get('PG_DB_NAME'),
      },

      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },

      debug: app.inDev,
    },
  },
})

export default dbConfig