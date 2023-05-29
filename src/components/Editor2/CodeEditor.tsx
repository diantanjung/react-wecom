import useCodeEditor from "./use-code-editor";
import { ViewUpdate } from "@codemirror/view";
import { Extension } from "@codemirror/state";


type CodeEditorProps = {
    value: string
    onChange: (value: string, viewUpdate: ViewUpdate) => void
    extensions: Extension[]
};

export default function CodeEditor({ value, onChange, extensions }: CodeEditorProps) {
  const ref = useCodeEditor({ value, onChange, extensions });

  return <section ref={ref} />;
}