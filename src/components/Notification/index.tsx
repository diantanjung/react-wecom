import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'
import { setNotifStatus } from "../../store/feature/openAiSlice";
import { useAppDispatch, useAppSelector } from "../../store/store";
import "./Notification.css";
import Code from "../Code";

const Notification = () => {
    const { notifText } = useAppSelector(
        (store) => store.openai
      );
    const dispatch = useAppDispatch();
    return (
        <div className="notification-item">
            <button onClick={() => dispatch(setNotifStatus({notifStatus: false}))}>X</button>
            <h4>Open AI Response</h4>
            <ReactMarkdown
                children={notifText}
                components={{
                code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                    <Code {...props} children={String(children).replace(/\n$/, '')} language={match[1]} />
                    ) : (
                    <code {...props} className={className}>
                        {children}
                    </code>
                    )
                }
                }}
            />
        </div>
    )
}

export default Notification