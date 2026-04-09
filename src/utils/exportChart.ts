import html2canvas from "html2canvas";

/**
 * Capture a DOM element as PNG and trigger download.
 * Adds a source/copyright watermark at the bottom.
 */
export async function downloadChartAsPNG(
  container: HTMLElement | null,
  filename = "chart.png",
  lang: "fr" | "en" = "fr"
): Promise<void> {
  if (!container) return;

  const watermark =
    lang === "fr"
      ? "Source : LPRN 2025 — © Ulrich Djidonou"
      : "Source: LPRN 2025 — © Ulrich Djidonou";

  try {
    const canvas = await html2canvas(container, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      logging: false,
    });

    // Add watermark strip at bottom
    const STRIP = 28;
    const final = document.createElement("canvas");
    final.width = canvas.width;
    final.height = canvas.height + STRIP * 2;

    const ctx = final.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, final.width, final.height);
    ctx.drawImage(canvas, 0, 0);

    // Watermark bar
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, canvas.height, final.width, STRIP * 2);

    ctx.fillStyle = "#94a3b8";
    ctx.font = `${11 * 2}px sans-serif`;
    ctx.textAlign = "right";
    ctx.fillText(watermark, final.width - 12, canvas.height + STRIP * 1.5);

    final.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    }, "image/png");
  } catch (e) {
    console.error("Export PNG failed:", e);
  }
}
