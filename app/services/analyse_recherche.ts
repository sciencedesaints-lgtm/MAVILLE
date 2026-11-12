export const MOTS_VIDES = new Set([
    'je', 'j', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'me', 'moi', 'mon', 'ma', 'mes',
    'le', 'la', 'les', 'l', 'un', 'une', 'des', 'du', 'de', 'd', 'au', 'aux', 'en', 'dans', 'sur',
    'sous', 'avec', 'sans', 'pour', 'par', 'chez', 'et', 'ou', 'a', 'y', 'ce', 'cet', 'cette',
    'ces', 'qui', 'que', 'quoi', 'est', 'sont', 'suis', 'es', 'svp', 'stp', 'plait', 'merci',
    'bonjour', 'salut', 'bonsoir', 's', 'si', 'cherche', 'cherches', 'chercher', 'cherchons',
    'cherchez', 'recherche', 'rechercher', 'besoin', 'voudrais', 'voulais', 'veux', 'veut',
    'souhaite', 'trouver', 'trouve', 'aimerais', 'quelqu', 'quelquun', 'dispose', 'avez',
    'avoir', 'faut', 'ai', 'ville', 'proche', 'pres', 'ici', 'disponible',
  ])
  
  const MOTS_VENTE = new Set(['vendre', 'vente', 'vend', 'vends', 'acheter', 'achat', 'achete', 'acquerir'])
  const MOTS_LOCATION = new Set(['louer', 'location', 'loue', 'loyer', 'locat', 'louez'])
  const MARQUEURS_LIEU = new Set(['quartier', 'commune', 'avenue', 'av', 'rue', 'marche'])
  
  export const normaliser = (texte: string) =>
    texte
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  
  export const motsDe = (texte: string) =>
    normaliser(texte)
      .split(/[^a-z0-9]+/)
      .filter(Boolean)
  
  // Même normalisation côté SQL
  export const norm = (col: string) =>
    `translate(lower(coalesce(${col}, '')), 'àâäáãéèêëíìîïóòôöõúùûüçñ', 'aaaaaeeeeiiiiooooouuuucn')`
  
  export function analyser(q: string) {
    let texte = normaliser(q)
  
    const expressions: string[] = []
    texte = texte.replace(/(\d+)\s*(chambres?|pieces?|salons?|douches?)/g, (_m, n, mot) => {
      expressions.push(`${n} ${String(mot).replace(/s$/, '')}`)
      return ' '
    })
  
    const bruts = texte.split(/[^a-z0-9]+/).filter(Boolean)
    let intention: 'vente' | 'location' | null = null
    const mots: string[] = []
  
    for (let i = 0; i < bruts.length; i++) {
      const mot = bruts[i]
      if (MARQUEURS_LIEU.has(mot)) {
        i++ // on saute le nom du lieu qui suit
        continue
      }
      if (MOTS_VENTE.has(mot)) {
        intention = intention ?? 'vente'
        continue
      }
      if (MOTS_LOCATION.has(mot)) {
        intention = 'location'
        continue
      }
      if (MOTS_VIDES.has(mot) || mot.length < 2) continue
      mots.push(mot.length > 3 ? mot.replace(/[sx]$/, '') : mot)
    }
  
    return { mots: [...new Set(mots)], expressions, intention }
  }