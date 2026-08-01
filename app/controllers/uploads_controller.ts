import { MediaService } from '#services/media_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class UploadsController {
  /**
   * Upload d'une image (profil, établissement, produit, etc.)
   * POST /api/v1/uploads/image
   */
  public async uploadImage({ request, response }: HttpContext) {
    const image = request.file('image', {
      size: '5mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })

    if (!image) {
      return response.badRequest({ message: 'Aucun fichier image n’a été fourni' })
    }

    if (!image.isValid) {
      return response.badRequest({ errors: image.errors })
    }

    const folder = request.input('folder', 'general')

    try {
      const url = await MediaService.uploadImage(image, folder)
      return response.ok({
        message: 'Image téléchargée avec succès',
        url,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de l’upload'
      return response.internalServerError({ message })
    }
  }

  /**
   * Upload d'une vidéo (présentation établissement / publicité)
   * POST /api/v1/uploads/video
   */
  public async uploadVideo({ request, response }: HttpContext) {
    const video = request.file('video', {
      size: '50mb',
      extnames: ['mp4', 'mov', 'webm'],
    })

    if (!video) {
      return response.badRequest({ message: 'Aucun fichier vidéo n’a été fourni' })
    }

    if (!video.isValid) {
      return response.badRequest({ errors: video.errors })
    }

    try {
      const url = await MediaService.uploadVideo(video, 'videos')
      return response.ok({
        message: 'Vidéo téléchargée avec succès',
        url,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de l’upload'
      return response.internalServerError({ message })
    }
  }
}