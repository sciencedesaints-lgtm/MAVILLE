import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'web.session.store': { paramsTuple?: []; params?: {} }
    'web.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'etablissements.index': { paramsTuple?: []; params?: {} }
    'etablissements.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'produits.index': { paramsTuple?: []; params?: {} }
    'produits.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'ai.search': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
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
    'home': { paramsTuple?: []; params?: {} }
    'etablissements.index': { paramsTuple?: []; params?: {} }
    'etablissements.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'produits.index': { paramsTuple?: []; params?: {} }
    'produits.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'commandes.index': { paramsTuple?: []; params?: {} }
    'demandes_services.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'etablissements.index': { paramsTuple?: []; params?: {} }
    'etablissements.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'produits.index': { paramsTuple?: []; params?: {} }
    'produits.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'commandes.index': { paramsTuple?: []; params?: {} }
    'demandes_services.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'web.session.store': { paramsTuple?: []; params?: {} }
    'web.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'ai.search': { paramsTuple?: []; params?: {} }
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
  PUT: {
    'etablissements.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'produits.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'commandes.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'demandes_services.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}