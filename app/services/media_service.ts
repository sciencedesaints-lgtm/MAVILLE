import { MultipartFile } from '@adonisjs/core/bodyparser'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import { randomUUID } from 'node:crypto'

export class MediaService {
  /**
   * Enregistre une image sur le disque et retourne son chemin d'accès public
   */
  public static async uploadImage(file: MultipartFile, folder: string = 'general'): Promise<string> {
    const fileName = `${randomUUID()}.${file.extname}`

    await file.move(app.makePath(`public/uploads/${folder}`), {
      name: fileName,
      overwrite: true,
    })

    if (!file.isValid) {
      throw new Error(file.errors[0]?.message || "Échec du téléchargement de l'image")
    }

    return `/uploads/${folder}/${fileName}`
  }

  /**
   * Enregistre une vidéo courte (jusqu'à 4 min / ~50 Mo)
   */
  public static async uploadVideo(file: MultipartFile, folder: string = 'videos'): Promise<string> {
    const fileName = `${randomUUID()}.${file.extname}`

    await file.move(app.makePath(`public/uploads/${folder}`), {
      name: fileName,
      overwrite: true,
    })

    if (!file.isValid) {
      throw new Error(file.errors[0]?.message || "Échec du téléchargement de la vidéo")
    }

    return `/uploads/${folder}/${fileName}`
  }

  /**
   * Enregistre jusqu'à 5 fichiers (images ou vidéos) pour une offre
   * et les rattache à celle-ci dans la table offres_medias.
   */
  public static async enregistrerPourOffre(
    typeOffre: 'service' | 'commerce' | 'annonce',
    offreId: string,
    fichiers: MultipartFile[]
  ) {
    let ordre = 0
    for (const fichier of fichiers.slice(0, 5)) {
      // Fichier refusé par les règles de validation : on ne l'écrit pas
      if (!fichier.isValid) continue

      const estVideo = ['mp4', 'webm', 'mov'].includes(String(fichier.extname))

      let url: string
      try {
        url = estVideo
          ? await this.uploadVideo(fichier, 'offres')
          : await this.uploadImage(fichier, 'offres')
      } catch {
        continue
      }

      await db.table('offres_medias').insert({
        type_offre: typeOffre,
        offre_id: offreId,
        type: estVideo ? 'video' : 'image',
        url,
        ordre: ordre++,
      })
    }
  }
}