import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { setMessage, setNotifStatus } from "../../store/feature/openAiSlice";
import { useAppDispatch, useAppSelector } from "../../store/store";
import "./Notification.css";
import Code from "../Code";
import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  MouseEvent,
  MouseEventHandler,
  SyntheticEvent,
  useState,
} from "react";
import debounce from "lodash/debounce";
import axiosInstance from "../../helpers/axiosInstance";
import isAuthenticated from "../../utils/isAuthenticated";

interface iGetAllFiles {
  filename: string;
  isdir: boolean;
  size: number;
  path: string;
  mod_time: string;
}

const Notification = () => {
  const { messages, isChatLoading } = useAppSelector((store) => store.openai);
  const dispatch = useAppDispatch();

  const [inputMsg, setInputMsg] = useState("");
  const [attachment, setAttachment] = useState<Array<string>>([]);
  const [isTagActive, setIsTagActive] = useState(false);
  const [filepaths, setFilepaths] = useState<Array<iGetAllFiles>>([]);

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    setInputMsg("");
    dispatch(
      setMessage({
        with_context: true,
        message: { role: "user", content: inputMsg, attachments: attachment },
      })
    );
  };

  const handleChangeMsg = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputMsg(val);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    console.log("input msg", inputMsg.split("@").pop());

    if (e.key === "@") {
      setIsTagActive(true);
      fetchFilePaths("");
      console.log("load all autocomplete");
    } else {
      if (isTagActive) {
        let term = inputMsg.split("@").pop() || "";
        if (e.key === "Backspace") {
          term = term.slice(0, -1);
        } else {
          term = term + e.key;
        }
        console.log("load autocomplete", term);
        fetchFilePaths(term);
      }
    }
  };

  const fetchFilePaths = (term: string) => {
    if (isAuthenticated()) {
      const username = localStorage.username || "guest";
      const resp = axiosInstance()
        .post(
          "/getallfiles",
          JSON.stringify({
            path_str: "/home/" + username,
            term: term,
            username: username,
          })
        )
        .then((res) => {
          setFilepaths(res.data);
        })
        .catch(console.error);
    } else {
      const resp = axiosInstance()
        .post(
          "/ggetallfiles",
          JSON.stringify({
            path_str: "/home/guest",
            term: term,
            username: "guest",
          })
        )
        .then((res) => {
          setFilepaths(res.data);
        })
        .catch(console.error);
    }
  };

  const getTextFromPath = (path: string) => {
    if (isAuthenticated()) {
      const username = localStorage.username || "guest";
      const resp = axiosInstance()
        .post(
          "/opendirfile",
          JSON.stringify({
            path_str: path,
            username: username,
          })
        )
        .then((res) => {
          console.log("open file suggestion-1", res.data);
        })
        .catch(console.error);
    } else {
      const resp = axiosInstance()
        .post(
          "/gopendirfile",
          JSON.stringify({
            path_str: path,
            username: "guest",
          })
        )
        .then((res) => {
          console.log("open file suggestion-2", res.data);
          setAttachment((prev: string[]) =>{
            return [...prev, "I attach file " + res.data.filepath + " : " + res.data.file_str + ". "];
          })
        })
        .catch(console.error);
    }
  };

  const handleClickSuggestion = (e: MouseEvent<HTMLElement>) => {
    const filename = e.currentTarget.innerText.split(" ").shift();
    const filepath = e.currentTarget.innerText.split(" ").pop();
    setInputMsg((prev: string) => {
      const term = prev.split("@").pop() || "";
      const text = prev.replace(new RegExp(term + "$"), "");
      return text + filename;
    });

    setIsTagActive(false);
    if(filepath)
      getTextFromPath(filepath);
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
        {isChatLoading && <div className="loader"></div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group mb-3">
            <input
              id="msg"
              type="text"
              className="form-control"
              placeholder="Send a message"
              list="filepaths"
              value={inputMsg}
              onChange={handleChangeMsg}
              onKeyDown={handleKeyDown}
            />
            <div className="input-group-append">
              <button className="btn btn-success" type="submit">
                Send
              </button>
            </div>
            {isTagActive && (
              <ul className="suggestions">
                {filepaths.map((filepath, idx) => (
                  <li key={idx}>
                    <a
                      onClick={handleClickSuggestion}
                      data-filename={filepath.filename}
                      data-path={filepath.path}
                    >
                      <b>{filepath.filename}</b> {filepath.path}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Notification;
