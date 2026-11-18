// Lecture d'un CSV : séparateur ; ou , détecté, guillemets gérés
export function lireCsv(contenu: string): string[][] {
    const t = contenu.replace(/^\uFEFF/, '')
    const premiere = t.split(/\r?\n/)[0] ?? ''
    const sep = (premiere.match(/;/g) ?? []).length >= (premiere.match(/,/g) ?? []).length ? ';' : ','
    const lignes: string[][] = []
    let ligne: string[] = []
    let champ = ''
    let guillemets = false
  
    for (let i = 0; i < t.length; i++) {
      const c = t[i]
      if (guillemets) {
        if (c === '"') {
          if (t[i + 1] === '"') {
            champ += '"'
            i++
          } else {
            guillemets = false
          }
        } else {
          champ += c
        }
      } else if (c === '"') {
        guillemets = true
      } else if (c === sep) {
        ligne.push(champ)
        champ = ''
      } else if (c === '\n' || c === '\r') {
        if (c === '\r' && t[i + 1] === '\n') i++
        ligne.push(champ)
        champ = ''
        if (ligne.some((x) => x.trim() !== '')) lignes.push(ligne)
        ligne = []
      } else {
        champ += c
      }
    }
    ligne.push(champ)
    if (ligne.some((x) => x.trim() !== '')) lignes.push(ligne)
    return lignes
  }