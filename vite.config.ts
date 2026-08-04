import { defineConfig } from 'vite'
import adonisjs from '@adonisjs/vite/client'

export default defineConfig({
  plugins: [
    adonisjs({
      entrypoints: [
        /* --- Fichiers CSS --- */
        'resources/css/global.css',
        'resources/css/bienvenue.css',
        'resources/css/authentification.css',
        'resources/css/connexion.css',
        'resources/css/inscription.css',
        'resources/css/accueil.css',
        'resources/css/profil-personnel.css',
        'resources/css/profil-entreprise.css',
        'resources/css/profil-administration.css',

        /* --- Fichiers JavaScript --- */
        'resources/js/global.js',
        'resources/js/bienvenue.js',
        'resources/js/authentification.js',
        'resources/js/connexion.js',
        'resources/js/inscription.js',
        'resources/js/accueil.js',
        'resources/js/profil-personnel.js',
        'resources/js/profil-entreprise.js',
        'resources/js/profil-administration.js',
      ],
      reload: ['resources/views/**/*.edge'],
    }),
  ],
})