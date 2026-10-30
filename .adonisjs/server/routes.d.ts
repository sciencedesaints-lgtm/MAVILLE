import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'web.bienvenue': { paramsTuple?: []; params?: {} }
    'web.authentification': { paramsTuple?: []; params?: {} }
    'web.connexion': { paramsTuple?: []; params?: {} }
    'web.inscription': { paramsTuple?: []; params?: {} }
    'web.accueil': { paramsTuple?: []; params?: {} }
    'web.login.form': { paramsTuple?: []; params?: {} }
    'web.actualite': { paramsTuple?: []; params?: {} }
    'web.actualite.create': { paramsTuple?: []; params?: {} }
    'web.actualite.store': { paramsTuple?: []; params?: {} }
    'web.recherche': { paramsTuple?: []; params?: {} }
    'notifications.index': { paramsTuple?: []; params?: {} }
    'web.profil': { paramsTuple?: []; params?: {} }
    'profil.personnel': { paramsTuple?: []; params?: {} }
    'profil.entreprise': { paramsTuple?: []; params?: {} }
    'profil.administration': { paramsTuple?: []; params?: {} }
    'web.conditions': { paramsTuple?: []; params?: {} }
    'web.conditions.accept': { paramsTuple?: []; params?: {} }
    'web.session.store': { paramsTuple?: []; params?: {} }
    'web.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'auth.google': { paramsTuple?: []; params?: {} }
    'auth.google.callback': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'etablissements.index': { paramsTuple?: []; params?: {} }
    'etablissements.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'produits.index': { paramsTuple?: []; params?: {} }
    'produits.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.ai.search': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'api.profil.avatar': { paramsTuple?: []; params?: {} }
    'api.recherches.store': { paramsTuple?: []; params?: {} }
    'api.notifications.repondre': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'uploads.upload_image': { paramsTuple?: []; params?: {} }
    'uploads.upload_video': { paramsTuple?: []; params?: {} }
    'etablissements.store': { paramsTuple?: []; params?: {} }
    'etablissements.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'produits.store': { paramsTuple?: []; params?: {} }
    'produits.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'commandes.index': { paramsTuple?: []; params?: {} }
    'commandes.store': { paramsTuple?: []; params?: {} }
    'commandes.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'demandes_services.index': { paramsTuple?: []; params?: {} }
    'demandes_services.store': { paramsTuple?: []; params?: {} }
    'demandes_services.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'web.bienvenue': { paramsTuple?: []; params?: {} }
    'web.authentification': { paramsTuple?: []; params?: {} }
    'web.connexion': { paramsTuple?: []; params?: {} }
    'web.inscription': { paramsTuple?: []; params?: {} }
    'web.accueil': { paramsTuple?: []; params?: {} }
    'web.login.form': { paramsTuple?: []; params?: {} }
    'web.actualite': { paramsTuple?: []; params?: {} }
    'web.actualite.create': { paramsTuple?: []; params?: {} }
    'web.recherche': { paramsTuple?: []; params?: {} }
    'notifications.index': { paramsTuple?: []; params?: {} }
    'web.profil': { paramsTuple?: []; params?: {} }
    'profil.personnel': { paramsTuple?: []; params?: {} }
    'profil.entreprise': { paramsTuple?: []; params?: {} }
    'profil.administration': { paramsTuple?: []; params?: {} }
    'web.conditions': { paramsTuple?: []; params?: {} }
    'auth.google': { paramsTuple?: []; params?: {} }
    'auth.google.callback': { paramsTuple?: []; params?: {} }
    'etablissements.index': { paramsTuple?: []; params?: {} }
    'etablissements.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'produits.index': { paramsTuple?: []; params?: {} }
    'produits.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'commandes.index': { paramsTuple?: []; params?: {} }
    'demandes_services.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'web.bienvenue': { paramsTuple?: []; params?: {} }
    'web.authentification': { paramsTuple?: []; params?: {} }
    'web.connexion': { paramsTuple?: []; params?: {} }
    'web.inscription': { paramsTuple?: []; params?: {} }
    'web.accueil': { paramsTuple?: []; params?: {} }
    'web.login.form': { paramsTuple?: []; params?: {} }
    'web.actualite': { paramsTuple?: []; params?: {} }
    'web.actualite.create': { paramsTuple?: []; params?: {} }
    'web.recherche': { paramsTuple?: []; params?: {} }
    'notifications.index': { paramsTuple?: []; params?: {} }
    'web.profil': { paramsTuple?: []; params?: {} }
    'profil.personnel': { paramsTuple?: []; params?: {} }
    'profil.entreprise': { paramsTuple?: []; params?: {} }
    'profil.administration': { paramsTuple?: []; params?: {} }
    'web.conditions': { paramsTuple?: []; params?: {} }
    'auth.google': { paramsTuple?: []; params?: {} }
    'auth.google.callback': { paramsTuple?: []; params?: {} }
    'etablissements.index': { paramsTuple?: []; params?: {} }
    'etablissements.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'produits.index': { paramsTuple?: []; params?: {} }
    'produits.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'commandes.index': { paramsTuple?: []; params?: {} }
    'demandes_services.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'web.actualite.store': { paramsTuple?: []; params?: {} }
    'web.conditions.accept': { paramsTuple?: []; params?: {} }
    'web.session.store': { paramsTuple?: []; params?: {} }
    'web.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'api.ai.search': { paramsTuple?: []; params?: {} }
    'api.profil.avatar': { paramsTuple?: []; params?: {} }
    'api.recherches.store': { paramsTuple?: []; params?: {} }
    'uploads.upload_image': { paramsTuple?: []; params?: {} }
    'uploads.upload_video': { paramsTuple?: []; params?: {} }
    'etablissements.store': { paramsTuple?: []; params?: {} }
    'produits.store': { paramsTuple?: []; params?: {} }
    'commandes.store': { paramsTuple?: []; params?: {} }
    'demandes_services.store': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
  PATCH: {
    'api.notifications.repondre': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'commandes.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'demandes_services.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'etablissements.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'produits.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}