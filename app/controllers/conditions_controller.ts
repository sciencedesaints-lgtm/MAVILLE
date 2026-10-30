import type { HttpContext } from '@adonisjs/core/http'

export default class ConditionsController {
  // Affiche la page des conditions
  async show({ view }: HttpContext) {
    return view.render('pages/conditions')
  }

  // Reçoit la case cochée (pour l'instant, on redirige juste vers l'accueil)
  async accept({ request, response }: HttpContext) {
    if (!request.input('accepte')) {
      return response.redirect().back()
    }

    return response.redirect().toRoute('web.accueil')
  }
}