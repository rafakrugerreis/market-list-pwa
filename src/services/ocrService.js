import Tesseract from "tesseract.js";
import { parsePrice } from "../utils/priceParser.js";

/**
 * Padrões que indicam que uma linha NÃO é o nome do produto.
 */
const NOISE_LINE = [
  /^\s*[\d\s\-\.]{6,}\s*$/,
  /\b(IBPT|TRIB|VL\.?\s*APROX)\b/i, 
  /\b(QUILO|KG\b|\/KG|KILO)\b/i, 
  /\bmm\b/i, 
  /^R\$\s*[\d.,]+$/, 
  /^[0-9 ]{8,}$/, 
];

/**
 * Extrai o nome do produto do texto OCR.
 * Preferência por linhas em CAIXA ALTA (padrão nas etiquetas brasileiras).
 */
function extractName(text) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  const meaningful = lines.filter((line) => {
    if (NOISE_LINE.some((re) => re.test(line))) return false;
    const digits = (line.match(/\d/g) || []).length;
    if (digits / line.length > 0.6) return false;
    const letters = (line.match(/[a-zA-Z]/g) || []).length;
    return letters >= 2;
  });

  if (meaningful.length === 0) return lines[0]?.trim() || "";

  const upperLines = meaningful.filter((l) => {
    const letters = l.match(/[a-zA-Z]/g) || [];
    const upper = l.match(/[A-Z]/g) || [];
    return letters.length >= 3 && upper.length / letters.length >= 0.65;
  });

  const best = upperLines[0] || meaningful[0];

  return best
    .replace(/[^\w\s\-çãõáéíóúâêîôûàèìòùü]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Escaneia uma etiqueta de produto via OCR e retorna { name, price }.
 */
export async function scanProductLabel(imageSource) {
  const {
    data: { text },
  } = await Tesseract.recognize(imageSource, "por+eng", {
    logger: (m) => console.log("[OCR]", m.status, m.progress),
  });

  console.log("[OCR] Texto bruto:\n", text);

  const price = parsePrice(text);
  const name = extractName(text);

  return { name, price };
}
