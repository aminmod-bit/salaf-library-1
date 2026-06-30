export function downloadFile(url: string | undefined, filename?: string) {
  if (!url) {
    alert('Файл книги пока не добавлен.');
    return;
  }

  // Absolute URL or starts with http
  if (url.startsWith('http://') || url.startsWith('https://')) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  // Local file — create download link
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || url.split('/').pop() || 'book';
  a.click();
}

export function openOnline(url: string | undefined) {
  if (!url) {
    alert('Файл книги пока не добавлен.');
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}
