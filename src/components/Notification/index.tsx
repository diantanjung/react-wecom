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
import { addFileItem } from "../../store/feature/filetabSlice";
import { log } from "console";

interface iGetAllFiles {
  filename: string;
  isdir: boolean;
  size: number;
  path: string;
  mod_time: string;
}

interface iAttachment {
  message: string;
  filepath: string;
}

const Notification = () => {
  const { messages, isChatLoading } = useAppSelector((store) => store.openai);
  const dispatch = useAppDispatch();

  const [inputMsg, setInputMsg] = useState("");
  const [attachment, setAttachment] = useState<Array<iAttachment>>([]);
  const [isTagActive, setIsTagActive] = useState(false);
  const [filepaths, setFilepaths] = useState<Array<iGetAllFiles>>([]);

  const handleChangeMsg = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputMsg(val);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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

    if (e.ctrlKey && e.key === "Enter") {
      console.log("Test if CTLR Enter");
      handleSendMsgCodebase();
    } else if (e.key === "Enter") {
      console.log("Test Enter sahaja");
      handleSendMsg();
    }
  };

  const handleSendMsg = () => {
    console.log("attachment", attachment);
    setInputMsg("");
    dispatch(
      setMessage({
        with_context: true,
        message: { role: "user", content: inputMsg, attachments: attachment },
      })
    );
    setAttachment([]);
  };

  const handleSendMsgCodebase = () => {
    if (isAuthenticated()) {
      const username = localStorage.username || "guest";
      const resp = axiosInstance()
        .post(
          "/getcodebase",
          JSON.stringify({
            path_str: "home/" + username,
            username: username,
          })
        )
        .then((res) => {
          const result = res.data.map((item: any) => {
            return {
              filepath: item.filepath,
              message:
                "I attach file " + item.filepath + " : " + item.file_str + ". ",
            };
          });

          setInputMsg("");
          dispatch(
            setMessage({
              with_context: false,
              message: {
                role: "user",
                content: inputMsg,
                attachments: [...attachment, ...result],
              },
            })
          );
        })
        .catch(console.error);
    } else {
      const resp = axiosInstance()
        .post(
          "/ggetcodebase",
          JSON.stringify({
            path_str: "home/guest",
            username: "guest",
          })
        )
        .then((res) => {
          const result = res.data.map((item: any) => {
            return {
              filepath: item.filepath,
              message:
                "I attach file " + item.filepath + " : " + item.file_str + ". ",
            };
          });
          setInputMsg("");
          dispatch(
            setMessage({
              with_context: false,
              message: {
                role: "user",
                content: inputMsg,
                attachments: [...attachment, ...result],
              },
            })
          );
        })
        .catch(console.error);
    }
    setAttachment([]);
  };

  const handleClickChat = () => {
    handleSendMsg();
  };

  const handleClickChatCodebase = () => {
    handleSendMsgCodebase();
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
          setAttachment((prev: iAttachment[]) => {
            const result = {
              filepath: res.data.filepath,
              message:
                "I attach file " +
                res.data.filepath +
                " : " +
                res.data.file_str +
                ". ",
            };
            return [...prev, result];
          });
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
          setAttachment((prev: iAttachment[]) => {
            const result = {
              filepath: res.data.filepath,
              message:
                "I attach file " +
                res.data.filepath +
                " : " +
                res.data.file_str +
                ". ",
            };
            return [...prev, result];
          });
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
    if (filepath) getTextFromPath(filepath);
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
              {message.attachments.length > 0 && (
                <div className="file-context">
                  {message.attachments.map((item, key) => (
                    <a
                      href="#"
                      key={key}
                      onClick={() => dispatch(addFileItem(item.filepath))}
                    >
                      <span className="badge badge-secondary attachment">
                        {item.filepath}
                      </span>
                    </a>
                  ))}
                </div>
              )}
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
        {attachment.map((item, key) => (
          <a
            href="#"
            key={key}
            onClick={() => dispatch(addFileItem(item.filepath))}
          >
            <span className="badge badge-secondary attachment">
              {item.filepath}
            </span>
          </a>
        ))}
        {isChatLoading && <div className="loader"></div>}
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
            <button
              className="btn btn-sm btn-success"
              onClick={handleClickChat}
            >
              Send
            </button>
            <button
              className="btn btn-sm btn-info"
              onClick={handleClickChatCodebase}
            >
              with Codebase
            </button>
          </div>
          {isTagActive && (
            <ul className="suggestions">
              {filepaths.map((filepath, idx) => (
                <li key={idx}>
                  <a onClick={handleClickSuggestion}>
                    <b>{filepath.filename}</b> {filepath.path}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;
