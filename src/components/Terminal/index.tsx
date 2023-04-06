import { useEffect, useRef, useState } from "react";
import { Terminal as XTerminal } from "xterm";
import { AttachAddon } from "xterm-addon-attach";
import { FitAddon } from "xterm-addon-fit";
import { SerializeAddon } from "xterm-addon-serialize";
import { Unicode11Addon } from "xterm-addon-unicode11";
import { WebLinksAddon } from "xterm-addon-web-links";
import { useAppSelector } from "../../store/store";
import "./xterm.css";

type terminalProps = {
  setTerminal: (terminal: XTerminal | null) => void;
  activeMenu: string
};

export function Terminal({ setTerminal, activeMenu }: terminalProps) {
  const [username] = useState(localStorage.username || "guest");
  const url = `${process.env.REACT_APP_BE_WS2}/${username}`;

  const terminalRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const { aktifTabItem } = useAppSelector((store) => store.filetabs);

  useEffect(() => {
    if (terminalRef.current === null) return;

    const term = new XTerminal({
      convertEol: true,
      fontFamily: `Abel, monospace, MesloLGS NF`,
      allowProposedApi: true,
      fontSize: 13,
      fontWeight: 400,
      theme: {
        background: "#1e1e1e",
      },
      // rendererType: "dom" // default is canvas
    });

    term.open(terminalRef.current);

    wsRef.current = new WebSocket(url);

    const webLinksAddon = new WebLinksAddon(
      (event, url) => {
        window.open(url);
      },
      {
        urlRegex: /http:\/\/localhost|https:\/\/bilang.dev/,
      }
    );
    term.loadAddon(webLinksAddon);
    const fitAddOn = new FitAddon();
    fitAddOn.activate(term);
    const unicode11Addon = new Unicode11Addon();
    term.loadAddon(unicode11Addon);
    const serializeAddon = new SerializeAddon();
    term.loadAddon(serializeAddon);
    wsRef.current.onclose = function (event) {
      term.write(
        "\r\n\nconnection has been terminated from the server-side (hit refresh to restart)\n"
      );
      // logout();
    };
    const attachAddon = new AttachAddon(wsRef.current);
    wsRef.current.onopen = function () {
      term.loadAddon(attachAddon);
      // term._initialized = true;
      term.focus();
      setTimeout(function () {
        if (wsRef.current === null) return;
        fitAddOn.fit();
        var dimensions = fitAddOn.proposeDimensions();
        if (dimensions) {
          console.log("dimensions 1:", dimensions.cols, dimensions.rows);
          var size = JSON.stringify({
            cols: dimensions.cols,
            rows: dimensions.rows,
          });
          var send = new TextEncoder().encode("\x01" + size);
          console.log("resizing to", send);
          wsRef.current.send(send);
        }
        if (activeMenu == "run") {
          var cmdStr = "cd " + aktifTabItem.dirpath + "\n";
          wsRef.current.send(cmdStr);

          cmdStr = "clear\ngo build " + aktifTabItem.filepath + "\n";
          wsRef.current.send(cmdStr);

          cmdStr = "go run " + aktifTabItem.filepath + "\n";
          wsRef.current.send(cmdStr);
        }

        if (activeMenu == "debug") {
          var cmdStr = "cd " + aktifTabItem.dirpath + "\n";
          wsRef.current.send(cmdStr);

          cmdStr = "clear\nracket --repl --eval '(enter! (file \"" + aktifTabItem.filepath + "\"))'\n";
          wsRef.current.send(cmdStr);
      }
      });
      term.onResize(function (event) {
        if (wsRef.current === null) return;
        var rows = event.rows;
        var cols = event.cols;
        console.log("dimensions 2:", cols, rows);
        var size = JSON.stringify({ cols: cols, rows: rows });
        var send = new TextEncoder().encode("\x01" + size);
        wsRef.current.send(send);
      });
      term.onTitleChange(function (event) {
        let curPath = "/home/" + username;
        let command = "";
        if (event.includes(":")) {
          let term = event.trim().split(":");
          let len = term.length;
          curPath = term[len - 1];
          if (curPath === "~") {
            curPath = "/home/" + username;
          }
        }
        if (event.includes(" ")) {
          command = event.trim().split(" ")[0];
        } else {
          command = event;
        }
        switch (command) {
          case "quit":
            logout();
            break;
          default:
            break;
        }
      });
      window.onresize = function () {
        var dimensions = fitAddOn.proposeDimensions();
        if (dimensions) {
          if (!(isNaN(dimensions.cols) || isNaN(dimensions.rows))) {
            fitAddOn.fit();
          }
        }
      };
    };
    wsRef.current.onmessage = function (event) {
      var msg = event.data;
      if (msg.length > 1) {
        if (msg.startsWith("failed to start tty:")) {
          logout();
        }
      }
    };

    setTerminal(term);

    return () => {
      // if (wsRef.current) {
      //   wsRef.current.close();
      // }
      term.dispose();
      setTerminal(null);
    };
  }, [terminalRef.current]);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    window.location.href = "/";
  };

  // useEffect(() => {
  //   return () => {
  //     if (wsRef.current) {
  //       wsRef.current.close();
  //     }
  //   };
  // }, [wsRef.current]);

  return <div style={{
    padding: "10px",
    backgroundColor: "#1e1e1e",
    borderRadius: "7px",
    height: "100%"
    }}>
      <div ref={terminalRef}></div>
    </div>;
}
