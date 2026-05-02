export interface ZipEntry {
  name: string;
  blob: Blob;
}

export async function buildZip(entries: ZipEntry[]): Promise<Blob> {
  // 동적 import — Tab 1만 쓰는 사용자에게 번들 부과 회피 (SPEC §6.2)
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  for (const e of entries) {
    zip.file(e.name, e.blob);
  }
  return zip.generateAsync({ type: 'blob' });
}

export function timestampForFilename(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${now.getFullYear()}` +
    `${pad(now.getMonth() + 1)}` +
    `${pad(now.getDate())}-` +
    `${pad(now.getHours())}` +
    `${pad(now.getMinutes())}`
  );
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // 다운로드 시작 후 URL 해제 — 즉시 해제하면 일부 브라우저에서 다운로드 실패
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
