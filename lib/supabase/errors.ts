const errorMap: Record<string, string> = {
  'Invalid login credentials': 'Pogrešan email ili lozinka.',
  'Email not confirmed': 'Email adresa nije potvrđena. Proverite inbox.',
  'User already registered': 'Nalog sa ovim emailom već postoji.',
  'Password should be at least 6 characters': 'Lozinka mora imati najmanje 6 karaktera.',
  'Unable to validate email address: invalid format': 'Email adresa nije ispravna.',
  'Email rate limit exceeded': 'Previše pokušaja. Sačekajte nekoliko minuta.',
  'signup_disabled': 'Registracija trenutno nije moguća.',
  'over_email_send_rate_limit': 'Previše pokušaja. Sačekajte nekoliko minuta.',
}

export function translateAuthError(message: string): string {
  for (const [key, translation] of Object.entries(errorMap)) {
    if (message.includes(key)) return translation
  }
  return 'Došlo je do greške. Pokušajte ponovo.'
}
