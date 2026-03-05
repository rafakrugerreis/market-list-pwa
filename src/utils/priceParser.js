/**
 * Extrai o primeiro preço encontrado em um texto.
 * Suporta formatos: R$ 5,99 | R$5.99 | $5,99 | 5.99
 */
export function parsePrice(text) {
  const regex = /R?\$\s?\d+[.,]\d{2}/g;
  const matches = text.match(regex);
  if (!matches || matches.length === 0) return 0;

  const raw = matches[0].replace(/R?\$\s?/, "").replace(",", ".");

  return parseFloat(raw) || 0;
}
