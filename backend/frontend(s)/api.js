
const BAS_URL = '/api';

async function anropa(vag, metod = 'GET', kropp) {
  const svar = await fetch(`${BAS_URL}${vag}`, {
    method: metod,
    headers: kropp ? { 'Content-Type': 'application/json' } : undefined,
    credentials: 'include', // skickar med inloggningen (sessions-cookien)
    body: kropp ? JSON.stringify(kropp) : undefined,
  });

  const data = await svar.json().catch(() => ({}));
  if (!svar.ok) {
    const fel = new Error(data.error || 'Något gick fel, försök igen');
    fel.status = svar.status;
    throw fel;
  }
  return data;
}

// Skapa konto
export const registrera = (fornamn, epost, losenord) =>
  anropa('/register', 'POST', { firstName: fornamn, email: epost, password: losenord });

// Logga in
export const loggaIn = (epost, losenord) =>
  anropa('/login', 'POST', { email: epost, password: losenord });
export const loggaUt = () => anropa('/logout', 'DELETE');
export const vemArInloggad = () => anropa('/me');

// Mina bokningar
export const hamtaMinaBokningar = () => anropa('/my-bookings');

// Avboka
export const avboka = (bokningsnummer) =>
  anropa(`/my-bookings/${encodeURIComponent(bokningsnummer)}`, 'DELETE');
