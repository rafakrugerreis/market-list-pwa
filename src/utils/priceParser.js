/**
 * Extrai o preço de venda de texto OCR de etiquetas de supermercado brasileiras.
 *
 * Padrões suportados:
 *   - "R$ 1,79" / "R$5.99"                  → padrão
 *   - "R$\n3,00" (R$ e número em linhas separadas)
 *   - "3,00" sem prefixo R$ (fallback)
 *
 * Filtrados (ignorados):
 *   - 3 casas decimais: "R$ 11.905" (preço/kg)
 *   - Linha com IBPT/TRIB (imposto aproximado)
 *   - Contexto QUILO / KG (preço por quilo)
 */
export function parsePrice(text) {
  const normalized = text.replace(/R\s*\$\s*\r?\n\s*/gi, "R$ ");
  const toFloat = (s) => parseFloat(s.replace(",", "."));
  const lines = normalized.split("\n");

  // ── Estratégia 1: R$ + número com EXATAMENTE 2 casas decimais ──────────
  const direct = [];
  for (let i = 0; i < lines.length; i++) {
    const prevLine = lines[i - 1] || "";
    const line = lines[i];
    const ctx = prevLine + " " + line;

    if (/IBPT|TRIB|APROX/i.test(ctx)) continue;
    if (/QUILO|\/\s*KG\b|KILO/i.test(ctx)) continue;

    const re = /R\$\s*(\d{1,4}[.,]\d{2})(?!\d)/gi;
    let m;
    while ((m = re.exec(line)) !== null) {
      const val = toFloat(m[1]);
      if (!isNaN(val) && val > 0) direct.push(val);
    }
  }

  if (direct.length > 0) {
    return Math.max(...direct);
  }

  // ── Estratégia 2: número decimal isolado (X,XX / X.XX sem R$ na frente) ─
  const standalone = [];
  const re2 = /(?<![R$\d.,])(\d{1,4}[.,]\d{2})(?!\d)/g;
  let m2;
  while ((m2 = re2.exec(normalized)) !== null) {
    const val = toFloat(m2[1]);
    if (!isNaN(val) && val > 0 && val < 9999) standalone.push(val);
  }

  if (standalone.length > 0) {
    return Math.max(...standalone);
  }

  return 0;
}
