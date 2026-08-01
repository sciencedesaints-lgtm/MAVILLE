import { MultipartFile } from '@adonisjs/core/bodyparser'
import app from '@adonisjs/core/services/app'
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
}