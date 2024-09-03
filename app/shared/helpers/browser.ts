/**
 * Copy to the clipboard
 *
 * @param id Element id to apply a fallback
 * @param text Value to be copied
 */
export function copyToClipboard(id: string, text: string) {
  const fallback = (id: string) => {
    const textElement = document.getElementById(id);
    const range = document.createRange();
    const selection = window.getSelection();

    if (!textElement || !selection) return;

    selection.removeAllRanges();
    range.selectNodeContents(textElement);
    selection.addRange(range);

    try {
      document.execCommand('copy');
    } catch (error) {
      console.error('Oops, unable to copy:', error);
    }

    selection.removeAllRanges();
  };

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(error => {
      console.info('Could not copy to clipboard, trying fallback', error);

      fallback(id);
    });
  } else {
    fallback(id);
  }
}

/**
 * Share Address and QR image
 *
 * @param canvasId Element id
 * @param address Account's address
 *
 * @returns {Promise}
 */
export async function shareQrAddress(canvasId: string, address: string): Promise<void> {
  const canvasElement = document.getElementById(canvasId) as HTMLCanvasElement | null;

  if (!canvasElement || !('toDataURL' in canvasElement)) {
    throw new Error(`Element ${canvasId} is not a canvas element`);
  }

  try {
    const dataUrl = canvasElement.toDataURL();
    const blob = await (await fetch(dataUrl)).blob();

    const file = new File([blob], 'qrcode.png', {
      type: blob.type,
      lastModified: new Date().getTime(),
    });

    navigator.share({ files: [file], text: address }).catch(error => {
      console.info('Failed to share QR code with address', error);
    });
  } catch (error) {
    console.error('Error within Share API', error);
  }
}
