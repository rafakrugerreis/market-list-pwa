import Tesseract from "tesseract.js";
import { parsePrice } from "../utils/priceParser.js";

export async function scanProductLabel(imageSource) {
  const {
    data: { text },
  } = await Tesseract.recognize(imageSource, "por+eng", {
    logger: (m) => console.log("[OCR]", m.status, m.progress),
  });

  const price = parsePrice(text);

  // Usa a primeira linha não-vazia como nome do produto
  const lines = text.split("\n").filter((l) => l.trim().length > 2);
  const name = lines[0]?.trim() || "";

  return { name, price };
}
