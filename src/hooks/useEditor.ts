import { useRef } from "react";
import { editorViewCtx, serializerCtx, type Editor } from "@milkdown/kit/core";
import { DOMSerializer } from "@milkdown/kit/prose/model";
import { copyPlainText, copyRichText } from "@/src/utils/copyText";

export function useEditor() {
  const editorRef = useRef<Editor | null>(null);

  const setEditor = (editor: Editor | null) => {
    editorRef.current = editor;
  };

  const copyAsPlainText = async () => {
    const editor = editorRef.current;
    if (!editor) return;

    let plainText = "";
    editor.action((ctx) => {
      const view = ctx.get(editorViewCtx);
      const serializer = ctx.get(serializerCtx);
      plainText = serializer(view.state.doc);
    });

    try {
      await copyPlainText(plainText);
    } catch (error) {
      throw error;
    }
  };

  const copyAsRichText = async () => {
    const editor = editorRef.current;
    if (!editor) return;

    let htmlText = "";
    let plainText = "";

    editor.action((ctx) => {
      const view = ctx.get(editorViewCtx);
      const { state } = view;

      let container: HTMLDivElement | null = document.createElement('div');
      const contentNode = state.doc.content;
      const fragment = DOMSerializer.fromSchema(state.schema).serializeFragment(contentNode);
      container.appendChild(fragment);

      htmlText = container.innerHTML;
      plainText = container.innerText || container.textContent || '';

      container.replaceChildren();
      container = null;
    });

    try {
      await copyRichText(htmlText, plainText)
    } catch (error) {
      throw error;
    }
  };

  return {
    editorRef,
    setEditor,
    copyAsPlainText,
    copyAsRichText,
  };
}
