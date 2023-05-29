import { useState, useRef, useEffect } from "react";
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { Extension } from "@codemirror/state";

export default function useCodeMirror(extensions: Extension[]) {
  const ref = useRef<HTMLElement>(null);
  const [view, setView] = useState<EditorView>();

  useEffect(() => {
    const view = new EditorView({
      extensions: [
        basicSetup,
        /**
         * Check each language package to see what they support,
         * for instance javascript can use typescript and jsx.
         */
        javascript({
          jsx: true,
          typescript: true,
        }),
        ...extensions,
      ],
      parent: ref.current? ref.current : undefined,
    });

    setView(view);

    /**
     * Make sure to destroy the codemirror instance
     * when our components are unmounted.
     */
    return () => {
      view.destroy();
      setView(undefined);
    };
  }, []);

  return { ref, view };
}