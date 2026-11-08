import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    // [nom, slug, icône, populaire]
    const categories: [string, string, string, boolean][] = [
      // Immobilier
      ['Parcelles et terrains', 'parcelles-terrains', '🏞️', true],
      ['Maisons et appartements', 'maisons-appartements', '🏠', true],
      ['Bureaux et locaux commerciaux', 'bureaux-locaux', '🏢', false],

      // Véhicules
      ['Voitures', 'voitures', '🚗', true],
      ['Motos et vélos', 'motos-velos', '🏍️', true],
      ['Camions et engins', 'camions-engins', '🚛', false],
      ['Pièces et accessoires auto', 'pieces-auto', '🔧', false],

      // Maison
      ['Meubles et décoration', 'meubles-decoration', '🛋️', true],
      ['Électroménager', 'electromenager', '🧊', true],
      ['Ustensiles et vaisselle', 'ustensiles-vaisselle', '🍳', false],

      // Électronique
      ['Téléphones et tablettes', 'telephones-tablettes', '📱', true],
      ['Ordinateurs et informatique', 'ordinateurs', '💻', true],
      ['TV, audio et photo', 'tv-audio-photo', '📺', false],
      ['Groupes électrogènes et solaire', 'groupes-solaire', '🔋', false],

      // Personnel
      ['Vêtements et chaussures', 'vetements-chaussures', '👕', false],
      ['Bijoux et accessoires', 'bijoux-accessoires', '💍', false],
      ['Bébé et enfants', 'bebe-enfants', '🧸', false],

      // Divers
      ['Animaux', 'animaux', '🐕', true],
      ['Matériel professionnel et outils', 'materiel-professionnel', '🛠️', false],
      ['Matériaux de construction', 'materiaux-construction', '🧱', false],
      ['Agriculture et élevage', 'agriculture-elevage', '🌾', false],
      ['Livres et fournitures scolaires', 'livres-fournitures', '📚', false],
      ['Sport et loisirs', 'sport-loisirs', '⚽', false],
      ['Instruments de musique', 'instruments-musique', '🎸', false],
      ['Autres', 'autres-annonces', '➕', false],
    ]

    let ordre = 1
    for (const [nom, slug, icone, populaire] of categories) {
      const existe = await db.from('categories_produits').where('slug', slug).first()
      if (!existe) {
        await db.table('categories_produits').insert({
          nom,
          slug,
          icone,
          active: true,
          ordre_affichage: ordre,
          est_populaire: populaire,
        })
      }
      ordre++
    }
  }
}