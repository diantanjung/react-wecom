import Editor from "@monaco-editor/react";

const EditorSection = () => {

    return (
            <Editor
                height="90%"
                theme="vs-dark"
                defaultLanguage="go"
            />
    )
}

export default EditorSection