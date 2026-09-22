/**
 * Opens a blob in a new browser tab. The object URL is revoked right after the
 * tab had the chance to load it.
 */
export function openBlobInNewTab(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const opened = window.open(url, '_blank');

  if (!opened) {
    window.location.href = url;
  }

  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Triggers a browser download for the given blob. */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/**
 * File name advertised by a `Content-Disposition` response header, e.g.
 * `attachment; filename="reporte-clientes-en-mora.csv"`. Falls back to the given
 * name when the header is missing or malformed.
 */
export function getFileNameFromDisposition(
  contentDisposition: string | null | undefined,
  fallback: string,
): string {
  const match = contentDisposition?.match(/filename\*?=(?:UTF-8'')?([^";]+)"?/i);
  return match?.[1]?.trim() || fallback;
}
