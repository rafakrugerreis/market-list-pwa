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
 * Pré-processa o canvas para melhorar acurácia do OCR:
 * - Escala para largura mínima de 1200px
 * - Converte para escala de cinza
 * - Binariza (limiar em 128) → texto preto sobre fundo branco
 * Ideal para etiquetas amarelas com texto preto (padrão BR).
 */
function preprocessCanvas(canvas) {
  const MIN_WIDTH = 1200;
  let sw = canvas.width;
  let sh = canvas.height;

  if (sw < MIN_WIDTH) {
    const scale = MIN_WIDTH / sw;
    sw = Math.round(sw * scale);
    sh = Math.round(sh * scale);
  }

  const out = document.createElement("canvas");
  out.width = sw;
  out.height = sh;
  const ctx = out.getContext("2d");
  ctx.drawImage(canvas, 0, 0, sw, sh);

  const imgData = ctx.getImageData(0, 0, sw, sh);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    const gray = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
    const bin = gray < 128 ? 0 : 255;
    d[i] = d[i + 1] = d[i + 2] = bin;
  }

  ctx.putImageData(imgData, 0, 0);
  return out;
}

/**
 * Escaneia uma etiqueta de produto via OCR e retorna { name, price }.
 */
export async function scanProductLabel(imageSource) {
  const input =
    imageSource instanceof HTMLCanvasElement
      ? preprocessCanvas(imageSource)
      : imageSource;

  const {
    data: { text },
  } = await Tesseract.recognize(input, "por+eng", {
    logger: (m) => console.log("[OCR]", m.status, m.progress),
    tessedit_pageseg_mode: "6",
  });

  const price = parsePrice(text);
  const name = extractName(text);

  return { name, price };
}
