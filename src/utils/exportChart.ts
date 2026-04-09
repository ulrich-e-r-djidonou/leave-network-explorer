/**
 * Export a DOM element containing an SVG chart to a PNG file.
 * Adds a source/copyright watermark at the bottom.
 */
export function downloadChartAsPNG(
  container: HTMLElement | null,
  filename = "chart.png",
  lang: "fr" | "en" = "fr"
): void {
  if (!container) return;

  const svg = container.querySelector("svg");
  if (!svg) return;

  const watermark =
    lang === "fr"
      ? "Source : LPRN 2025 — © Ulrich Djidonou"
      : "Source: LPRN 2025 — © Ulrich Djidonou";

  const svgRect = svg.getBoundingClientRect();
  const W = Math.round(svgRect.width) || 800;
  const H = Math.round(svgRect.height) || 400;
  const PADDING = 28; // space for watermark

  // Clone SVG and set explicit dimensions
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(W));
  clone.setAttribute("height", String(H));

  // Inline computed styles for text elements so fonts render in canvas
  const texts = clone.querySelectorAll("text, tspan");
  const origTexts = svg.querySelectorAll("text, tspan");
  texts.forEach((el, i) => {
    const orig = origTexts[i];
    if (orig) {
      const cs = window.getComputedStyle(orig);
      (el as HTMLElement).style.fontFamily = cs.fontFamily || "sans-serif";
      (el as HTMLElement).style.fontSize = cs.fontSize || "12px";
      (el as HTMLElement).style.fill = cs.fill || "#334155";
    }
  });

  const svgData = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const scale = 2; // retina quality
    const canvas = document.createElement("canvas");
    canvas.width = W * scale;
    canvas.height = (H + PADDING) * scale;

    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H + PADDING);

    // Chart
    ctx.drawImage(img, 0, 0, W, H);

    // Watermark bar
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, H, W, PADDING);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(watermark, W - 8, H + 18);

    // Download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    }, "image/png");

    URL.revokeObjectURL(url);
  };
  img.onerror = () => URL.revokeObjectURL(url);
  img.src = url;
}
