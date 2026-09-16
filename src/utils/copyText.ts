export async function copyPlainText(text: string): Promise<void> {
  if (!!navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch  {
      console.warn("Main copy method failed.");
    }
  }

  const textarea = document.createElement("textarea");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.opacity = "0";
  textarea.style.width = "1px";
  textarea.style.height = "1px";
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.focus({ preventScroll: true });
  textarea.select();

  try {
    const success = document.execCommand("copy");
    if (!success) throw new Error("ExecCommand returned false.");
  } catch (error) {
    throw new Error(`Fallback copy method failed. ${(error as Error).message}`);
  } finally {
    document.body.removeChild(textarea);
  }
}

export async function copyRichText(htmlText: string, plainText: string): Promise<void> {
  if (!!navigator?.clipboard?.write && typeof ClipboardItem !== "undefined") {
    try {
      const item = new ClipboardItem({
        'text/html': new Blob([htmlText], { type: 'text/html' }),
        'text/plain': new Blob([plainText], { type: 'text/plain' }),
      });
      await navigator.clipboard.write([item]);
      return;
    } catch {
      console.warn("Main copy method failed.");
    }
  }

  const copyHandler = (event: ClipboardEvent) => {
    event.preventDefault();
    if (event.clipboardData) {
      event.clipboardData.setData("text/html", htmlText);
      event.clipboardData.setData("text/plain", plainText);
    }
  };
  document.addEventListener("copy", copyHandler);

  try {
    const success = document.execCommand("copy");
    if (!success) throw new Error("ExecCommand returned false.");
  } catch (error) {
    throw new Error(`Fallback copy method failed. ${(error as Error).message}`);
  } finally {
    document.removeEventListener("copy", copyHandler);
  }
}
