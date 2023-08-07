import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { setMessage, setNotifStatus } from "../../store/feature/openAiSlice";
import { useAppDispatch, useAppSelector } from "../../store/store";
import "./Notification.css";
import Code from "../Code";
import { FormEvent, SyntheticEvent, useState } from "react";
import loading from '../../assets/img/loading.gif'

const Notification = () => {
  const { messages, isChatLoading } = useAppSelector((store) => store.openai);
  const dispatch = useAppDispatch();

  const [inputMsg, setInputMsg] = useState("");

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    setInputMsg("");
    dispatch(
      setMessage({
        with_context: true,
        message: { role: "user", content: inputMsg },
      })
    );
  };

  const handleChangeMsg = (e: FormEvent<HTMLInputElement>) => {
    setInputMsg(e.currentTarget.value);
  };

  return (
    <div className="notification-item">
      <button
        className="close-btn"
        onClick={() => dispatch(setNotifStatus({ notifStatus: false }))}
      >
        X
      </button>
      <h4>Chat to AI</h4>
      {messages.map((message, key) => (
        <div key={key}>
          {message.role === "user" ? (
            <div className="notification-user">
              <p>{message.content}</p>
            </div>
          ) : (
            <div className="notification-assistant">
              <ReactMarkdown
                children={message.content}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <Code
                        {...props}
                        children={String(children).replace(/\n$/, "")}
                        language={match[1]}
                      />
                    ) : (
                      <code {...props} className={className}>
                        {children}
                      </code>
                    );
                  },
                }}
              />
            </div>
          )}
        </div>
      ))}
      

      <div className="notification-row">
      {isChatLoading && 
        <div className="loader"></div>
      } 
        <form onSubmit={handleSubmit}>
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Send a message"
              value={inputMsg}
              onChange={handleChangeMsg}
            />
            <div className="input-group-append">
              <button className="btn btn-success" type="submit">
                Send
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Notification;
