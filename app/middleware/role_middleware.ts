import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { Roles } from '../enums/roles.js'
import Utilisateur from '#models/utilisateur'

export default class RoleMiddleware {
  public async handle(
    ctx: HttpContext,
    next: NextFn,
    options: { roles: Roles[] }
  ) {
    const user = ctx.auth.user as Utilisateur | undefined

    if (!user) {
      return ctx.response.unauthorized({ message: 'Authentification requise' })
    }

    // Charger les rôles de l'utilisateur connecté
    await user.load('roles')
    const userRoles = user.roles.map((r: any) => r.nom as Roles)

    // Un ADMIN a un accès global
    if (userRoles.includes(Roles.ADMIN)) {
      return next()
    }

    // Vérifier si au moins un des rôles correspond
    const hasRole = options.roles.some((role) => userRoles.includes(role))

    if (!hasRole) {
      return ctx.response.forbidden({
        message: 'Accès refusé : vous ne possédez pas les privilèges requis.',
      })
    }

    return next()
  }
}