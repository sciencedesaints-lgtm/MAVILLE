import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export class OtpService {
  /**
   * Génère un code OTP à 6 chiffres valide pendant 10 minutes
   */
  public static generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  /**
   * Enregistre un OTP en BDD pour un téléphone donné
   */
  public static async createOtp(telephone: string): Promise<string> {
    const code = this.generateCode()
    const expiresAt = DateTime.now().plus({ minutes: 10 }).toSQL()

    // Nettoie les anciens OTP non utilisés pour ce numéro
    await db.from('otps').where('telephone', telephone).delete()

    // Insère le nouveau code
    await db.table('otps').insert({
      telephone,
      code,
      expires_at: expiresAt,
      created_at: new Date(),
    })

    // TODO: Connecter ici le fournisseur SMS/WhatsApp (ex: Twilio, AfricasTalking)
    console.log(`[OTP DEBUG] Code pour ${telephone} : ${code}`)

    return code
  }

  /**
   * Vérifie si le code OTP fourni est valide
   */
  public static async verifyOtp(telephone: string, code: string): Promise<boolean> {
    const otpRecord = await db
      .from('otps')
      .where('telephone', telephone)
      .where('code', code)
      .where('expires_at', '>', DateTime.now().toSQL())
      .first()

    if (!otpRecord) {
      return false
    }

    // Supprime l'OTP consommé
    await db.from('otps').where('id', otpRecord.id).delete()
    return true
  }
}