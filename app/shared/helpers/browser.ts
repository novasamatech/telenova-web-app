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
