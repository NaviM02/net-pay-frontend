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
