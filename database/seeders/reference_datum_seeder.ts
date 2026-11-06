import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    // 1. Continents
    await db
      .table('continents')
      .insert([
        { nom: 'Afrique', code: 'AF' },
        { nom: 'Europe', code: 'EU' },
      ])
      .onConflict('code')
      .ignore()

    const afrique = await db.from('continents').where('code', 'AF').firstOrFail()
    const europe = await db.from('continents').where('code', 'EU').firstOrFail()

    // 2. Pays
    await db
      .table('pays')
      .insert([
        { continent_id: afrique.id, nom: 'RDC', code_iso2: 'CD', code_iso3: 'COD', devise: 'CDF', symbole_devise: 'FC', indicatif_telephonique: '+243', langue_principale: 'Français', fuseau_horaire: 'Africa/Lubumbashi' },
        { continent_id: afrique.id, nom: 'Zambie', code_iso2: 'ZM', code_iso3: 'ZMB', devise: 'ZMW', symbole_devise: 'ZK', indicatif_telephonique: '+260', langue_principale: 'Anglais', fuseau_horaire: 'Africa/Lusaka' },
        { continent_id: afrique.id, nom: 'Angola', code_iso2: 'AO', code_iso3: 'AGO', devise: 'AOA', symbole_devise: 'Kz', indicatif_telephonique: '+244', langue_principale: 'Portugais', fuseau_horaire: 'Africa/Luanda' },
        { continent_id: afrique.id, nom: 'Congo-Brazzaville', code_iso2: 'CG', code_iso3: 'COG', devise: 'XAF', symbole_devise: 'FCFA', indicatif_telephonique: '+242', langue_principale: 'Français', fuseau_horaire: 'Africa/Brazzaville' },
        { continent_id: europe.id, nom: 'France', code_iso2: 'FR', code_iso3: 'FRA', devise: 'EUR', symbole_devise: '€', indicatif_telephonique: '+33', langue_principale: 'Français', fuseau_horaire: 'Europe/Paris' },
      ])
      .onConflict('code_iso2')
      .ignore()

    // 3. Villes (la table n'a pas de contrainte d'unicité : on vérifie nous-mêmes)
    const villesParPays: Record<string, [string, number, number][]> = {
      CD: [
        ['Lubumbashi', -11.66, 27.48], ['Kinshasa', -4.44, 15.27], ['Kolwezi', -10.71, 25.47],
        ['Likasi', -10.98, 26.74], ['Goma', -1.68, 29.22], ['Bukavu', -2.51, 28.86],
        ['Kisangani', 0.52, 25.19], ['Matadi', -5.82, 13.46],
      ],
      ZM: [['Lusaka', -15.39, 28.32], ['Ndola', -12.97, 28.64], ['Kitwe', -12.8, 28.21], ['Livingstone', -17.84, 25.85]],
      AO: [['Luanda', -8.84, 13.23], ['Lubango', -14.92, 13.49], ['Benguela', -12.58, 13.41], ['Cabinda', -5.56, 12.2]],
      CG: [['Brazzaville', -4.27, 15.28], ['Pointe-Noire', -4.78, 11.86], ['Dolisie', -4.2, 12.67]],
      FR: [['Paris', 48.86, 2.35], ['Lyon', 45.76, 4.84], ['Marseille', 43.3, 5.37], ['Bordeaux', 44.84, -0.58], ['Toulouse', 43.6, 1.44]],
    }

    for (const [codeIso2, villes] of Object.entries(villesParPays)) {
      const pays = await db.from('pays').where('code_iso2', codeIso2).firstOrFail()
      for (const [nom, latitude, longitude] of villes) {
        const existe = await db.from('villes').where('pays_id', pays.id).where('nom', nom).first()
        if (!existe) {
          await db.table('villes').insert({ pays_id: pays.id, nom, latitude, longitude })
        }
      }
    }

    // 4. Catégories de services
    const categories = [
      ['Animaux et chiens', 'animaux-chiens', '🐕'],
      ['Immobilier', 'immobilier', '🏠'],
      ['Plomberie', 'plomberie', '🔧'],
      ['Électricité', 'electricite', '💡'],
      ['Transport et livraison', 'transport-livraison', '🚚'],
      ['Beauté et coiffure', 'beaute-coiffure', '💇'],
      ['Éducation et cours', 'education-cours', '🎓'],
      ['Informatique', 'informatique', '💻'],
    ]

    let ordre = 1
    for (const [nom, slug, icone] of categories) {
      const existe = await db.from('categories_services').where('slug', slug).first()
      if (!existe) {
        await db.table('categories_services').insert({
          nom,
          slug,
          icone,
          active: true,
          ordre_affichage: ordre,
          est_populaire: false,
        })
      }
      ordre++
    }
  }
}