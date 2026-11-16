import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    const entreprises = [
      'Supermarché et grande surface', 'Alimentation générale', 'Vêtements et mode', 'Chaussures et accessoires',
      'Électronique et informatique', 'Téléphonie et accessoires', 'Matériaux de construction', 'Quincaillerie',
      'Pharmacie et produits de santé', 'Cosmétiques et beauté', 'Meubles et décoration', 'Électroménager',
      'Pièces et accessoires automobiles', 'Agriculture et élevage', 'Boulangerie et pâtisserie', 'Restauration et traiteur',
      'Hôtellerie et hébergement', 'Transport et logistique', 'Immobilier', 'Banque et microfinance',
      'Assurance', 'Imprimerie et papeterie', 'Communication et marketing', 'Bâtiment et travaux publics',
      'Mines et services miniers', 'Énergie et solaire', 'Éducation et formation', 'Santé et cliniques',
      'Services informatiques', 'Autre activité commerciale',
    ]
    const administrations = [
      "État civil (naissance, mariage, décès)", "Identification et cartes d'identité", 'Fiscalité et impôts',
      'Douanes et migration', 'Urbanisme et cadastre', 'Titres fonciers et immobiliers', 'Permis et autorisations',
      'Registre du commerce', 'Sécurité et police', 'Santé publique', 'Éducation et enseignement',
      'Voirie et assainissement', 'Eau et électricité', 'Transport et circulation', 'Justice et tribunaux',
      'Emploi et affaires sociales', 'Environnement', 'Autre service public',
    ]

    const slug = (t: string) =>
      t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const lignes = [
      ...entreprises.map((nom, i) => ({ type_compte: 'entreprise_agence', nom, slug: 'e-' + slug(nom), ordre: i + 1 })),
      ...administrations.map((nom, i) => ({ type_compte: 'administration_publique', nom, slug: 'a-' + slug(nom), ordre: i + 1 })),
    ]
    await db.table('activites').insert(lignes).onConflict('slug').ignore()
  }
}