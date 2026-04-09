import JsBarcode from "jsbarcode";

export function generateBarcode(text: string): string {
  const canvas = document.createElement("canvas");
  
  try {
    JsBarcode(canvas, text, {
      format: "CODE128",
      width: 2,
      height: 60,
      displayValue: true,
      fontSize: 14,
      margin: 10,
      background: "#ffffff",
      lineColor: "#000000"
    });
    
    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Erreur génération code-barres:", error);
    return "";
  }
}

export function generateUniqueBarcodeId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  const uniqueId = `MADE${timestamp}${randomPart}`.toUpperCase();
  
  return uniqueId;
}